import { cn } from "@/lib/utils";
import React from "react";

export const Meteors = ({
  number = 50, // Increase the default number of meteors
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteors = new Array(number).fill(true);
  return (
    <>
      {meteors.map((el, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor-effect absolute h-0.5 w-0.5 rounded-full bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
            className
          )}
          style={{
            top: Math.floor(Math.random() * 100) + "vh",
            left: Math.floor(Math.random() * 100) + "vw",
            animationDelay: Math.random() * 1 + "s", // Delay between 0 and 1 second
            animationDuration: Math.random() * 8 + 2 + "s", // Duration between 2 and 10 seconds
          }}
        ></span>
      ))}
    </>
  );
};
