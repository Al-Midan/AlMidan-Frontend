"use client";
import React from "react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { TracingBeam } from "@/components/ui/tracing-beam";
import "@fontsource/inter";
import { Content } from "@/data/Content";

export function TracingBeamDemo() {
  return (
    <TracingBeam className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-[100rem] mx-auto antialiased pt-20 relative">
        {Content.map((item, index) => (
          <div key={`content-${index}`} className="mb-24 lg:mb-32">
            <div
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-8 lg:gap-16`}
            >
              <div className="w-full lg:w-2/5 space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full text-xs font-semibold px-3 py-1 flex items-center">
                    <span className="mr-1">{item.badge.icon}</span>
                    <span>{item.badge.text}</span>
                  </div>
                </div>
                <h3
                  className={twMerge(
                    "font-inter",
                    "text-xl lg:text-2xl font-bold"
                  )}
                >
                  {item.title}
                </h3>
                <div className="text-xs lg:text-base prose prose-sm dark:prose-invert max-w-none">
                  {item.description}
                </div>
              </div>
              <div className="w-full lg:w-3/5 mt-6 lg:mt-0">
                {item?.image && (
                  <Image
                    src={item.image}
                    alt="section image"
                    width={1600}
                    height={900}
                    className="rounded-lg object-cover w-full h-[250px] sm:h-[350px] lg:h-[400px]"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </TracingBeam>
  );
}
