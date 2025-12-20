import { Issue, STATUS_LABELS, CATEGORY_LABELS, PRIORITY_LABELS, IssueStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { 
  Zap, Building2, UtensilsCrossed, Droplets, Shield, 
  Sparkles, Wifi, HelpCircle, MapPin, Clock, ThumbsUp,
  ChevronRight, Image, Volume2
} from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
  showUpvote?: boolean;
  onUpvote?: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  electrical: <Zap className="w-4 h-4" />,
  hostel: <Building2 className="w-4 h-4" />,
  mess_food: <UtensilsCrossed className="w-4 h-4" />,
  plumber: <Droplets className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
  cleaning: <Sparkles className="w-4 h-4" />,
  internet_network: <Wifi className="w-4 h-4" />,
  others: <HelpCircle className="w-4 h-4" />,
};

const statusColors: Record<IssueStatus, string> = {
  reported: 'status-reported',
  viewed: 'status-viewed',
  assigned: 'status-assigned',
  in_progress: 'status-in-progress',
  resolved: 'status-resolved',
  rejected: 'status-rejected',
};

const priorityColors: Record<string, string> = {
  low: 'priority-low',
  medium: 'priority-medium',
  high: 'priority-high',
  urgent: 'priority-urgent',
};

export default function IssueCard({ issue, onClick, showUpvote, onUpvote }: IssueCardProps) {
  return (
    <Card 
      className="hover-lift cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
              {issue.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
              {issue.location && (
                <>
                  <span>•</span>
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{issue.location}</span>
                </>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {issue.description}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Badge */}
          <Badge variant="secondary" className="gap-1">
            {categoryIcons[issue.category]}
            {CATEGORY_LABELS[issue.category]}
          </Badge>

          {/* Status Badge */}
          <Badge className={statusColors[issue.status]}>
            {STATUS_LABELS[issue.status]}
          </Badge>

          {/* Priority Badge */}
          <Badge className={priorityColors[issue.priority]}>
            {PRIORITY_LABELS[issue.priority]}
          </Badge>

          {/* Media indicators */}
          {issue.image_url && (
            <Badge variant="outline" className="gap-1">
              <Image className="w-3 h-3" />
              Image
            </Badge>
          )}
          {issue.audio_url && (
            <Badge variant="outline" className="gap-1">
              <Volume2 className="w-3 h-3" />
              Audio
            </Badge>
          )}
        </div>

        {/* Upvotes */}
        {showUpvote && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              {issue.upvote_count} upvotes
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onUpvote?.();
              }}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Upvote
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
