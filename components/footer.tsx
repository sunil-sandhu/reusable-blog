import Logo from "./logo";

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
            {/* Social links will go here */}
            {/* <div className="flex flex-row gap-4"></div> */}
          </div>

          {/* Remote team section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Made with <span className="text-red-500">❤️</span> by a
              fully-remote team
            </p>
            <div className="flex justify-center gap-2">
              <span>🇬🇧</span>
              <span>🇵🇹</span>
              <span>🇳🇬</span>
              <span>🇪🇸</span>
              <span>🇮🇳</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              In Plain English Ltd © {new Date().getFullYear()}
            </p>
            <div className="flex justify-center mt-8 mb-4">
              <a href="https://plainenglish.io">
                <Logo color="blue" size="30" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
