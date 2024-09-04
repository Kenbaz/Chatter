import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import Image from "next/image";

export const runtime = "edge";

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get("title");
    const author = searchParams.get("author");
    const imageUrl = searchParams.get("image");

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
            fontSize: 32,
            fontWeight: 600,
          }}
        >
          <Image
            src={imageUrl || ""}
            alt="Cover"
            style={{ width: "100%", height: "60%", objectFit: "cover" }}
          />
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              width: "100%",
              backgroundColor: "#fff",
            }}
          >
            <h1 style={{ fontSize: 48, margin: "0 0 10px", color: "#333" }}>
              {title}
            </h1>
            <p style={{ fontSize: 18, margin: 0, color: "#555" }}>
              By {author}
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 600,
      }
    );

    return new Response(imageResponse as any);
  } catch (error: any) {
    console.log(`${error.message}`);
    return new Response("Failed to generate the image", {
      status: 500,
    });
  }
}
