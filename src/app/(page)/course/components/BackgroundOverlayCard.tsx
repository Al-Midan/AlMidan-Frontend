"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface CardDemoProps {
  imageUrl: string;
  heading: string;
  description: string;
  courseId: string;
}

export function CardDemo({
  imageUrl,
  heading,
  description,
  courseId,
}: CardDemoProps) {
  const defaultImageUrl =
    "https://images.unsplash.com/photo-1476842634003-7dcca8f832de?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80";

  return (
    <div className="max-w-xs w-full">
      <div
        className={cn(
          "group w-full cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl mx-auto flex flex-col justify-end p-4 border border-transparent dark:border-neutral-800",
          "bg-cover",
          {
            "bg-cover": true,
            "bg-no-repeat": true,
            "bg-center": true,
          }
        )}
        style={{ backgroundImage: `url(${imageUrl || defaultImageUrl})` }}
      >
        <div className="text relative z-50" >
          <h1 className="font-bold text-xl md:text-3xl text-stone-300 relative">
            {heading}
          </h1>
       
          <Link
            href={`/course/${courseId}`}
            className="relative z-10 px-6 py-2 bg-black text-white font-bold rounded-xl block text-xs"
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
}
