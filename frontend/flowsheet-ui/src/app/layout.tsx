import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flowsheet",
  description: "Flowsheet Designer Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className='antialiased'>
        <div className="container mx-auto my-0 w-full max-w-[3000px] min-h-screen flex flex-col">

          {children}
        
        </div>
      </body>
    </html>
  );
}
