import React, { ReactNode } from 'react';
import Footer from "@/components/LandingPage/Footer";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import Link from "next/link";

const navItems = [
  { name: "Courses", link: "/course" },
  { name: "Services", link: "/services" },
  { name: "Profile", link: "/profile" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <FloatingNav navItems={navItems} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}