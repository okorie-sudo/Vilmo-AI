"use client";

import React, { useState } from "react";
import FormInput from "../_components/FormInput";
import Preview from "../_components/Preview";
import axios from "axios";

type FormData = {
  file?: File;
  description: string;
  size: string;
  imageUrl?: string;
};

const ProductImages = () => {
  const [formData, setFormData] = useState<FormData>({
    description: "",
    size: "",
    file: undefined,
    imageUrl: undefined,
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

  return (
    <div>
      <h2 className="font-bold mb-2 text-xl">Smart Image Generator</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <FormInput
            handleInputChange={handleInputChange}
            onGenerate={onGenerate}
            loading={loading}
          />
        </div>
        <div className="md:grid-cols-2">
          <Preview />
        </div>
      </div>
    </div>
  );
};

export default ProductImages;
