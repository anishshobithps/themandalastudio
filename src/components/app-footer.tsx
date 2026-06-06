export function AppFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/50 backdrop-blur-sm p-3 text-center text-xs text-muted-foreground md:py-2">
      <p>
        <span>© {currentYear} Mandala Generator</span>
        <span className="mx-2 opacity-30">·</span>
        <a
          href="https://n10nce.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors underline"
        >
          Created by n10nce.dev
        </a>
      </p>
    </footer>
  )
}
