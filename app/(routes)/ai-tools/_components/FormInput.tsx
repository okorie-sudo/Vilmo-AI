"use client";

import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Monitor, Smartphone, Sparkles, Square } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const FormInput = () => {
  const [filePreview, setFilePreview] = useState<string | null>();

  const handleFileSelect = (fileUrl: FileList | null) => {
    if (!fileUrl || fileUrl.length == 0) return;
    if (fileUrl[0].size > 5 * 1024 * 1024) {
      alert("File size is greater than 5MB");
      return;
    }
    setFilePreview(URL.createObjectURL(fileUrl[0]));
  };

  const sampleProducts = [
    "/headphone.png",
    "/juice-can.png",
    "/perfume.png",
    "/burger.png",
    "/ice-creame.png",
  ];

  return (
    <div>
      <div>
        <h2 className="font-semibold">1. Upload Image</h2>
        <div>
          <label
            htmlFor="imageUpload"
            className="mt-2 border-dashed rounded-sm flex flex-col p-4 items-center justify-center min-h-[200px] cursor-pointer"
          >
            {!filePreview ? (
              <div className="flex flex-col items-center">
                <ImagePlus className="h-8 w-8 opacity-40" />
                <h2 className="text-lg">Click here to upload image</h2>
                <p className="opacity-45">Upload image up to 5MB</p>
              </div>
            ) : (
              <Image
                src={filePreview}
                alt="Product preview"
                width={300}
                height={300}
                className="w-full object-contain h-full max-h-[200px] "
              />
            )}
          </label>
          <input
            type="file"
            id="imageUpload"
            hidden
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
        {/* Product Samples */}

        <h2 className="mb-5 opacity-40 text-center text-lg">Click to select</h2>
        <div className="flex gap-5 items-center flex-wrap">
          {sampleProducts &&
            sampleProducts.map((product, index) => (
              <Image
                key={index}
                src={product}
                alt={product}
                width={100}
                height={100}
                className="w-[60px] h-[60px] rounded-full cursor-pointer hover:scale-110 duration-300 transition"
                onClick={() => setFilePreview(product)}
              />
            ))}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="font-semibold">2. Describe Product</h2>
        <Textarea
          placeholder="describe the product as best as you can"
          className="m-h-[`50px mt-4"
        />
      </div>
      <div className="mt-8">
        <h2 className="font-semibold">3. Select Resolution</h2>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Click to select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1024x1024">
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4" />
                <span>1:1</span>
              </div>
            </SelectItem>
            <SelectItem value="1536x1024">
              <div className="flex items-center gap-1">
                <Monitor className="h-4 w-4" />
                <span>16:9</span>
              </div>
            </SelectItem>
            <SelectItem value="1024x1536">
              <div className="flex items-center gap-1">
                <Smartphone className="h-4 w-4" />
                <span>9:16</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button className="mt-5 w-full">
        <Sparkles /> Generate
      </Button>
      <h2 className="mt-1 text-xs opacity-35 "> Costs 5 Credit</h2>
    </div>
  );
};

export default FormInput;
