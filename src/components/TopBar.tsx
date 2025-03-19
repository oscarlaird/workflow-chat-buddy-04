
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import UserIndicator from "./UserIndicator";
import ExtensionStatusIndicator from "./ExtensionStatusIndicator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface TopBarProps {
  username?: string;
}

const TopBar = ({ username = "User" }: TopBarProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by rendering only after mount
  if (!mounted) {
    return (
      <div className="h-14 bg-background border-b border-border flex items-center justify-between px-4">
        <div className="w-full animate-pulse h-8 bg-muted rounded-md" />
      </div>
    );
  }

  return (
    <div className="h-14 bg-background border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold mr-4">Workflow Chat</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <ExtensionStatusIndicator />
        
        <ToggleGroup type="single" value={theme} onValueChange={(value) => value && setTheme(value)}>
          <ToggleGroupItem value="light" aria-label="Light mode">
            <Sun className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Dark mode">
            <Moon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        
        <UserIndicator username={username} className="h-9 px-2" />
      </div>
    </div>
  );
};

export default TopBar;
