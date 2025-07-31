// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Search, Mail, Inbox, Send, Archive, Trash2, Settings, RefreshCw, Plus, Loader2 } from "lucide-react";
// import { useEmailStats } from "@/hooks/useEmails";

// interface EmailAccount {
//   id: string;
//   email: string;
//   provider: string;
//   isConnected: boolean;
//   unreadCount: number;
// }

// interface Folder {
//   id: string;
//   name: string;
//   count: number;
//   icon: React.ComponentType<{ className?: string }>;
// }

// const mockAccounts: EmailAccount[] = [
//   { id: "1", email: "work@company.com", provider: "Gmail", isConnected: true, unreadCount: 12 },
//   { id: "2", email: "personal@gmail.com", provider: "Gmail", isConnected: true, unreadCount: 5 },
// ];



// interface EmailSidebarProps {
//   selectedAccount: string | null;
//   selectedFolder: string;
//   selectedCategory: string | null;
//   searchTerm: string;
//   onAccountSelect: (accountId: string | null) => void;
//   onFolderSelect: (folderId: string) => void;
//   onCategorySelect: (categoryId: string | null) => void;
//   onSearchChange: (searchTerm: string) => void;
// }

// export function EmailSidebar({
//   selectedAccount,
//   selectedFolder,
//   selectedCategory,
//   searchTerm,
//   onAccountSelect,
//   onFolderSelect,
//   onCategorySelect,
//   onSearchChange,
// }: EmailSidebarProps) {
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useEmailStats();

//   // Helper functions to get counts
//   const getFolderCount = (folderId: string) => {
//     if (!stats?.folders) return 0;
//     const folder = stats.folders.find(f => f.key.toLowerCase() === folderId);
//     return folder?.doc_count || 0;
//   };

//   const getCategoryCount = (categoryId: string) => {
//     if (!stats?.categories) return 0;
//     const category = stats.categories.find(c => c.key.toLowerCase().replace(' ', '-') === categoryId);
//     return category?.doc_count || 0;
//   };

//   // Compute folders and categories with real data
//   const folders: Folder[] = [
//     { id: "inbox", name: "Inbox", count: getFolderCount("inbox"), icon: Inbox },
//     { id: "sent", name: "Sent", count: getFolderCount("sent"), icon: Send },
//     { id: "archive", name: "Archive", count: getFolderCount("archive"), icon: Archive },
//     { id: "trash", name: "Trash", count: getFolderCount("trash"), icon: Trash2 },
//   ];

//   const categories = [
//     { id: "interested", name: "Interested", count: getCategoryCount("interested"), color: "bg-category-interested" },
//     { id: "meeting-booked", name: "Meeting Booked", count: getCategoryCount("meeting-booked"), color: "bg-category-meeting-booked" },
//     { id: "not-interested", name: "Not Interested", count: getCategoryCount("not-interested"), color: "bg-category-not-interested" },
//     { id: "spam", name: "Spam", count: getCategoryCount("spam"), color: "bg-category-spam" },
//     { id: "out-of-office", name: "Out of Office", count: getCategoryCount("out-of-office"), color: "bg-category-out-of-office" },
//   ];

//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await refetchStats();
//     setIsRefreshing(false);
//   };

//   return (
//     <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
//       {/* Header */}
//       <div className="p-6 border-b border-sidebar-border">
//         <div className="flex items-center justify-between mb-4">
//           <h1 className="text-xl font-bold text-sidebar-foreground">
//             Mail<span className="text-sidebar-primary">Box</span>
//           </h1>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={handleRefresh}
//             disabled={isRefreshing}
//             className="text-sidebar-foreground hover:text-sidebar-primary"
//           >
//             <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
//           </Button>
//         </div>
        
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sidebar-foreground/60 h-4 w-4" />
//           <Input
//             placeholder="Search emails..."
//             value={searchTerm}
//             onChange={(e) => onSearchChange(e.target.value)}
//             className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/60"
//           />
//         </div>
//       </div>

