import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Free AI Outline Generator | Easy Outline Maker Tool",
  description: "Create structured outlines instantly using a free AI-powered tool, perfect for blogs, technical content and SaaS products."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="keywords"
          content="Blog Content Outline Generator, Free AI Outline Generator, Free AI Blog Post Outline Generator, Best free ai outline generator content creation, Ai Article Outline Generator, Content structuring tool, Outline generator tool, Best blog content outline generator, Top 10 Outline Generators for Content Creators, AI Blog Post Outline Generator [100% FREE]"
        />
        <link rel="preload" href="/icons/infrasity_logo_signup.svg" as="image" />
        <link rel="preload" href="/icons/infrasity-small-logo.svg" as="image" />
        <link rel="preload" href="/icons/google-icon.svg" as="image" />
      </head>
      <body className={inter.className}>
        <ToastContainer
          position="top-center"
          style={{ width: "98%", padding: "0" }}
        />
        {children}
      </body>
    </html>
  );
}