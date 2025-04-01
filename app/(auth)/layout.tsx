import "../globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <main className="container mx-auto mt-36 flex max-w-7xl justify-center">
        {children}
      </main>
    </div>
  );
}
