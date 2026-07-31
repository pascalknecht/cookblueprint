import React from "react";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/devices.min.css";
import { cn } from "@/lib/utils";
import { Footer } from "./footer";
import { Header } from "./header";

const miseBody = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-mise-body",
});

const miseDisplay = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-mise-display",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        miseBody.variable,
        miseDisplay.variable,
        "marketing-theme flex min-h-screen w-full flex-col bg-background font-sans text-foreground",
      )}
    >
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
