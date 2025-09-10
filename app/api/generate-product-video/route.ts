import { db } from "@/configs/firebaseConfig";
import { imagekit } from "@/lib/imagekit";
import { replicate } from "@/lib/replicate";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { imageUrl, imageToVideoPrompt, uid, documentId } = await req.json();

  const input = {
    image: imageUrl,
    prompt: imageToVideoPrompt,
  };

  await updateDoc(doc(db, "user-ads", documentId), {
    imageToVideoStatus: "pending",
  }).then(() => {
    console.log("video status updated");
  });

  try {
    const output = await replicate.run("wan-video/wan-2.2-t2v-fast", { input });
    //@ts-ignore
    console.log(output.url());

    await updateDoc(doc(db, "user-ads", documentId), {
      imageToVideoStatus: "complete. Saving to image kit",
    });

    //Save to imagekit

    //@ts-ignore
    const videoOutput = await fetch(output.url());

    const videoBUffer = Buffer.from(await videoOutput.arrayBuffer());

    const imageKitVideoUploadResult = await imagekit.upload({
      file: videoBUffer,
      fileName: `video_${Date.now()}.mp4`,
      isPublished: true,
    });

    await updateDoc(doc(db, "user-ads", documentId), {
      imageToVideoStatus: "Complete",
      videoUrl: imageKitVideoUploadResult.url,
    });

    //Update User Credits

    //1. fetch user data from users collection
    const userRef = collection(db, "users");
    const q = query(userRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    const userDocument = querySnapshot.docs[0];
    const userInfo = userDocument.data();

    //1. update user credits balance
    updateDoc(doc(db, "users", uid), {
      creditsBalance: userInfo.creditsBalance - 5,
    });
    

    //@ts-ignore
    return NextResponse.json(imageKitVideoUploadResult.url);
  } catch (error) {
    await updateDoc(doc(db, "user-ads", documentId), {
      imageToVideoStatus: "finished with error",
    });
    return NextResponse.json(error);
  }
}
