export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Footer sections will go here */}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()}{" "}
              {process.env.NEXT_PUBLIC_WEBSITE_NAME || "The Blog"}. All rights
              reserved.
            </p>
            {/* Social links will go here */}
            <div className="flex flex-row gap-4"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
