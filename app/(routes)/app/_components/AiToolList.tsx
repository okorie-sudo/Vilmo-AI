import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const AiTools = [
  {
    name: "Products Image",
    description:
      "Create crisp, studio-quality product photos instantly with Vilmo’s AI-powered generator.",
    banner: "/product-image.png",
    path: "/ai-tools/product-images",
  },
  {
    name: "Products Video",
    description:
      "Transform static products into dynamic showcase videos crafted by Vilmo’s smart automation.",
    banner: "/product-video.png",
    path: "/ai-tools/product-videos",
  },
  {
    name: "Products Avatar",
    description:
      "Animate your products with lifelike AI avatars to deliver interactive, customer-ready experiences.",
    banner: "/product-avatar.png",
    path: "/ai-tools/product-avatars",
  },
];

const AiToolList = () => {
  return (
    <div className="">
      <h2 className="font-bold text-2xl mb-2">Tools</h2>
      <div className="flex justify-start flex-wrap items-center gap-3">
        {AiTools &&
          AiTools.map((tool, index) => (
            <div
              key={index}
              className="flex items-end justify-between p-2 w-[250px] max-w-[350px]  bg-zinc-800 rounded-xl"
            >
              <Image
                src={tool.banner}
                alt={tool.name}
                width={300}
                height={300}
                className="w-[150px] h-[150px]"
              />
              <div>
                <h2 className="font-bold text-md">{tool.name}</h2>
                <p className="opacity-60 mt-2 text-[10px]">
                  {tool.description}
                </p>
                <Button className="mt-4">
                  <Link className="w-full h-full" href={tool.path}>
                    Try it out
                  </Link>
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AiToolList;
