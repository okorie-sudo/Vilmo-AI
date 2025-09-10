"use client";

import { Textarea } from "@/components/ui/textarea";
import {
  ImagePlus,
  Loader2Icon,
  Monitor,
  Smartphone,
  Sparkles,
  Square,
} from "lucide-react";
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

type Props = {
  handleInputChange: (field: string, value: string | File) => void;
  onGenerate: () => void;
  loading: boolean;
  enableAvatars: boolean;
};

const FormInput = ({
  handleInputChange,
  onGenerate,
  loading,
  enableAvatars,
}: Props) => {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>();

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("File size is greater than 5MB");
      return;
    }

    handleInputChange("file", file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleSampleImageSelect = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();
      const file = new File([blob], imageUrl.split("/").pop() || "sample.png", {
        type: blob.type,
      });

      handleInputChange("file", file);
      setFilePreview(URL.createObjectURL(file));
    } catch (err) {
      console.error("Failed to fetch sample image:", err);
      alert("Failed to load sample image");
    }
  };

  const sampleProducts = [
    "/headphone.png",
    "/juice-can.png",
    "/perfume.png",
    "/burger.png",
    "/ice-creame.png",
  ];

  const avatarsList = [
    { name: "Avatar 1", imageUrl: "/avatar-1.jpg" },
    { name: "Avatar 2", imageUrl: "/avatar-2.jpg" },
    { name: "Avatar 3", imageUrl: "/avatar-3.jpg" },
    { name: "Avatar 4", imageUrl: "/avatar-4.jpg" },
    { name: "Avatar 5", imageUrl: "/avatar-5.jpg" },
    { name: "Avatar 6", imageUrl: "/avatar-6.jpg" },
  ];

  return (
    <div>
      <div>
        -.
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
                className="w-full object-contain h-full max-h-[200px]"
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
        {!enableAvatars && (
          <>
            <h2 className="mb-5 opacity-40 text-center text-lg">
              Click to select
            </h2>
            <div className="flex gap-5 items-center flex-wrap">
              {/* sample products */}

              {sampleProducts &&
                sampleProducts.map((product, index) => (
                  <Image
                    key={index}
                    src={product}
                    alt={product}
                    width={100}
                    height={100}
                    className="w-[60px] h-[60px] rounded-full cursor-pointer hover:scale-110 duration-300 transition"
                    onClick={() => handleSampleImageSelect(product)}
                  />
                ))}
            </div>
          </>
        )}
        {enableAvatars && (
          <div>
            <h2 className="my-2 font-bold text-xl">Select Avatar</h2>
            <div className="flex w-full flex-wrap gap-6">
              {avatarsList.length &&
                avatarsList.map((avatar, index) => (
                  <Image
                    key={index}
                    src={avatar.imageUrl}
                    alt={avatar.name}
                    height={200}
                    width={200}
                    className={`w-[100px] h-[80px] rounded-lg object-fit hover:scale-105 duration-400 transition-all cursor-pointer ${
                      selectedAvatar === avatar.imageUrl &&
                      "border-2 border-primary"
                    }`}
                    onClick={() => {
                      setSelectedAvatar(avatar.imageUrl);
                      handleInputChange("avatar", avatar.imageUrl);
                    }}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-8">
        <h2 className="font-semibold">2. Describe Product</h2>
        <Textarea
          placeholder="Describe the product as best as you can"
          className="min-h-[50px] mt-4"
          onChange={(e) => handleInputChange("description", e.target.value)}
        />
      </div>
      <div className="mt-8">
        <h2 className="font-semibold">3. Select Resolution</h2>
        <Select onValueChange={(value) => handleInputChange("size", value)}>
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
      <Button className="mt-5 w-full" onClick={onGenerate} disabled={loading}>
        {loading ? <Loader2Icon className="animate-spin" /> : <Sparkles />}
        Generate
      </Button>
      <h2 className="mt-1 text-xs opacity-35">Costs 5 Credits</h2>
    </div>
  );
};

export default FormInput;
