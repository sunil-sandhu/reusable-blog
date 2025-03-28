"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Laptop, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage and system preference on mount
    const savedTheme = localStorage.theme;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add("dark");
      setTheme(savedTheme || "system");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme(savedTheme || "system");
    }

    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);

    if (newTheme === "dark") {
      localStorage.theme = "dark";
      document.documentElement.classList.add("dark");
    } else if (newTheme === "light") {
      localStorage.theme = "light";
      document.documentElement.classList.remove("dark");
    } else {
      localStorage.removeItem("theme");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  if (!mounted) return null;

  const ICON_SIZE = 16;

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun size={ICON_SIZE} className="text-muted-foreground" />;
      case "dark":
        return <Moon size={ICON_SIZE} className="text-muted-foreground" />;
      default:
        return <Laptop size={ICON_SIZE} className="text-muted-foreground" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"sm"}>
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="start">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) =>
            handleThemeChange(value as "light" | "dark" | "system")
          }
        >
          <DropdownMenuRadioItem className="flex gap-2" value="light">
            <Sun size={ICON_SIZE} className="text-muted-foreground" />
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="dark">
            <Moon size={ICON_SIZE} className="text-muted-foreground" />
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="system">
            <Laptop size={ICON_SIZE} className="text-muted-foreground" />
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };
