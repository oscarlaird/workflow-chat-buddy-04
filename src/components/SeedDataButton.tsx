
import { Button } from "@/components/ui/button";
import { seedMockData } from "@/utils/seedMockData";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const SeedDataButton = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    if (isSeeding) return;
    
    setIsSeeding(true);
    try {
      const result = await seedMockData();
      
      if (result && result.chatId) {
        // Redirect to the newly seeded conversation
        window.location.href = `/?id=${result.chatId}`;
        
        toast({
          title: "Example workflow loaded",
          description: "You can now explore the Vote Data Scraping workflow."
        });
      }
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button 
      onClick={handleSeed} 
      variant="outline" 
      size="sm"
      disabled={isSeeding}
      className="gap-2 text-xs"
    >
      {isSeeding && <Loader2 className="h-3 w-3 animate-spin" />}
      {isSeeding ? 'Loading example...' : 'Load example workflow'}
    </Button>
  );
};

export default SeedDataButton;
