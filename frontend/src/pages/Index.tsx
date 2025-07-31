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
      
      <EmailList
        selectedEmailId={selectedEmailId}
        onEmailSelect={setSelectedEmailId}
        searchTerm={searchTerm}
        selectedAccount={selectedAccount}
        selectedFolder={selectedFolder}
        selectedCategory={selectedCategory}
      />
      
      <EmailDetail emailId={selectedEmailId} />
    </div>
  );
};

export default Index;