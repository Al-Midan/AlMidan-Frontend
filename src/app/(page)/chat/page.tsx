"use client"
import React from "react";
import { Meteors } from "@/components/ui/meteors";

const MeteorsDemo = () => {
  return (
    <div className="relative min-h-screen  overflow-hidden bg-black-100">
      <div className="absolute inset-0  opacity-20"></div>
      <Meteors number={50} />
      
    
    </div>
  );
}
export default MeteorsDemo;