import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Inter is perfect for this bold style
import "./globals.css";

// Load Inter with extra weights for that "Bold App" look
const inter = Inter({ 
  subsets: ["latin"], 
  weight: ['400', '600', '700', '900'] 
});

export const metadata: Metadata = {
  title: "Whisper",
  description: "Send anonymous secrets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Global Black Background */}
      <body className={`${inter.className} bg-black text-white antialiased overflow-x-hidden selection:bg-pink-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}