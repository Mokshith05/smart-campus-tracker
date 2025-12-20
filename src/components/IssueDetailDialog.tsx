import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Issue, AdminReply, IssueTimeline, STATUS_LABELS, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { MessageSquare, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';

interface IssueDetailDialogProps {
  issue: Issue | null;
  open: boolean;
  onClose: () => void;
}

export default function IssueDetailDialog({ issue, open, onClose }: IssueDetailDialogProps) {
  const [replies, setReplies] = useState<AdminReply[]>([]);
  const [timeline, setTimeline] = useState<IssueTimeline[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (issue && open) {
      fetchRepliesAndTimeline();
    }
  }, [issue, open]);

  const fetchRepliesAndTimeline = async () => {
    if (!issue) return;
    setLoading(true);
    
    const [repliesResult, timelineResult] = await Promise.all([
      supabase.from('admin_replies').select('*').eq('issue_id', issue.id).order('created_at', { ascending: true }),
      supabase.from('issue_timeline').select('*').eq('issue_id', issue.id).order('created_at', { ascending: true })
    ]);

    setReplies((repliesResult.data as AdminReply[]) || []);
    setTimeline((timelineResult.data as IssueTimeline[]) || []);
    setLoading(false);
  };

  if (!issue) return null;

  const CategoryIcon = CATEGORY_ICONS[issue.category];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {CategoryIcon && <CategoryIcon className="w-5 h-5 text-primary" />}
            {issue.title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-6">
            {/* Issue Info */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{CATEGORY_LABELS[issue.category]}</Badge>
                <Badge className={`
                  ${issue.status === 'resolved' ? 'bg-status-resolved' : ''}
                  ${issue.status === 'in_progress' ? 'bg-status-in-progress' : ''}
                  ${issue.status === 'assigned' ? 'bg-status-assigned' : ''}
                  ${['reported', 'viewed'].includes(issue.status) ? 'bg-status-pending' : ''}
                  ${issue.status === 'rejected' ? 'bg-destructive' : ''}
                `}>
                  {STATUS_LABELS[issue.status]}
                </Badge>
              </div>
              
              <p className="text-muted-foreground">{issue.description}</p>
              
              {issue.location && (
                <p className="text-sm text-muted-foreground">📍 {issue.location}</p>
              )}

              {issue.image_url && (
                <img src={issue.image_url} alt="Issue" className="rounded-lg max-h-48 object-cover" />
              )}

              {issue.audio_url && (
                <audio src={issue.audio_url} controls className="w-full" />
              )}

              {issue.resolution_notes && (
                <div className="p-3 bg-status-resolved/10 rounded-lg border border-status-resolved/20">
                  <p className="text-sm font-medium text-status-resolved flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Resolution Notes
                  </p>
                  <p className="text-sm mt-1">{issue.resolution_notes}</p>
                </div>
              )}

              {issue.rejection_reason && (
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-sm font-medium text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Rejection Reason
                  </p>
                  <p className="text-sm mt-1">{issue.rejection_reason}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Reported: {format(new Date(issue.created_at), 'PPp')}
              </p>
            </div>

            <Separator />

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Timeline
                </h4>
                <div className="space-y-2">
                  {timeline.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{STATUS_LABELS[entry.status]}</p>
                        {entry.admin_name && <p className="text-xs text-muted-foreground">By: {entry.admin_name}</p>}
                        {entry.notes && <p className="text-muted-foreground">{entry.notes}</p>}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.created_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Replies */}
            {replies.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Admin Responses
                  </h4>
                  <div className="space-y-3">
                    {replies.map((reply) => (
                      <div key={reply.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Admin</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(reply.created_at), 'PPp')}
                          </span>
                        </div>
                        <p className="text-sm">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {loading && (
              <p className="text-center text-muted-foreground py-4">Loading...</p>
            )}

            {!loading && replies.length === 0 && timeline.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No updates yet</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
