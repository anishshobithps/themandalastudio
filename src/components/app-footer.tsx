export function AppFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="fixed right-0 bottom-0 left-0 border-t border-border bg-background p-3 text-center text-xs text-muted-foreground backdrop-blur-sm md:right-auto md:w-[calc(100%-18rem)]">
      <p>
        <span>© {currentYear} The Mandala Studio</span>
        <span className="mx-2 opacity-30">·</span>
        <a
          href="https://n10nce.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="underline transition-colors hover:text-foreground"
        >
          Created by n10nce.dev
        </a>
      </p>
    </footer>
  )
}
