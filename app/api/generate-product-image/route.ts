// @/pages/api/generate-product-image.ts
import { db } from "@/configs/firebaseConfig";
import { imagekit } from "@/lib/imagekit";
import { client } from "@/lib/openai";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

// using universal for now but wil definitely make it dynamic later
const imageToVideoPrompts =
  "Animate this advert image into a sleek short video with smooth zoom, parallax depth, and flowing text transitions. Keep it clean, modern, and professional, highlighting the product and message with subtle, engaging motion.";

const AVATAR_PROMPT =
  "Create a sleek luxury advertisement where the selected avatar elegantly holds the product. Use refined lighting, a sophisticated setting, and ensure the product is the focal point, exuding exclusivity and premium appeal.";

export async function POST(req: NextRequest) {
  let documentId: string = "";
  let initialProductUrl: string = "";
  try {
    // Parse FormData
    const formData = await req.formData();

    const file = formData.get("file");
    const description = formData.get("description") as string;
    const size = formData.get("size") as string;
    const userEmail = formData?.get("userEmail");
    const avatar = formData?.get("avatar") as string;

    // Validate inputs
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { message: "Invalid or missing file" },
        { status: 400 }
      );
    }

    if (!description || !size) {
      return NextResponse.json(
        { message: "Description and size are required" },
        { status: 400 }
      );
    }

    //we need to update credit balance when we perform some actions so we need to fetch the user document and update it as we see fit.

    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);
    const userDocument = querySnapshot.docs[0];
    const userInfo = userDocument.data();

    //Save to Database
    const docId = Date.now().toString();
    documentId = docId;
    console.log("Document created", "document Id:", docId);
    await setDoc(doc(db, "user-ads", docId), {
      userEmail,
      status: "pending",
      description,
      size,
    });

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // Upload to ImageKit
    const imageKitRef = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      isPublished: true,
    });

    console.log("ImageKit upload success:", imageKitRef.url);
    initialProductUrl = imageKitRef.url;

    //Generate product image prompt

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        //@ts-ignore
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                avatar?.length > 0
                  ? AVATAR_PROMPT
                  : "Generate a prompt for porduct image and video based on that image okay?",
            },

            { type: "input_image", image_url: imageKitRef.url },
          ],
        },
      ],
    });

    const textOutput = response.output_text.trim();
    let json = JSON.parse(textOutput);

    const imageResponse = await client.responses.create({
      model: "gpt-4.1-mini",
      max_output_tokens: 500,
      input: [
        //@ts-ignore
        {
          role: "user",
          content: [
            {
              type: "input_text",
              //@ts-ignore
              text: json?.textToImage,
            },
            {
              type: "input_image",
              image_url: imageKitRef.url,
            },
            ...(avatar.length > 2
              ? [{ type: "input_image", image_url: avatar }]
              : []),
          ],
        },
      ],
      tools: [{ type: "image_generation" }],
    });

    //generate ai image here

    const imageData = imageResponse.output
      ?.filter((item) => item.type === "image_generation_call")
      .map((item: any) => item.result);

    // upload generated base64 image to imagekit

    const generatedImage = imageData[0]; //base64 Image
    const uploadResult = await imagekit.upload({
      file: `data:image/png;base64,${generatedImage}`,
      fileName: `generated-${Date.now()}.png`,
      isPublished: true,
    });

    // update document

    await updateDoc(doc(db, "user-ads", docId), {
      finalProductImageUrl: uploadResult?.url,
      initialProductImageUrl: imageKitRef.url,
      status: "completed",
      imageToVideoPrompt: imageToVideoPrompts,
    });

    //this is where we update user credit
    await updateDoc(doc(db, "users", userInfo.uid), {
      creditsBalance: userInfo.creditsBalance - 5,
    });

    // return url of generated image for front end consumption....

    return NextResponse.json(uploadResult?.url);
    // return NextResponse.json({ url: imageKitRef.url }, { status: 200 });
  } catch (error: any) {
    console.error("Image upload error:", {
      message: error.message,
      stack: error.stack,
    });
    await updateDoc(doc(db, "user-ads", documentId), {
      finalProductImageUrl: "undefined",
      initialProductImageUrl: initialProductUrl,
      imageToVideoPrompt: imageToVideoPrompts,
      status: "Finished with error",
    });
    return NextResponse.json(
      { message: "Failed to upload image", error: error.message },
      { status: 500 }
    );
  }
}
