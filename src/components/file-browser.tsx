"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { getFiles, uploadFiles } from "@/lib/api";
import { FileData } from "@/app/api/files/[[...path]]/route";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { Breadcrumb } from "./Breadcrumb";
import { FilesTable, ItemToDelete } from "./FilesTable";
import { DeleteItemDialog } from "./DeleteItemDialog";

export function FileBrowser() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const filesData = await getFiles(currentPath);
      setFiles(filesData);
    } catch {
      toast.error("Failed to fetch files.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;

    if (!uploadedFiles || uploadedFiles.length === 0) return;

    try {
      await uploadFiles(uploadedFiles, currentPath);
      toast.success("Upload realizado com sucesso.");
      fetchFiles();
    } catch {
      toast.error("Upload falhou.");
    }
  };

  const handleClickToDelete = (item: ItemToDelete) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Meu Drive</h1>
        <div className="flex gap-2">
          <CreateFolderDialog currentPath={currentPath} onFolderCreate={fetchFiles} />
          <Button onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="mr-2 h-4 w-4" />Upload
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" multiple />
        </div>
      </div>

      <Breadcrumb onClick={setCurrentPath} currentPath={currentPath} />

      <div className="border rounded-lg">
        <FilesTable
          currentPath={currentPath}
          files={files}
          isLoading={isLoading}
          onDirectoryClick={setCurrentPath}
          onClickToDelete={handleClickToDelete}
        />
      </div>

      <DeleteItemDialog
        currentPath={currentPath}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemToDelete={itemToDelete}
        onDeleteConfirm={fetchFiles}
        onDeleteConfirmEnd={() => {
          setItemToDelete(null);
          setIsDeleteDialogOpen(false);
        }}
      />
    </div>
  );
}