import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Family Grocery Tracker",
  description: "Family grocery shopping tracker",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full" style={{
          backgroundImage: "url('https://i.ibb.co/67WbjBnT/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}>
        <div className="fixed inset-0 bg-black/50 -z-10" />
        <main className="mx-auto max-w-lg px-4 pt-6 pb-24">
          {children}
        </main>
        <Nav />
      </body>
    </html>
  );
}
