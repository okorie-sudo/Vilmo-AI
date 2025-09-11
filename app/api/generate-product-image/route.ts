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
import OpenAI from "openai";

// Using universal prompt for now but will make it dynamic later
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

    // Fetch user document to update credit balance
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const userDocument = querySnapshot.docs[0];
    const userInfo = userDocument.data();

    // Save to Database
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

    // Generate product image prompt using OpenAI
    const promptResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text" as const,
              text:
                avatar?.length > 0
                  ? AVATAR_PROMPT
                  : `Generate a prompt for product image and video based on the provided image and description: ${description}`,
            },
            {
              type: "image_url" as const,
              image_url: {
                url: imageKitRef.url,
              },
            },
            ...(avatar?.length > 2
              ? [
                  {
                    type: "image_url" as const,
                    image_url: {
                      url: avatar,
                    },
                  },
                ]
              : []),
          ] as Array<OpenAI.Chat.Completions.ChatCompletionContentPart>,
        },
      ],
    });

    // Extract the generated prompt
    const textOutput = promptResponse.choices[0]?.message?.content?.trim();
    if (!textOutput) {
      throw new Error("Failed to generate text prompt");
    }
    let json;
    try {
      json = JSON.parse(textOutput);
    } catch (e) {
      console.error("Failed to parse textOutput as JSON:", textOutput);
      throw new Error("Invalid text prompt format");
    }

    // Generate image using OpenAI's image generation API
    const imageResponse = await client.images.generate({
      model: "dall-e-3",
      prompt:
        json?.textToImage ||
        `Generate a product advertisement image based on: ${description}`,
      n: 1,
      size:
        size === "small"
          ? "256x256"
          : size === "medium"
          ? "512x512"
          : "1024x1024",
      response_format: "b64_json",
    });

    // Extract generated image
    if (!imageResponse.data || imageResponse.data.length === 0) {
      throw new Error("Failed to generate image: No data returned");
    }
    const generatedImage = imageResponse.data[0].b64_json;
    if (!generatedImage) {
      throw new Error("Failed to generate image: No base64 data");
    }
    // Upload generated base64 image to ImageKit
    const uploadResult = await imagekit.upload({
      file: `data:image/png;base64,${generatedImage}`,
      fileName: `generated-${Date.now()}.png`,
      isPublished: true,
    });

    // Update document
    await updateDoc(doc(db, "user-ads", docId), {
      finalProductImageUrl: uploadResult?.url,
      initialProductImageUrl: imageKitRef.url,
      status: "completed",
      imageToVideoPrompt: imageToVideoPrompts,
    });

    // Update user credit
    await updateDoc(doc(db, "users", userInfo.uid), {
      creditsBalance: userInfo.creditsBalance - 5,
    });

    // Return URL of generated image for frontend
    return NextResponse.json({ url: uploadResult?.url }, { status: 200 });
  } catch (error: any) {
    console.error("Image upload error:", {
      message: error.message,
      stack: error.stack,
    });
    if (documentId) {
      await updateDoc(doc(db, "user-ads", documentId), {
        finalProductImageUrl: "undefined",
        initialProductImageUrl: initialProductUrl,
        imageToVideoPrompt: imageToVideoPrompts,
        status: "Finished with error",
      });
    }
    return NextResponse.json(
      { message: "Failed to upload image", error: error.message },
      { status: 500 }
    );
  }
}
