"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState } from "react";

const UserProductList = () => {
  const [productList, setProductList] = useState([]);
  return (
    <div>
      <h2 className="font-bold text-2xl mt-5 mb-2">Products</h2>
      {productList?.length == 0 && (
        <div className="p-5 border-dashed border-1 rounded-xl flex flex-col items-center justify-center mt-6 gap-3">
          <Image
            className="w-20"
            width={200}
            height={200}
            src={"/signboard.png"}
            alt="empty"
          />
          <h2 className="text-xl">Product list is empty</h2>
          <Button>Create new Product</Button>
        </div>
      )}
    </div>
  );
};

export default UserProductList;
