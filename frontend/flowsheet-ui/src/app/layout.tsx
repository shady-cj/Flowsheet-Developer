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
        <div className="container mx-auto my-0 w-full max-w-[3000px] min-h-screen flex flex-col app-content">

          {children}
        
        </div>
        <div className="small-screen-message">
          <div className="emoji">📱❌</div>
          <h1>Oops! Screen too small</h1>
          <p>It looks like You&apos;re using a device or screen size that is too small to properly view this page.</p>
          <p>Please use a wider screen or zoom out on your browser for the best experience.</p>
          <p> Mobile version is coming soon... </p>
        </div>
      </body>
    </html>
  );
}
