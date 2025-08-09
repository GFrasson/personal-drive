import { FileData } from "@/app/api/files/[[...path]]/route";

const API_BASE_URL = "/api";

function buildUrl(base: string, path: string[]): string {
  return `${API_BASE_URL}/${base}/${path.join('/')}`;
}

export async function getFiles(path: string[]): Promise<FileData[]> {
  const url = buildUrl('files', path);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch files");
  }

  return response.json();
}

export async function uploadFiles(files: FileList, path: string[]): Promise<void> {
  const url = buildUrl('files', path);
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append("files", file);
  });

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload files");
  }
}

export async function createFolder(folderName: string, path: string[]): Promise<void> {
  const url = buildUrl('files', path);
  const formData = new FormData();
  formData.append("newFolderName", folderName);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create folder");
  }
}

export async function deleteItem(name: string, isDirectory: boolean, path: string[]): Promise<void> {
  const url = buildUrl('files', path);
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, isDirectory }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete item");
  }
}

export async function downloadFile(filePath: string[]): Promise<void> {
  const url = buildUrl('download', filePath);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to download file');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filePath[filePath.length - 1];
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}