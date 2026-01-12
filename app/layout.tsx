// app/layout.tsx
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${inter.variable} bg-slate-950 text-slate-200`}>
        {children}
      </body>
    </html>
  );
}