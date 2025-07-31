// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Textarea } from "@/components/ui/textarea";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Star,
//   Archive,
//   Trash2,
//   MoreHorizontal,
//   Bot,
//   Send,
//   Paperclip,
//   Loader2,
//   Mail
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useEmailById } from "@/hooks/useEmails";
// import DOMPurify from 'dompurify';

// interface EmailDetailProps {
//   emailId: string | null;
// }

// const categoryConfig = {
//     interested: { color: "bg-category-interested text-white", label: "Interested" },
//     "meeting-booked": { color: "bg-category-meeting-booked text-white", label: "Meeting Booked" },
//     "not-interested": { color: "bg-category-not-interested text-white", label: "Not Interested" },
//     spam: { color: "bg-category-spam text-white", label: "Spam" },
//     "out-of-office": { color: "bg-category-out-of-office text-white", label: "Out of Office" },
//     uncategorized: { color: "bg-muted text-muted-foreground", label: "Uncategorized" },
// };

// export function EmailDetail({ emailId }: EmailDetailProps) {
//   const [showRawContent, setShowRawContent] = useState(false);
//   const { data: email, isLoading, error } = useEmailById(emailId);

//   if (!emailId) {
//     return (
//       <div className="flex-1 flex items-center justify-center p-4">
//         <div className="text-center text-muted-foreground">
//           <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
//           <h3 className="text-lg font-semibold">No email selected</h3>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>;
//   }

//   if (error || !email) {
//     return <div className="flex-1 flex items-center justify-center"><p className="text-destructive">Error loading email.</p></div>;
//   }

//   const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
//   const getCategoryConfig = (category: string) => categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.uncategorized;
//   const cleanHtml = DOMPurify.sanitize(email.html);

//   return (
//     <div className="flex-1 bg-background flex flex-col min-w-0">
//       {/* Header */}
//       <div className="p-6 border-b border-border flex-shrink-0">
//         <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4 flex-1 min-w-0">
//                 <Avatar className="h-10 w-10 flex-shrink-0"><AvatarFallback>{getInitials(email.from)}</AvatarFallback></Avatar>
//                 <div className="min-w-0">
//                     <h1 className="text-xl font-bold text-foreground truncate" title={email.subject}>{email.subject}</h1>
//                     <span className="text-sm text-muted-foreground truncate" title={email.from}>{email.from}</span>
//                 </div>
//             </div>
//             <div className="flex items-center gap-2 flex-shrink-0">
//                 <Badge className={cn("text-xs", getCategoryConfig(email.category).color)}>{getCategoryConfig(email.category).label}</Badge>
//                 <Button variant="ghost" size="icon"><Star className="h-5 w-5 text-muted-foreground" /></Button>
//                 <Button variant="ghost" size="icon"><Archive className="h-5 w-5 text-muted-foreground" /></Button>
//                 <Button variant="ghost" size="icon"><Trash2 className="h-5 w-5 text-muted-foreground" /></Button>
//                 <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5 text-muted-foreground" /></Button>
//             </div>
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 flex min-w-0 overflow-hidden">

//         {/* **FIX**: This is the main change. This container now handles scrolling in both directions. */}
//         <ScrollArea className="flex-1 min-w-0">
//             <div className="p-6">
//                 <div className="flex justify-end mb-4">
//                     <Button variant="outline" size="sm" onClick={() => setShowRawContent(!showRawContent)}>
//                         {showRawContent ? 'Show Raw' : 'Show Clean'}
//                     </Button>
//                 </div>
//                 {showRawContent ? (
//                     <pre className="text-sm whitespace-pre-wrap">{email.content || 'No raw text content available.'}</pre>
//                 ) : (
//                     <div
//                         className="prose prose-sm dark:prose-invert max-w-none"
//                         dangerouslySetInnerHTML={{ __html: cleanHtml }}
//                     />
//                 )}
//             </div>
//         </ScrollArea>