//       <ScrollArea className="flex-1">
//         <div className="p-4 space-y-6">
//           {/* Email Accounts */}
//           <div>
//             <div className="flex items-center justify-between mb-3">
//               <h2 className="text-sm font-semibold text-sidebar-foreground/80 uppercase tracking-wide">
//                 Accounts
//               </h2>
//               <Button variant="ghost" size="xs" className="text-sidebar-primary hover:text-sidebar-primary/80">
//                 <Plus className="h-3 w-3" />
//               </Button>
//             </div>
//             <div className="space-y-1">
//               <Button
//                 variant={selectedAccount === null ? "secondary" : "ghost"}
//                 className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary"
//                 onClick={() => onAccountSelect(null)}
//               >
//                 <Mail className="h-4 w-4 mr-3" />
//                 All Accounts
//                 <Badge variant="secondary" className="ml-auto">
//                   {statsLoading ? (
//                     <Loader2 className="h-3 w-3 animate-spin" />
//                   ) : (
//                     stats?.total || 0
//                   )}
//                 </Badge>
//               </Button>
//               {mockAccounts.map((account) => (
//                 <Button
//                   key={account.id}
//                   variant={selectedAccount === account.id ? "secondary" : "ghost"}
//                   className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary"
//                   onClick={() => onAccountSelect(account.id)}
//                 >
//                   <div className={`h-2 w-2 rounded-full mr-3 ${account.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
//                   <div className="flex-1 text-left">
//                     <div className="text-sm">{account.email}</div>
//                     <div className="text-xs text-sidebar-foreground/60">{account.provider}</div>
//                   </div>
//                   {account.unreadCount > 0 && (
//                     <Badge variant="secondary" className="ml-2">
//                       {account.unreadCount}
//                     </Badge>
//                   )}
//                 </Button>
//               ))}
//             </div>
//           </div>

//           {/* Folders */}
//           <div>
//             <h2 className="text-sm font-semibold text-sidebar-foreground/80 uppercase tracking-wide mb-3">
//               Folders
//             </h2>
//             <div className="space-y-1">
//               {folders.map((folder) => {
//                 const Icon = folder.icon;
//                 return (
//                   <Button
//                     key={folder.id}
//                     variant={selectedFolder === folder.id ? "secondary" : "ghost"}
//                     className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary"
//                     onClick={() => onFolderSelect(folder.id)}
//                   >
//                     <Icon className="h-4 w-4 mr-3" />
//                     {folder.name}
//                     {folder.count > 0 && (
//                       <Badge variant="secondary" className="ml-auto">
//                         {folder.count}
//                       </Badge>
//                     )}
//                   </Button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* AI Categories */}
//           <div>
//             <h2 className="text-sm font-semibold text-sidebar-foreground/80 uppercase tracking-wide mb-3">
//               AI Categories
//             </h2>
//             <div className="space-y-1">
//               <Button
//                 variant={selectedCategory === null ? "secondary" : "ghost"}
//                 className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary"
//                 onClick={() => onCategorySelect(null)}
//               >
//                 All Categories
//               </Button>
//               {categories.map((category) => (
//                 <Button
//                   key={category.id}
//                   variant={selectedCategory === category.id ? "secondary" : "ghost"}
//                   className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary"
//                   onClick={() => onCategorySelect(category.id)}
//                 >
//                   <div className={`h-3 w-3 rounded-full mr-3 ${category.color}`} />
//                   {category.name}
//                   <Badge variant="secondary" className="ml-auto">
//                     {category.count}
//                   </Badge>
//                 </Button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </ScrollArea>

//       {/* Footer */}
//       <div className="p-4 border-t border-sidebar-border">
//         <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary">
//           <Settings className="h-4 w-4 mr-3" />
//           Settings
//         </Button>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Mail, Inbox, Send, Archive, Trash2, Settings, RefreshCw, Plus, Loader2 } from "lucide-react";
import { useEmailStats } from "@/hooks/useEmails";

interface EmailAccount {
  id: string;
  email: string;
  provider: string;
  isConnected: boolean;
  unreadCount: number;
}

interface Folder {
  id: string;
  name: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
}

const mockAccounts: EmailAccount[] = [
  { id: "work@company.com", email: "work@company.com", provider: "Gmail", isConnected: true, unreadCount: 12 },
  { id: "personal@gmail.com", email: "personal@gmail.com", provider: "Gmail", isConnected: true, unreadCount: 5 },
];

