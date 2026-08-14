"use client";

import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import TextAnimationSection from "@/components/home/TextAnimationSection";

export default function Home() {
  const [bubbles, setBubbles] = useState<
    Array<{
      id: number;
      size: number;
      left: number;
      duration: number;
      delay: number;
    }>
  >([]);

  // "light" = putih (hero + about), "dark" = liquid glass (text-animation ke bawah)
  const [navTheme, setNavTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Init AOS
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });

    // Generate gelembung
    setBubbles(
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        size: Math.random() * 24 + 8,
        left: Math.random() * 100,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 5,
      }))
    );

    // Scroll listener — switch navbar theme
    const handleScroll = () => {
      const textSection = document.getElementById("text-animation-section");
      if (textSection) {
        const rect = textSection.getBoundingClientRect();
        setNavTheme(rect.top <= 80 ? "dark" : "light");
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Navbar theme={navTheme} />
      <HeroSection bubbles={bubbles} />
      <AboutSection />
      <TextAnimationSection />
    </>
  );
}