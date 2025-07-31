import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  Star, 
  Archive, 
  Trash2, 
  MoreHorizontal,
  Paperclip,
  Bot,
  Send,
  Sparkles,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEmailsForUI } from "@/hooks/useEmails";
import { useCategorizeEmail } from "@/hooks/useEmails";

interface EmailDetailProps {
  emailId: string | null;
}

const mockEmailDetail = {
  id: "1",
  from: "Sarah Johnson",
  fromEmail: "sarah.johnson@techcorp.com",
  to: "work@company.com",
  subject: "Regarding the Frontend Developer Position",
  timestamp: "Today at 2:15 PM",
  isRead: false,
  isStarred: true,
  hasAttachment: false,
  category: "interested" as const,
  content: `Hi there,

I hope this email finds you well. I came across your profile on LinkedIn and I'm impressed with your extensive React expertise and full-stack development skills.

We have an exciting opportunity for a Senior Frontend Developer position at TechCorp, and I believe you would be a perfect fit for our team. Here are some key details about the role:

• Lead frontend development using React, TypeScript, and Next.js
• Work with a modern tech stack including GraphQL and Node.js
• Collaborate with our design team to create exceptional user experiences
• Competitive salary range: $120,000 - $150,000
• Full remote work flexibility
• Excellent benefits package

Would you be interested in discussing this opportunity further? I'd love to schedule a brief call to learn more about your background and share additional details about the position.

Looking forward to hearing from you!

Best regards,
Sarah Johnson
Senior Technical Recruiter
TechCorp Solutions
sarah.johnson@techcorp.com
(555) 123-4567`,
  suggestedReplies: [
    {
      id: "1",
      title: "Interested & Available",
      content: "Hi Sarah,\n\nThank you for reaching out! I'm very interested in the Senior Frontend Developer position at TechCorp. The role sounds like an excellent fit for my skills and experience.\n\nI'd be happy to schedule a call to discuss this opportunity further. I'm available this week for a conversation.\n\nLooking forward to hearing from you!\n\nBest regards"
    },
    {
      id: "2", 
      title: "Request More Details",
      content: "Hi Sarah,\n\nThank you for your email about the Frontend Developer position. I'm interested in learning more about this opportunity.\n\nCould you please provide additional details about:\n• The team structure and size\n• Primary technologies and tools used\n• Timeline for the hiring process\n\nI look forward to discussing this further.\n\nBest regards"
    },
    {
      id: "3",
      title: "Schedule Meeting",
      content: "Hi Sarah,\n\nI'm very interested in this opportunity! The role aligns perfectly with my experience and career goals.\n\nI'm available for a call this week. You can book a time that works for you here: https://cal.com/myprofile\n\nLooking forward to our conversation!\n\nBest regards"
    }
  ]
};

const categoryConfig = {
  interested: { color: "bg-category-interested text-white", label: "Interested" },
  "meeting-booked": { color: "bg-category-meeting-booked text-white", label: "Meeting Booked" },
  "not-interested": { color: "bg-category-not-interested text-white", label: "Not Interested" },
  spam: { color: "bg-category-spam text-white", label: "Spam" },
  "out-of-office": { color: "bg-category-out-of-office text-white", label: "Out of Office" },
  uncategorized: { color: "bg-muted text-muted-foreground", label: "Uncategorized" },
};

export function EmailDetail({ emailId }: EmailDetailProps) {
  const [replyContent, setReplyContent] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [showRawContent, setShowRawContent] = useState(false);
  const categorizeEmail = useCategorizeEmail();

  // Get the selected email from the list
  const { emails } = useEmailsForUI({ limit: 1000 }); // Get all emails to find the selected one
  const email = emails.find(e => e.id === emailId);

  if (!emailId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No email selected</h3>
          <p>Select an email from the list to view its contents</p>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold mb-2">Loading email...</h3>
          <p>Please wait while we fetch the email details</p>
        </div>
      </div>
    );
  }
  const getInitials = (name: string | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getCategoryConfig = (category: string) => {
    return categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.uncategorized;
  };

  const renderEmailContent = (content: string) => {
    // Remove HTML tags and CSS
    const cleanContent = content
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/&nbsp;/g, ' ') // Replace HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    // Split into paragraphs and filter out empty lines
    const paragraphs = cleanContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return paragraphs.map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  const handleSuggestionSelect = (suggestion: any) => {
    setReplyContent(suggestion.content);
    setSelectedSuggestion(suggestion.id);
  };

  return (
    <div className="flex-1 bg-background flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card/50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                {getInitials(email.from)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-2">{email.subject || 'No Subject'}</h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium text-foreground">{email.from || 'Unknown Sender'}</span>
                <Badge className={cn("text-xs px-3 py-1", getCategoryConfig(email.category).color)}>
                  {getCategoryConfig(email.category).label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                <span>From: <span className="font-medium">{email.from || 'Unknown'}</span></span>
                <span>To: <span className="font-medium">{email.to || 'Unknown'}</span></span>
                <span className="font-medium">{email.timestamp || 'Unknown'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Star className={cn("h-5 w-5", email.isStarred ? "text-yellow-500 fill-current" : "text-muted-foreground")} />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Archive className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Email Content */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Email Content</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawContent(!showRawContent)}
            >
              {showRawContent ? 'Show Clean' : 'Show Raw'}
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="prose prose-sm max-w-none text-foreground">
              {showRawContent ? (
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded">
                  {email.content || 'No content available'}
                </pre>
              ) : (
                renderEmailContent(email.content || '')
              )}
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
            <Button className="bg-gradient-ai hover:shadow-glow transition-all duration-300">
              <Bot className="h-4 w-4 mr-2" />
              Reply with AI
            </Button>
            <Button variant="outline" className="hover:bg-primary/10 hover:border-primary">
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
            <Button variant="outline" className="hover:bg-primary/10 hover:border-primary">
              <ReplyAll className="h-4 w-4 mr-2" />
              Reply All
            </Button>
            <Button variant="outline" className="hover:bg-primary/10 hover:border-primary">
              <Forward className="h-4 w-4 mr-2" />
              Forward
            </Button>
          </div>
        </div>

        {/* AI Suggestions Panel */}
        <div className="w-96 border-l border-border bg-accent/20 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">AI Suggested Replies</h3>
          </div>

          <div className="space-y-4 mb-6">
            {(email.suggestedReplies || []).map((suggestion) => (
              <Card 
                key={suggestion.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedSuggestion === suggestion.id && "ring-2 ring-primary shadow-glow"
                )}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{suggestion.title}</h4>
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {suggestion.content.substring(0, 120)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reply Composer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Compose Reply</h4>
              {selectedSuggestion && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setReplyContent("");
                    setSelectedSuggestion(null);
                  }}
                  className="text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            
            <Textarea
              placeholder="Type your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[200px] resize-none"
            />

            <div className="flex items-center gap-2">
              <Button 
                className="flex-1 bg-gradient-ai hover:shadow-glow"
                disabled={!replyContent.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Reply
              </Button>
              <Button variant="outline" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fix missing import
function Mail({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}