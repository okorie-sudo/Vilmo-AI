"use client";

import { useAuthContext } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { db } from "@/configs/firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Eye, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const UserProductList = () => {
  const [productList, setProductList] = useState([]);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user?.email) {
      console.log("User or email is not available, skipping query");
      setProductList([]); // Clear product list if no user
      return;
    }

    const q = query(
      collection(db, "user-ads"),
      where("userEmail", "==", user.email)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const matchedDocuments: any = [];
        querySnapshot.forEach((doc) => {
          matchedDocuments.push({ id: doc.id, ...doc.data() });
        });
        setProductList(matchedDocuments);
        console.log("Fetched documents:", matchedDocuments); // Log only when data changes
      },
      (error) => {
        console.error("Snapshot error:", error);
      }
    );

    // Cleanup listener on unmount or when user.email changes
    return () => unsubscribe();
  }, [user?.email]); // Re-run effect if user.email changes
  return (
    <div>
      <h2 className="font-bold text-2xl mt-5 mb-2">My Ads</h2>
      {productList?.length == 0 ? (
        <div className="p-5 border-dashed border-1 rounded-xl flex flex-col items-center justify-center mt-6 gap-3">
          <Image
            className="w-20"
            width={200}
            height={200}
            src={"/signboard.png"}
            alt="empty"
          />
          <h2 className="text-xl">Product list is empty</h2>
          <Button>
            <Link href={user ? "/ai-tools" : "/login"}>Create new Product</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {productList &&
            productList.map((product: any, index) => (
              <div key={index}>
                <Image
                  width={400}
                  height={400}
                  src={product.initialProductImageUrl}
                  alt="Advert"
                  className="w-full h-[250px] object-contain"
                />
                <Button variant={"ghost"}>
                  <Link href={product.initialProductImageUrl} target="_blank">
                    <Eye />
                  </Link>
                </Button>
                <div className="flex items-center mt-2 justify-between">
                  {product.videoUrl && (
                    <Button>
                      <Link href={product.videoUrl} target="_blank">
                        <Play />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default UserProductList;
