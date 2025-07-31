import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Paperclip, Reply, Forward, Trash2, Archive, Bot, Loader2 } from "lucide-react";
import { cn, extractEmailInfo } from "@/lib/utils";
import { useEmailsForUI } from "@/hooks/useEmails";
import { useToast } from "@/hooks/use-toast";

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  category: "interested" | "meeting-booked" | "not-interested" | "spam" | "out-of-office" | "uncategorized";
  account: string;
}


  const categoryConfig = {
    interested: { color: "bg-category-interested text-white", label: "Interested" },
    "meeting-booked": { color: "bg-category-meeting-booked text-white", label: "Meeting Booked" },
    "not-interested": { color: "bg-category-not-interested text-white", label: "Not Interested" },
    spam: { color: "bg-category-spam text-white", label: "Spam" },
    "out-of-office": { color: "bg-category-out-of-office text-white", label: "Out of Office" },
    uncategorized: { color: "bg-muted text-muted-foreground", label: "Uncategorized" },
  };

interface EmailListProps {
  selectedEmailId: string | null;
  onEmailSelect: (emailId: string) => void;
  searchTerm: string;
  selectedAccount: string | null;
  selectedFolder: string;
  selectedCategory: string | null;
}

export function EmailList({
  selectedEmailId,
  onEmailSelect,
  searchTerm,
  selectedAccount,
  selectedFolder,
  selectedCategory,
}: EmailListProps) {
  const { toast } = useToast();
  
  // Use real API data instead of mock data
  const { emails, isLoading, error, refetch } = useEmailsForUI({
    query: searchTerm,
    folder: selectedFolder,
    accountId: selectedAccount || undefined,
    category: selectedCategory || undefined,
    limit: 100, // Increased to get more emails from 30 days
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex-1 bg-background border-r border-border flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p>Loading emails...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex-1 bg-background border-r border-border flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-destructive mb-4">Failed to load emails</p>
          <Button 
            onClick={() => {
              refetch();
              toast({
                title: "Retrying...",
                description: "Attempting to reload emails.",
              });
            }} 
            variant="outline"
          >
            Try Again
          </Button>
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

  return (
    <div className="flex-1 bg-background border-r border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {selectedFolder.charAt(0).toUpperCase() + selectedFolder.slice(1)}
            </h2>
            <p className="text-muted-foreground mt-1">
              {emails.length} emails
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Email List */}
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="divide-y divide-border">
          {emails.map((email) => (
            <div
              key={email.id}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:bg-accent/50",
                selectedEmailId === email.id && "bg-accent border-l-4 border-l-primary",
                !email.isRead && "bg-accent/20"
              )}
              onClick={() => onEmailSelect(email.id)}
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(email.from)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        "font-semibold text-foreground truncate",
                        !email.isRead && "font-bold"
                      )}>
                        {email.from}
                      </h3>
                      <Badge 
                        className={cn("text-xs px-2 py-0.5", getCategoryConfig(email.category).color)}
                      >
                        {getCategoryConfig(email.category).label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {email.timestamp}
                      </span>
                      {email.hasAttachment && (
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Toggle star
                        }}
                        className={cn(
                          "p-0 h-auto",
                          email.isStarred ? "text-yellow-500" : "text-muted-foreground"
                        )}
                      >
                        <Star className={cn("h-4 w-4", email.isStarred && "fill-current")} />
                      </Button>
                    </div>
                  </div>

                  <h4 className={cn(
                    "text-sm mb-1 line-clamp-2",
                    !email.isRead ? "font-semibold text-foreground" : "text-foreground/80"
                  )}>
                    {email.subject || 'No Subject'}
                  </h4>

                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {email.preview || 'No preview available'}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      {email.account}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="xs" 
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle AI reply
                        }}
                      >
                        <Bot className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="xs" className="text-muted-foreground hover:text-foreground">
                        <Reply className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="xs" className="text-muted-foreground hover:text-foreground">
                        <Forward className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}