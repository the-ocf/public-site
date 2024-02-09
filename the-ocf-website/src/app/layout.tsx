import type { Metadata } from "next";
import { Inter, Work_Sans } from "next/font/google";
import "./globals.css";

const font = Work_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Open Construct Foundation",
  description: "A non-profit organization dedicated to the AWS CDK community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
}
