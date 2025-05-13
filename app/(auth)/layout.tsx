import "../globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container flex items-center justify-center mx-auto max-w-7xl">
        {children}
      </main>
      <footer className="text-center py-4">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Made with ❤️ by{" "}
          <a
            className="text-blue-500 hover:underline"
            href="www.bluecoreit.tech"
          >
            Bluecore IT
          </a>
        </p>
      </footer>
    </div>
  );
}
