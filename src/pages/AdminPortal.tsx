import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Issue, AdminReply, STATUS_LABELS, CATEGORY_LABELS, IssueStatus, CATEGORY_ICONS } from '@/types';
import IssueCard from '@/components/IssueCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Shield, LogOut, BarChart3, CheckCircle, Clock, AlertTriangle, MessageSquare, Send, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPortal() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [newStatus, setNewStatus] = useState<IssueStatus>('reported');
  const [notes, setNotes] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replies, setReplies] = useState<AdminReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => { fetchIssues(); }, []);

  useEffect(() => {
    if (selectedIssue) {
      fetchReplies(selectedIssue.id);
    }
  }, [selectedIssue]);

  const fetchIssues = async () => {
    const { data } = await supabase.from('issues').select('*').order('created_at', { ascending: false });
    setIssues((data as Issue[]) || []);
    setLoading(false);
  };

  const fetchReplies = async (issueId: string) => {
    const { data } = await supabase.from('admin_replies').select('*').eq('issue_id', issueId).order('created_at', { ascending: true });
    setReplies((data as AdminReply[]) || []);
  };

  const updateStatus = async () => {
    if (!selectedIssue || !user) return;
    
    const updateData: Record<string, unknown> = { 
      status: newStatus,
      resolution_notes: newStatus === 'resolved' ? notes : selectedIssue.resolution_notes,
      rejection_reason: newStatus === 'rejected' ? notes : selectedIssue.rejection_reason,
      resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null
    };

    await supabase.from('issues').update(updateData).eq('id', selectedIssue.id);
    
    // Add to timeline
    await supabase.from('issue_timeline').insert({
      issue_id: selectedIssue.id,
      status: newStatus,
      notes: notes || null,
      admin_id: user.id,
      admin_name: user.email?.split('@')[0] || 'Admin'
    });

    toast({ title: 'Status Updated', description: `Issue status changed to ${STATUS_LABELS[newStatus]}` });
    fetchIssues();
  };

  const sendReply = async () => {
    if (!selectedIssue || !user || !replyMessage.trim()) return;
    
    await supabase.from('admin_replies').insert({
      issue_id: selectedIssue.id,
      admin_id: user.id,
      message: replyMessage.trim(),
      is_internal: false
    });

    toast({ title: 'Reply Sent', description: 'Your response has been sent to the student' });
    setReplyMessage('');
    fetchReplies(selectedIssue.id);
  };

  const filteredIssues = issues.filter(issue => {
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
    return true;
  });

  const stats = {
    total: issues.length,
    pending: issues.filter(i => ['reported', 'viewed'].includes(i.status)).length,
    inProgress: issues.filter(i => ['assigned', 'in_progress'].includes(i.status)).length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  };

  const CategoryIcon = selectedIssue ? CATEGORY_ICONS[selectedIssue.category] : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-accent" />
            <div><h1 className="text-xl font-bold">G Resolve</h1><p className="text-xs opacity-80">Admin Portal</p></div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="w-4 h-4 mr-2" />Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 text-center"><BarChart3 className="w-6 h-6 mx-auto mb-2 text-primary" /><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><AlertTriangle className="w-6 h-6 mx-auto mb-2 text-status-pending" /><p className="text-2xl font-bold">{stats.pending}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><Clock className="w-6 h-6 mx-auto mb-2 text-status-in-progress" /><p className="text-2xl font-bold">{stats.inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><CheckCircle className="w-6 h-6 mx-auto mb-2 text-status-resolved" /><p className="text-2xl font-bold">{stats.resolved}</p><p className="text-xs text-muted-foreground">Resolved</p></CardContent></Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center gap-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground ml-auto">{filteredIssues.length} issues</span>
            </div>
          </CardContent>
        </Card>

        <CardHeader className="px-0"><CardTitle>All Issues</CardTitle></CardHeader>
        <div className="space-y-4">
          {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : filteredIssues.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No issues found</CardContent></Card>
          ) : filteredIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} onClick={() => { setSelectedIssue(issue); setNewStatus(issue.status); setNotes(''); }} />
          ))}
        </div>
      </main>

      {/* Issue Detail & Update Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {CategoryIcon && <CategoryIcon className="w-5 h-5 text-primary" />}
              Manage Issue
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="status">Update Status</TabsTrigger>
              <TabsTrigger value="reply">Reply</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <ScrollArea className="max-h-[50vh]">
                <div className="space-y-4 p-1">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedIssue?.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{selectedIssue && CATEGORY_LABELS[selectedIssue.category]}</Badge>
                      <Badge className={`
                        ${selectedIssue?.status === 'resolved' ? 'bg-status-resolved' : ''}
                        ${selectedIssue?.status === 'in_progress' ? 'bg-status-in-progress' : ''}
                        ${selectedIssue?.status === 'assigned' ? 'bg-status-assigned' : ''}
                        ${selectedIssue && ['reported', 'viewed'].includes(selectedIssue.status) ? 'bg-status-pending' : ''}
                        ${selectedIssue?.status === 'rejected' ? 'bg-destructive' : ''}
                      `}>
                        {selectedIssue && STATUS_LABELS[selectedIssue.status]}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground">{selectedIssue?.description}</p>
                  
                  {selectedIssue?.location && <p className="text-sm">📍 {selectedIssue.location}</p>}
                  
                  {selectedIssue?.image_url && <img src={selectedIssue.image_url} alt="Issue" className="rounded-lg max-h-48 object-cover" />}
                  {selectedIssue?.audio_url && <audio src={selectedIssue.audio_url} controls className="w-full" />}
                  
                  <p className="text-xs text-muted-foreground">
                    Reported: {selectedIssue && format(new Date(selectedIssue.created_at), 'PPp')}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="status">
              <div className="space-y-4 p-1">
                <div>
                  <label className="text-sm font-medium">Change Status</label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as IssueStatus)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">
                    {newStatus === 'resolved' ? 'Resolution Notes' : newStatus === 'rejected' ? 'Rejection Reason' : 'Notes (optional)'}
                  </label>
                  <Textarea 
                    placeholder={newStatus === 'resolved' ? 'Describe how the issue was resolved...' : newStatus === 'rejected' ? 'Explain why this issue was rejected...' : 'Add any notes...'}
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <Button onClick={updateStatus} className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="reply">
              <div className="space-y-4 p-1">
                <ScrollArea className="max-h-[30vh] border rounded-lg p-3">
                  {replies.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No replies yet</p>
                  ) : (
                    <div className="space-y-3">
                      {replies.map((reply) => (
                        <div key={reply.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Admin</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(reply.created_at), 'PPp')}
                            </span>
                          </div>
                          <p className="text-sm">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                
                <Separator />
                
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type your reply to the student..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                  />
                  <Button onClick={sendReply} disabled={!replyMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">This reply will be visible to the student in their portal.</p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
