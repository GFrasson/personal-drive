import { NextRequest, NextResponse } from "next/server";
import { promises as fs, createReadStream } from "fs";
import path from "path";
import { Readable } from "stream";

const UPLOAD_DIR = path.join(process.cwd(), process.env.UPLOAD_DIR ?? "uploads");

function getSafePath(pathSegments: string[]): string {
  const resolvedPath = path.join(UPLOAD_DIR, ...pathSegments);

  if (!resolvedPath.startsWith(UPLOAD_DIR)) {
    throw new Error("Invalid path");
  }

  return resolvedPath;
}

function streamToReadableStream(stream: Readable): ReadableStream {
  return new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => controller.enqueue(chunk));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
  });
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const params = await context.params;
    
  if (!params.path || params.path.length === 0) {
    return NextResponse.json({ error: "File path is required." }, { status: 400 });
  }

  try {
    const filePath = getSafePath(params.path);
    const stats = await fs.stat(filePath);
    const nodeStream = createReadStream(filePath);
    const webStream = streamToReadableStream(nodeStream);

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${path.basename(filePath)}"`,
        "Content-Type": "application/octet-stream",
        "Content-Length": stats.size.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);

    return NextResponse.json({ error: "Failed to download file." }, { status: 500 });
  }
}