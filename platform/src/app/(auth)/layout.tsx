export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,118,0.10), transparent 60%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(201,168,118,0.06), transparent 60%)",
        }}
      />
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        {children}
      </main>
      <footer className="py-5 text-center text-xs text-ink-muted">
        &copy; 2026 Entropy Breakers
      </footer>
    </div>
  );
}
