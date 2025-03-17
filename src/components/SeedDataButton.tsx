
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
      
      if (result && result.success) {
        toast({
          title: "Example workflows loaded",
          description: "You can now select example workflows when creating a new chat."
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
      {isSeeding ? 'Loading examples...' : 'Load example workflows'}
    </Button>
  );
};

export default SeedDataButton;
