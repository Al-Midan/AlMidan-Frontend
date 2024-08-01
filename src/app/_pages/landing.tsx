"use client";

import { navItems } from "@/data";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import Hero from "@/components/LandingPage/Hero";
import Courses from "@/components/LandingPage/Courses";
import Services from "@/components/LandingPage/Services";
import Feedback from "@/components/LandingPage/Feedback";
import Footer from "@/components/LandingPage/Footer";

const Landing = () => {
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col  mx-auto sm:px-10 px-5 overflow-clip">
      <div className="max-w-7xl w-full">
        <FloatingNav navItems={navItems} />
        <Hero />
        <Courses />
        <Services />
        <Feedback />

      </div>
    </main>
  );
};

export default Landing;
