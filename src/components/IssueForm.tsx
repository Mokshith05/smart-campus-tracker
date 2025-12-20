import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IssueCategory, CATEGORY_LABELS, PriorityLevel, PRIORITY_LABELS } from '@/types';
import { Upload, Mic, MicOff, Loader2, Sparkles, MapPin, Send, X } from 'lucide-react';

interface IssueFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function IssueForm({ onSuccess, onCancel }: IssueFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('others');
  const [aiCategory, setAiCategory] = useState<IssueCategory | null>(null);
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access to record audio.',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const removeAudio = () => {
    setAudioBlob(null);
  };

  const classifyWithAI = async () => {
    if (!description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Description Required',
        description: 'Please provide a description to classify the issue.',
      });
      return;
    }

    setClassifying(true);
    try {
      const response = await supabase.functions.invoke('classify-issue', {
        body: { description, imageUrl: imagePreview },
      });

      if (response.error) throw response.error;

      const detectedCategory = response.data.category as IssueCategory;
      setAiCategory(detectedCategory);
      setCategory(detectedCategory);

      toast({
        title: 'AI Classification Complete',
        description: `Detected category: ${CATEGORY_LABELS[detectedCategory]}`,
      });
    } catch (error) {
      console.error('Classification error:', error);
      toast({
        variant: 'destructive',
        title: 'Classification Failed',
        description: 'Could not classify the issue. Please select a category manually.',
      });
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim() || !description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a title and description.',
      });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      let audioUrl = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('issue-attachments')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('issue-attachments')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      // Upload audio if provided
      if (audioBlob) {
        const fileName = `${user.id}/${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage
          .from('issue-attachments')
          .upload(fileName, audioBlob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('issue-attachments')
          .getPublicUrl(fileName);
        audioUrl = publicUrl;
      }

      // Create issue
      const { error: insertError } = await supabase.from('issues').insert({
        user_id: user.id,
        title,
        description,
        category,
        ai_detected_category: aiCategory,
        priority,
        location: location || null,
        image_url: imageUrl,
        audio_url: audioUrl,
      });

      if (insertError) throw insertError;

      toast({
        title: 'Issue Reported',
        description: 'Your issue has been submitted successfully.',
      });
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not submit your issue. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          Report an Issue
        </CardTitle>
        <CardDescription>
          Describe your issue and our AI will help categorize it
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              placeholder="Brief title for your issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {description.length}/1000 characters
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={classifyWithAI}
                disabled={classifying || !description.trim()}
              >
                {classifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Classifying...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Auto-Classify with AI
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="e.g., Hostel A, Room 205"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
                maxLength={100}
              />
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category {aiCategory && <span className="text-accent">(AI detected)</span>}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as IssueCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as PriorityLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Attach Image</Label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6"
                  onClick={removeImage}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Upload Image</span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Audio Recording */}
          <div className="space-y-2">
            <Label>Voice Description</Label>
            <div className="flex items-center gap-4">
              {!audioBlob ? (
                <Button
                  type="button"
                  variant={recording ? 'destructive' : 'outline'}
                  onClick={recording ? stopRecording : startRecording}
                >
                  {recording ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <audio src={URL.createObjectURL(audioBlob)} controls className="h-10" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={removeAudio}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {recording && (
                <span className="text-sm text-destructive animate-pulse">
                  Recording...
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Issue
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
