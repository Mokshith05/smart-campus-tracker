import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Zap, Users, BarChart3 } from 'lucide-react';

const Index = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(role === 'admin' ? '/admin' : '/student');
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-primary-foreground">
          <Shield className="w-8 h-8 text-accent" />
          <span className="text-xl font-bold">CampusResolve</span>
        </div>
        <Button variant="secondary" onClick={() => navigate('/auth')}>
          Get Started <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in">
          AI-Powered Campus
          <span className="block text-accent">Issue Resolution</span>
        </h1>
        <p className="text-xl text-primary-foreground/80 max-w-2xl mb-8 animate-fade-in animation-delay-200">
          Report issues instantly, track resolutions in real-time, and hold departments accountable with our transparent system.
        </p>
        <Button size="lg" onClick={() => navigate('/auth')} className="animate-fade-in animation-delay-300">
          <Zap className="w-5 h-5 mr-2" />
          Start Reporting Issues
        </Button>

        <div className="grid md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl">
          {[
            { icon: Zap, title: 'AI Classification', desc: 'Issues auto-categorized by AI' },
            { icon: Users, title: 'Real-time Tracking', desc: 'Follow your issue live' },
            { icon: BarChart3, title: 'Full Transparency', desc: 'Department accountability' },
          ].map((f, i) => (
            <div key={i} className={`glass-card rounded-xl p-6 text-left animate-fade-in animation-delay-${(i + 3) * 100}`}>
              <f.icon className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-lg font-semibold text-primary-foreground">{f.title}</h3>
              <p className="text-primary-foreground/70 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
