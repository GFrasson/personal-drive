import { NextResponse, NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export interface FileData {
  name: string;
  isDirectory: boolean;
  size: number;
  lastModified: number;
}

const UPLOAD_DIR = path.join(process.cwd(), process.env.UPLOAD_DIR ?? "uploads");

function getSafePath(pathSegments: string[]): string {
  const resolvedPath = path.join(UPLOAD_DIR, ...pathSegments);

  if (!resolvedPath.startsWith(UPLOAD_DIR + path.sep) && resolvedPath !== UPLOAD_DIR) {
    throw new Error("Invalid path");
  }

  return resolvedPath;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  try {
    const params = await context.params;
    const pathSegments = params.path ?? [];
    const currentPath = getSafePath(pathSegments);
    
    await fs
      .access(currentPath)
      .catch(() => fs.mkdir(currentPath, { recursive: true }));

    const dirents = await fs.readdir(currentPath, { withFileTypes: true });

    const filesData = await Promise.all(
      dirents.map(async (dirent) => {
        const fullPath = path.join(currentPath, dirent.name);
        const stats = await fs.stat(fullPath);
        return {
          name: dirent.name,
          isDirectory: dirent.isDirectory(),
          size: stats.size,
          lastModified: stats.mtimeMs,
        };
      })
    );

    filesData.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(filesData);
  } catch (error) {
    console.error("Error listing files:", error);

    return NextResponse.json(
      { error: "Failed to list files." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  try {
    const formData = await request.formData();
    const params = await context.params;
    
    const pathSegments = params.path ?? [];
    const currentPath = getSafePath(pathSegments);

    const newFolderName = formData.get("newFolderName") as string | null;
    if (newFolderName) {
      const newFolderPath = path.join(currentPath, newFolderName);

      await fs.mkdir(newFolderPath, { recursive: true });

      return NextResponse.json({ success: true, message: "Folder created successfully." });
    }

    const files = formData.getAll("files") as File[];
    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided." }, { status: 400 });
    }

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(currentPath, file.name);

      await fs.writeFile(filePath, buffer);
    }

    return NextResponse.json({ success: true, message: "Files uploaded successfully." });
  } catch (error) {
    console.error("Error in POST handler:", error);

    return NextResponse.json(
      { error: "Operation failed." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  try {
    const { name, isDirectory } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const params = await context.params;
    
    const pathSegments = params.path ?? [];
    const currentPath = getSafePath(pathSegments);

    const itemPath = path.join(currentPath, name);

    if (!itemPath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json({ error: "Invalid path." }, { status: 400 });
    }

    if (isDirectory) {
      await fs.rm(itemPath, { recursive: true, force: true });
    } else {
      await fs.unlink(itemPath);
    }

    return NextResponse.json({ success: true, message: "Item deleted successfully." });
  } catch (error) {
    console.error("Error deleting item:", error);
    
    return NextResponse.json({ error: "Failed to delete item." }, { status: 500 });
  }
}