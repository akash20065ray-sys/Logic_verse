import type { Metadata } from "next";
import "./globals.css";

// NOTE: next/font/google (Inter, JetBrains Mono) requires network access to
// fonts.googleapis.com at build time, which isn't available in this sandbox.
// Falling back to system font stacks that mirror the same design intent —
// clean humanist sans for UI, monospace for formal notation. Swap back to
// next/font/google locally if you have normal internet access; it works
// as a drop-in with no other changes needed.

export const metadata: Metadata = {
  title: "LogicVerse — Build. Visualize. Simulate. Understand.",
  description:
    "An AI-powered visual IDE for Discrete Mathematics and Theory of Computation. Construct formal models visually, run deterministic algorithms, and understand every step with LogicAI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-lv-bg text-lv-text font-sans">
        {children}
      </body>
    </html>
  );
}
