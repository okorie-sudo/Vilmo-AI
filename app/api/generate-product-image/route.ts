// @/pages/api/generate-product-image.ts
import { db } from "@/configs/firebaseConfig";
import { imagekit } from "@/lib/imagekit";
import { client } from "@/lib/openai";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

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
              text: "Generate a prompt for porduct image and video based on that image okay?",
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
      status: "Finished with error",
    });
    return NextResponse.json(
      { message: "Failed to upload image", error: error.message },
      { status: 500 }
    );
  }
}
