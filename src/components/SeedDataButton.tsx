
import { Button } from "@/components/ui/button";
import { seedMockData } from "@/utils/seedMockData";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export const SeedDataButton = () => {
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (isSeeding) return;
    
    setIsSeeding(true);
    try {
      await seedMockData();
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
      {isSeeding ? 'Seeding...' : 'Seed Sample Data'}
    </Button>
  );
};

export default SeedDataButton;
