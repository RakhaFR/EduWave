"use client";

import React from "react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/FooterSection";
import FloatingBubbles from "@/components/ui/FloatingBubbles";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div
      className="flex min-h-screen flex-col font-sans relative"
      style={{ background: "linear-gradient(180deg, #42AEED 0%, #0063A7 100%)" }}
    >
      <FloatingBubbles count={20} />

      {/* Ocean bottom ornament */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none" style={{ zIndex: 1 }}>
        <img
          src="/ocean-ornament.svg"
          alt=""
          className="w-full"
          style={{ display: "block", height: "240px", objectFit: "cover", objectPosition: "top" }}
        />
      </div>

      <Navbar theme="dark" />

      {/* Main Content container with padding top for fixed navbar */}
      <div className="flex-1 relative z-10 pt-24 pb-16">
        {children}
      </div>

      <Footer />
    </div>
  );
}
