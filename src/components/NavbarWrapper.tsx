"use client";

import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { navItems } from "@/data";
import { useAppSelector } from "@/redux/hook";

export default function NavbarWrapper() {
  const user = useAppSelector((state) => state.user);

  const adminNavItems = [
    { name: "Users", link: "/admin/User-Management" },
    { name: "Courses", link: "/admin/Course-Management" },
    { name: "Complaints", link: "/admin/Complaint-Management" },
    { name: "Jobs", link: "/admin/Job-Management" },
    { name: "Skill", link: "/admin/Skill-Management" },
    { name: "LogOut", link: "/login" },
  ];

  const defaultNavItems = [
    { name: "Home", link: "/home" },
    { name: "Contents", link: "/ContentManager" },
    { name: "Courses", link: "/course" },
    { name: "Job", link: "/service" },
    { name: "Skill", link: "/service/skill" },
    { name: "Profile", link: "/profile" },
    { name: "Complaints", link: "/complaints" },
    { name: "LogOut", link: "/login" },
  ];

  const navItemss = user.roles === "admin" ? adminNavItems : defaultNavItems;

  return <FloatingNav navItems={user._id ? navItemss : navItems} />;
}
