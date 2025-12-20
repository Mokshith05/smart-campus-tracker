import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Issue } from '@/types';
import IssueForm from '@/components/IssueForm';
import IssueCard from '@/components/IssueCard';
import SOSSection from '@/components/SOSSection';
import IssueDetailDialog from '@/components/IssueDetailDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LogOut, Shield, FileText, Clock } from 'lucide-react';

export default function StudentPortal() {
  const { user, signOut } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    if (user) {
      fetchIssues();
      fetchAllIssues();
    }
  }, [user]);

  const fetchIssues = async () => {
    const { data } = await supabase
      .from('issues')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    setIssues((data as Issue[]) || []);
    setLoading(false);
  };

  const fetchAllIssues = async () => {
    const { data } = await supabase
      .from('issues')
      .select('*')
      .neq('status', 'resolved')
      .order('created_at', { ascending: false })
      .limit(20);
    setAllIssues((data as Issue[]) || []);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-accent" />
            <div>
              <h1 className="text-xl font-bold">G Resolve</h1>
              <p className="text-xs opacity-80">Student Portal</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* SOS Section */}
        <SOSSection />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-primary">{issues.length}</p>
              <p className="text-xs text-muted-foreground">My Issues</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-status-in-progress">
                {issues.filter(i => i.status === 'in_progress').length}
              </p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-status-resolved">
                {issues.filter(i => i.status === 'resolved').length}
              </p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Button */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="w-full" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Report New Issue
          </Button>
        )}

        {/* Issue Form */}
        {showForm && (
          <IssueForm onSuccess={() => { setShowForm(false); fetchIssues(); }} onCancel={() => setShowForm(false)} />
        )}

        {/* Tabs */}
        <Tabs defaultValue="my-issues">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-issues"><FileText className="w-4 h-4 mr-2" />My Issues</TabsTrigger>
            <TabsTrigger value="public"><Clock className="w-4 h-4 mr-2" />Public Issues</TabsTrigger>
          </TabsList>
          <TabsContent value="my-issues" className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : issues.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No issues reported yet</CardContent></Card>
            ) : (
              issues.map(issue => <IssueCard key={issue.id} issue={issue} onClick={() => setSelectedIssue(issue)} />)
            )}
          </TabsContent>
          <TabsContent value="public" className="space-y-4 mt-4">
            {allIssues.map(issue => <IssueCard key={issue.id} issue={issue} showUpvote onClick={() => setSelectedIssue(issue)} />)}
          </TabsContent>
        </Tabs>
      </main>

      {/* Issue Detail Dialog */}
      <IssueDetailDialog 
        issue={selectedIssue} 
        open={!!selectedIssue} 
        onClose={() => setSelectedIssue(null)} 
      />
    </div>
  );
}
