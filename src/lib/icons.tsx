import { File, FileText, FileImage, FileArchive, Folder } from "lucide-react";

export function getIconForFile(filename: string, isDirectory: boolean) {
  if (isDirectory) {
    return <Folder className="h-5 w-5" />;
  }

  const extension = filename.split(".").pop()?.toLowerCase() || "";

  switch (extension) {
    case "pdf":
    case "txt":
    case "md":
      return <FileText className="h-5 w-5" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
      return <FileImage className="h-5 w-5" />;
    case "zip":
    case "rar":
    case "7z":
      return <FileArchive className="h-5 w-5" />;
    default:
      return <File className="h-5 w-5" />;
  }
}