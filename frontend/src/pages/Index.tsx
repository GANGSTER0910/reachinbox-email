import { useState } from "react";
import { EmailSidebar } from "@/components/EmailSidebar";
import { EmailList } from "@/components/EmailList";
import { EmailDetail } from "@/components/EmailDetail";

const Index = () => {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEmailSelect = (emailId: string) => {
    console.log('🎯 Index: Email selected:', emailId);
    setSelectedEmailId(emailId);
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <EmailSidebar
        selectedAccount={selectedAccount}
        selectedFolder={selectedFolder}
        selectedCategory={selectedCategory}
        searchTerm={searchTerm}
        onAccountSelect={setSelectedAccount}
        onFolderSelect={setSelectedFolder}
        onCategorySelect={setSelectedCategory}
        onSearchChange={setSearchTerm}
      />
      
      <div className="flex flex-1 min-w-0">
        <EmailList
          selectedEmailId={selectedEmailId}
          onEmailSelect={handleEmailSelect}
          searchTerm={searchTerm}
          selectedAccount={selectedAccount}
          selectedFolder={selectedFolder}
          selectedCategory={selectedCategory}
        />
        
        <EmailDetail 
          emailId={selectedEmailId}
          // searchTerm={searchTerm}
          // selectedAccount={selectedAccount}
          // selectedFolder={selectedFolder}
          // selectedCategory={selectedCategory} 
        />
      </div>
    </div>
  );
};

export default Index;