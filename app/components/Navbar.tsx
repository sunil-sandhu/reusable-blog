export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-12 bg-background border-b border-border z-50">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex flex-row gap-4">
            <a href="/" className="text-md font-bold text-foreground">
              Home
            </a>
            <a href="/blog" className="text-md font-bold text-foreground">
              Blog
            </a>
          </div>

          {/* Navigation Links - Empty for now */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Links will go here */}
          </div>
        </div>
      </div>
    </nav>
  );
}
