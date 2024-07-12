"use client";

import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { navItems } from "@/data";
import { useEffect, useState } from "react";

interface UserData {
  _id: string;
  username: string;
  email: string;
  isBlocked: boolean;
  isVerified: boolean;
  accessToken: string;
  refreshToken: string;
  roles: string;
}

export default function NavbarWrapper() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    console.log("storedUserData", storedUserData);
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const adminNavItems = [
    { name: "Users", link: "/admin/User-Management" },
    { name: "Courses", link: "/admin/Course-Management" },
    { name: "Complaints", link: "/admin/Complaint-Management" },
    { name: "Logout", link: "/login" },
];


  const defaultNavItems = [
    { name: "Courses", link: "/course" },
    { name: "Services", link: "/services" },
    { name: "Profile", link: "/profile" },
    { name: "LogOut", link: "/login" },
  ];

  const navItemss = userData?.roles === "admin" ? adminNavItems : defaultNavItems;

  return userData ? (
    <FloatingNav navItems={navItemss} />
  ) : (
    <FloatingNav navItems={navItems} />
  );
}
