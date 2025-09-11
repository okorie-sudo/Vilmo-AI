"use client";

import React, { useEffect, useState } from "react";
import FormInput from "../_components/FormInput";
import Preview from "../_components/Preview";
import axios from "axios";
import { useAuthContext } from "@/app/provider";
import { useRouter } from "next/navigation";

type FormData = {
  file?: File;
  description: string;
  size: string;
  userEmail: any;
  imageUrl?: string;
};

const ProductImages = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    description: "",
    size: "",
    file: undefined,
    imageUrl: undefined,
    userEmail: user?.email,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | File) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onGenerate = async () => {
    if (!formData.file) {
      alert("Please upload a product image or select from the example list");
      return;
    }

    if (!formData.description || !formData.size) {
      alert("Description and size are required");
      return;
    }

    setLoading(true);
    setError(null);

    const formData_ = new FormData();
    formData_.append("file", formData.file);
    formData_.append("description", formData.description);
    formData_.append("size", formData.size);
    formData_.append("userEmail", formData?.userEmail);

    try {
      const result = await axios.post(
        "/api/generate-product-image",
        formData_,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("upload successful", result);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  // Update formData.userEmail when user changes to make sure formdata is being set properly
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        userEmail: user.email,
      }));
    }
  }, [user]);

  return (
    <div>
      <h2 className="font-bold mb-2 text-xl">Smart Image Generator</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <FormInput
            enableAvatars={false}
            handleInputChange={handleInputChange}
            onGenerate={onGenerate}
            loading={loading}
          />
        </div>
        <div className="md:col-span-2">
          <Preview />
        </div>
      </div>
    </div>
  );
};

export default ProductImages;