interface EmailSidebarProps {
  selectedAccount: string | null;
  selectedFolder: string;
  selectedCategory: string | null;
  searchTerm: string;
  onAccountSelect: (accountId: string | null) => void;
  onFolderSelect: (folderId: string) => void;
  onCategorySelect: (categoryId: string | null) => void;
  onSearchChange: (searchTerm: string) => void;
}

export function EmailSidebar({
  selectedAccount,
  selectedFolder,
  selectedCategory,
  searchTerm,
  onAccountSelect,
  onFolderSelect,
  onCategorySelect,
  onSearchChange,
}: EmailSidebarProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // **THIS HOOK IS UPDATED**
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useEmailStats({
    folder: selectedFolder,
    accountId: selectedAccount || undefined,
    category: selectedCategory || undefined
  });

  const getFolderCount = (folderId: string) => {
    if (!stats?.folders) return 0;
    const folder = stats.folders.find(f => f.key.toLowerCase() === folderId);
    return folder?.doc_count || 0;
  };

  const getCategoryCount = (categoryId: string) => {
    if (!stats?.categories) return 0;
    const category = stats.categories.find(c => c.key.toLowerCase().replace(/ /g, '-') === categoryId);
    return category?.doc_count || 0;
  };

  const folders: Folder[] = [
    { id: "inbox", name: "Inbox", count: getFolderCount("inbox"), icon: Inbox },
    { id: "sent", name: "Sent", count: getFolderCount("sent"), icon: Send },
    { id: "archive", name: "Archive", count: getFolderCount("archive"), icon: Archive },
    { id: "trash", name: "Trash", count: getFolderCount("trash"), icon: Trash2 },
  ];

  const categories = [
    { id: "interested", name: "Interested", count: getCategoryCount("interested"), color: "bg-category-interested" },
    { id: "meeting-booked", name: "Meeting Booked", count: getCategoryCount("meeting-booked"), color: "bg-category-meeting-booked" },
    { id: "not-interested", name: "Not Interested", count: getCategoryCount("not-interested"), color: "bg-category-not-interested" },
    { id: "spam", name: "Spam", count: getCategoryCount("spam"), color: "bg-category-spam" },
    { id: "out-of-office", name: "Out of Office", count: getCategoryCount("out-of-office"), color: "bg-category-out-of-office" },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchStats();
    setIsRefreshing(false);
  };

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-sidebar-foreground">MailBox</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/60 h-4 w-4" />
          <Input
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-sidebar-accent"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-3">Accounts</h2>
            <div className="space-y-1">
              <Button
                variant={selectedAccount === null ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onAccountSelect(null)}
              >
                <Mail className="h-4 w-4 mr-3" />
                All Accounts
                <Badge variant="secondary" className="ml-auto">
                  {statsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : (stats?.total || 0)}
                </Badge>
              </Button>
              {mockAccounts.map((account) => (
                <Button
                  key={account.id}
                  variant={selectedAccount === account.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onAccountSelect(account.id)}
                >
                  <div className={`h-2 w-2 rounded-full mr-3 ${account.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="truncate">{account.email}</span>
                  {account.unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">{account.unreadCount}</Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-3">Folders</h2>
            <div className="space-y-1">
              {folders.map((folder) => (
                <Button
                  key={folder.id}
                  variant={selectedFolder === folder.id && !selectedCategory ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onFolderSelect(folder.id)}
                >
                  <folder.icon className="h-4 w-4 mr-3" />
                  {folder.name}
                  {folder.count > 0 && (
                    <Badge variant="secondary" className="ml-auto">{folder.count}</Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-3">AI Categories</h2>
            <div className="space-y-1">
              <Button
                variant={selectedCategory === null ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onCategorySelect(null)}
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onCategorySelect(category.id)}
                >
                  <div className={`h-3 w-3 rounded-full mr-3 ${category.color}`} />
                  {category.name}
                  {category.count > 0 && (
                    <Badge variant="secondary" className="ml-auto">{category.count}</Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  );
}