//         {/* AI Suggestions Panel (Reduced Width) */}
//         <div className="w-80 border-l border-border bg-accent/20 p-6 flex-shrink-0 flex flex-col">
//             <div className="flex items-center gap-2 mb-4 flex-shrink-0">
//                 <Bot className="h-5 w-5 text-primary" />
//                 <h3 className="font-semibold text-foreground">AI Suggestions</h3>
//             </div>
//             <ScrollArea className="flex-1 mb-4">
//                  {/* AI features can be added back here */}
//             </ScrollArea>
//             <div className="space-y-2 flex-shrink-0">
//                 <Textarea placeholder="Compose your reply..." className="min-h-[100px] bg-background" />
//                 <div className="flex items-center gap-2">
//                     <Button className="flex-1 bg-gradient-ai"><Send className="h-4 w-4 mr-2" />Send</Button>
//                     <Button variant="outline" size="icon"><Paperclip className="h-4 w-4" /></Button>
//                 </div>
//             </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Star,
  Archive,
  Trash2,
  MoreHorizontal,
  Bot,
  Send,
  Paperclip,
  Loader2,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEmailById } from "@/hooks/useEmails";
import DOMPurify from 'dompurify';

interface EmailDetailProps {
  emailId: string | null;
}

const categoryConfig = {
    interested: { color: "bg-category-interested text-white", label: "Interested" },
    "meeting-booked": { color: "bg-category-meeting-booked text-white", label: "Meeting Booked" },
    "not-interested": { color: "bg-category-not-interested text-white", label: "Not Interested" },
    spam: { color: "bg-category-spam text-white", label: "Spam" },
    "out-of-office": { color: "bg-category-out-of-office text-white", label: "Out of Office" },
    uncategorized: { color: "bg-muted text-muted-foreground", label: "Uncategorized" },
};

export function EmailDetail({ emailId }: EmailDetailProps) {
  const [showRawContent, setShowRawContent] = useState(false);
  const { data: email, isLoading, error } = useEmailById(emailId);

  if (!emailId) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No email selected</h3>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  if (error || !email) {
    return <div className="flex-1 flex items-center justify-center"><p className="text-destructive">Error loading email.</p></div>;
  }

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  const getCategoryConfig = (category: string) => categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.uncategorized;
  const cleanHtml = DOMPurify.sanitize(email.html, { ADD_ATTR: ['target'] });

  return (
    <div className="flex-1 bg-background flex flex-col min-w-0">
      {/* Header */}
      <div className="p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <Avatar className="h-10 w-10 flex-shrink-0"><AvatarFallback>{getInitials(email.from)}</AvatarFallback></Avatar>
                <div className="min-w-0">
                    <h1 className="text-xl font-bold text-foreground truncate" title={email.subject}>{email.subject}</h1>
                    <span className="text-sm text-muted-foreground truncate" title={email.from}>{email.from}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={cn("text-xs", getCategoryConfig(email.category).color)}>{getCategoryConfig(email.category).label}</Badge>
                <Button variant="ghost" size="icon"><Star className="h-5 w-5 text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon"><Archive className="h-5 w-5 text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon"><Trash2 className="h-5 w-5 text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5 text-muted-foreground" /></Button>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0 overflow-hidden">

        {/* **FIX**: This container now forces horizontal and vertical scrollbars */}
        <ScrollArea className="flex-1 min-w-0" type="always">
            <div className="p-6">
                <div className="flex justify-end mb-4">
                    <Button variant="outline" size="sm" onClick={() => setShowRawContent(!showRawContent)}>
                        {showRawContent ? 'Show Clean' : 'Show Raw'}
                    </Button>
                </div>
                {showRawContent ? (
                    <pre className="text-sm whitespace-pre-wrap">{email.content || 'No raw text content available.'}</pre>
                ) : (
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: cleanHtml }}
                    />
                )}
            </div>
        </ScrollArea>

        {/* AI Suggestions Panel (Reduced Width) */}
        <div className="w-80 border-l border-border bg-accent/20 p-6 flex-shrink-0 flex flex-col">
            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <Bot className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">AI Suggestions</h3>
            </div>
            <ScrollArea className="flex-1 mb-4">
                 {/* AI features can be added back here */}
            </ScrollArea>
            <div className="space-y-2 flex-shrink-0">
                <Textarea placeholder="Compose your reply..." className="min-h-[100px] bg-background" />
                <div className="flex items-center gap-2">
                    <Button className="flex-1 bg-gradient-ai"><Send className="h-4 w-4 mr-2" />Send</Button>
                    <Button variant="outline" size="icon"><Paperclip className="h-4 w-4" /></Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}