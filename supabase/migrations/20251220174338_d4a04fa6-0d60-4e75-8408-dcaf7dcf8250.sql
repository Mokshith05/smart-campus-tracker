-- Create enum types for the system
CREATE TYPE public.app_role AS ENUM ('student', 'admin');
CREATE TYPE public.issue_status AS ENUM ('reported', 'viewed', 'assigned', 'in_progress', 'resolved', 'rejected');
CREATE TYPE public.issue_category AS ENUM ('electrical', 'hostel', 'mess_food', 'plumber', 'security', 'cleaning', 'internet_network', 'others');
CREATE TYPE public.priority_level AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  UNIQUE(user_id, role)
);

-- Create issues table
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category issue_category NOT NULL DEFAULT 'others',
  ai_detected_category issue_category,
  status issue_status NOT NULL DEFAULT 'reported',
  priority priority_level NOT NULL DEFAULT 'medium',
  location TEXT,
  image_url TEXT,
  audio_url TEXT,
  upvote_count INTEGER DEFAULT 0,
  is_duplicate BOOLEAN DEFAULT FALSE,
  duplicate_of UUID REFERENCES public.issues(id),
  assigned_to TEXT,
  resolution_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create issue_timeline table for status tracking
CREATE TABLE public.issue_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
  status issue_status NOT NULL,
  notes TEXT,
  admin_id UUID REFERENCES auth.users(id),
  admin_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create issue_upvotes table
CREATE TABLE public.issue_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(issue_id, user_id)
);

-- Create issue_ratings table
CREATE TABLE public.issue_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(issue_id, user_id)
);

-- Create admin_replies table
CREATE TABLE public.admin_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergency_contacts table
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies (only admins can modify)
CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert their own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Issues policies
CREATE POLICY "Users can view all issues" ON public.issues FOR SELECT USING (true);
CREATE POLICY "Users can create their own issues" ON public.issues FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own issues" ON public.issues FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all issues" ON public.issues FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete issues" ON public.issues FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Issue timeline policies
CREATE POLICY "Anyone can view timeline" ON public.issue_timeline FOR SELECT USING (true);
CREATE POLICY "Admins can insert timeline" ON public.issue_timeline FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() IN (SELECT user_id FROM public.issues WHERE id = issue_id));

-- Issue upvotes policies
CREATE POLICY "Anyone can view upvotes" ON public.issue_upvotes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upvote" ON public.issue_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their upvote" ON public.issue_upvotes FOR DELETE USING (auth.uid() = user_id);

-- Issue ratings policies
CREATE POLICY "Anyone can view ratings" ON public.issue_ratings FOR SELECT USING (true);
CREATE POLICY "Issue owners can rate" ON public.issue_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin replies policies
CREATE POLICY "Anyone can view public replies" ON public.admin_replies FOR SELECT USING (is_internal = false OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create replies" ON public.admin_replies FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Emergency contacts (public read)
CREATE POLICY "Anyone can view emergency contacts" ON public.emergency_contacts FOR SELECT USING (true);
CREATE POLICY "Admins can manage emergency contacts" ON public.emergency_contacts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger function for new user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default emergency contacts
INSERT INTO public.emergency_contacts (name, phone, category, icon, priority) VALUES
  ('Campus Security', '1800-100-100', 'security', 'Shield', 1),
  ('Ambulance', '108', 'medical', 'Ambulance', 2),
  ('Hostel Warden', '1800-200-200', 'hostel', 'Building2', 3),
  ('Fire Department', '101', 'fire', 'Flame', 4),
  ('Police', '100', 'police', 'Badge', 5);

-- Create storage bucket for issue attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('issue-attachments', 'issue-attachments', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'issue-attachments' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can view attachments" ON storage.objects FOR SELECT USING (bucket_id = 'issue-attachments');
CREATE POLICY "Users can update their uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'issue-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their uploads" ON storage.objects FOR DELETE USING (bucket_id = 'issue-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);