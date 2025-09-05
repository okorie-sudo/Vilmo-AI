import React from "react";
import FormInput from "../_components/FormInput";
import Preview from "../_components/Preview";

const ProductImages = () => {
  return (
    <div>
      <h2 className="font-bold mb-2 text-xl">Smart Image Generator</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <FormInput />
        </div>
        <div className="md:grid-cols-2">
          <Preview />
        </div>
      </div>
    </div>
  );
};

export default ProductImages;
