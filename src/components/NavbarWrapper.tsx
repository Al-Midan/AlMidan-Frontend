"use client";

import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { navItems } from "@/data";
import { useEffect, useState } from "react";

const navItemss = [
  { name: "Courses", link: "/course" },
  { name: "Services", link: "/services" },
  { name: "Profile", link: "/profile" },
];

export default function NavbarWrapper() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    console.log("storedUserData",storedUserData);
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);


  return userData ? (
    <FloatingNav navItems={navItemss} />
  ) : (
    <FloatingNav navItems={navItems} />
  );
}