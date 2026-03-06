import "./globals.css";

export const metadata = {
  title: "MyCoDAO",
  description: "MyCoDAO — Community-driven platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-800">
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
