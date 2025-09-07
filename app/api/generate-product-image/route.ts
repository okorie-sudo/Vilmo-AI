// @/pages/api/generate-product-image.ts
import { imagekit } from "@/lib/imagekit";
import { client } from "@/lib/openai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse FormData
    const formData = await req.formData();

    const file = formData.get("file");
    const description = formData.get("description") as string;
    const size = formData.get("size") as string;

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

    //product image prompt

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

    // return NextResponse.json({ url: imageKitRef.url }, { status: 200 });
  } catch (error: any) {
    console.error("Image upload error:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: "Failed to upload image", error: error.message },
      { status: 500 }
    );
  }
}
