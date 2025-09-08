import { useAuthContext } from "@/app/provider";
import React, { useEffect, useState } from "react";
import { db } from "@/configs/firebaseConfig";
import { query, collection, where, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, Ghost, Sparkles } from "lucide-react";
import Link from "next/link";

const Preview = () => {
  const [productList, setProductList] = useState([]);
  const { user } = useAuthContext();

  const downloadImage = async (url: string) => {
    const result = await fetch(url);
    const blob = await result.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.setAttribute("download", `${url}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  };

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
    <div className="p-5 rounded-2xl border">
      <h2 className="font-bold text-2xl">Product Results </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {productList &&
          productList.map((product: any, index) => (
            <div
              key={index}
              className="  border-2 p-2 rounded-lg border-gray-900 hover:scale-[1.01] transition-all duration-400 cursor-pointer"
            >
              <Image
                src={product?.initialProductImageUrl}
                alt={product.id}
                width={500}
                height={500}
                className="w-fill h-[250px] object-cover rounded-lg"
              />
              {/* this is the wrong alt for the image and the reason it's being used is I don't have image generation credits for now. I should use the final image url  Then we could add some check for when the genration is still underway and when it is done. I'll implement when I buy credit*/}
              <div className="flex justify-between items-center my-2">
                <div className="flex items-center ">
                  <Button
                    variant="ghost"
                    className="bg-transparent hover:scale-110 transition-all duration-1000 ease-in-out "
                    onClick={() =>
                      downloadImage(product.initialProductImageUrl)
                    }
                  >
                    <Download />
                  </Button>
                  <Button variant="ghost">
                    <Link href={product.initialProductImageUrl} target="_blank">
                      View
                    </Link>
                  </Button>
                </div>
                <Button>
                  <Sparkles /> Animate
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Preview;
