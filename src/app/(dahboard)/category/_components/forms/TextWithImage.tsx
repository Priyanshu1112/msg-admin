import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface TaggedImg {
  tag: string;
  data: string;
}

export interface TextWithImagesProps {
  text: string;
  images: TaggedImg[];
  className?: string;
}

export default function TextWithImages({
  text,
  images,
  className,
}: TextWithImagesProps) {
  // Split on placeholders like $$img-1 or $img-1$
  //   const parts = text.split(/\$\$(img-\d+)\$?/g);
  //   const parts = text.split(/\$(img-\d+)\$/g);
  const parts = (text ?? "").split(/\$(img-\d+)\$/g);

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      {parts.map((part, idx) => {
        // const match = part.match(/^(img-\d+)$/);
        const match = part.match(/^img-\d/);
        if (match) {
          const tag = match[0];
          // images.forEach((i) => console.log(i.tag));
          const img = images.find((i) => i.tag === tag);
          if (img) {
            return (
              <Image
                key={idx}
                src={img.data}
                alt={tag}
                width={100}
                height={200}
                className="inline-block w-full aspect-auto"
              />
            );
          }
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}
