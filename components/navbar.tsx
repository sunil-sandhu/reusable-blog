"use client";

import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "./theme-switcher";

const navItems = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Topics",
    href: "/topics",
  },
  {
    label: "Authors",
    href: "/authors",
  },
];

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 h-12 bg-background border-b border-border z-50">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex flex-row gap-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-md font-bold  ${
                  isActive(item.href) ? "text-brand" : "text-foreground"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <ThemeSwitcher />
        </div>
        {/* Navigation Links - Empty for now */}
        <div className="hidden md:flex items-center space-x-8">
          {/* Links will go here */}
        </div>
      </div>
    </nav>
  );
}
