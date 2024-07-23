"use client"
import React from "react";
import { Meteors } from "@/components/ui/meteors";

const MeteorsDemo = () => {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black-100">
      <div className="absolute inset-0  opacity-20"></div>
      <Meteors number={50} />
      
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="max-w-md p-8 bg-gray-800 bg-opacity-80 rounded-2xl">
          <div className="h-5 w-5 rounded-full border flex items-center justify-center mb-4 border-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-2 w-2 text-gray-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25"
              />
            </svg>
          </div>
          <h1 className="font-bold text-xl text-white mb-4">
            Meteors because they&apos;re cool
          </h1>
          <p className="font-normal text-base text-slate-300 mb-4">
            I don&apos;t know what to write so I&apos;ll just paste something
            cool here. One more sentence because lorem ipsum is just
            unacceptable. Won&apos;t ChatGPT the shit out of this.
          </p>
          <button className="border px-4 py-1 rounded-lg border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors">
            Explore
          </button>
        </div>
      </div>
    </div>
  );
}
export default MeteorsDemo;