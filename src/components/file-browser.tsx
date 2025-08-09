"use client";

import { useEffect, useRef, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreVertical, UploadCloud, FolderPlus, ChevronRight, Home } from "lucide-react";
import { toast } from "sonner";
import { getFiles, uploadFiles, deleteItem, downloadFile, createFolder } from "@/lib/api";
import { getIconForFile } from "@/lib/icons";
import { FileData } from "@/app/api/files/[[...path]]/route";

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function FileBrowser() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ name: string; isDirectory: boolean } | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
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

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) {
      return;
    }

    try {
      await deleteItem(itemToDelete.name, itemToDelete.isDirectory, currentPath);
      toast.success(`"${itemToDelete.name}" deletado.`);
      fetchFiles();
    } catch {
      toast.error(`Não foi possível deletar "${itemToDelete.name}".`);
    } finally {
      setItemToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      await downloadFile([...currentPath, filename]);
      toast(`O download do arquivo "${filename}" foi iniciado.`);
    } catch {
      toast.error(`Não foi possível baixar o arquivo "${filename}".`);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
      await createFolder(newFolderName, currentPath);
      toast.success(`Pasta "${newFolderName}" criada.`);
      fetchFiles();
    } catch {
      toast.error(`Não foi possível criar a pasta ${newFolderName}`);
    } finally {
      setNewFolderName("");
      setIsCreateFolderOpen(false);
    }
  };

  const handleNavigate = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">My Drive</h1>
        <div className="flex gap-2">
          <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><FolderPlus className="mr-2 h-4 w-4" />Criar pasta</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Criar nova pasta</DialogTitle><DialogDescription>Digite um nome para sua nova pasta.</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nome</Label>
                  <Input id="name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="col-span-3" />
                </div>
              </div>
              <DialogFooter><Button onClick={handleCreateFolder}>Criar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={() => fileInputRef.current?.click()}><UploadCloud className="mr-2 h-4 w-4" />Upload</Button>
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" multiple />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Home className="h-4 w-4 cursor-pointer" onClick={() => setCurrentPath([])} />
        {currentPath.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            <span className="cursor-pointer hover:underline" onClick={() => handleBreadcrumbClick(index)}>{segment}</span>
          </div>
        ))}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead className="w-[40px]"></TableHead><TableHead>Nome</TableHead><TableHead>Tamanho</TableHead><TableHead>Última modificação</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Carregando arquivos...</TableCell></TableRow>
            ) : files.length > 0 ? (
              files.map((file) => (
                <TableRow key={file.name} onDoubleClick={() => file.isDirectory && handleNavigate(file.name)} className={file.isDirectory ? 'cursor-pointer' : ''}>
                  <TableCell>{getIconForFile(file.name, file.isDirectory)}</TableCell>
                  <TableCell className="font-medium" onClick={() => file.isDirectory && handleNavigate(file.name)}>{file.name}</TableCell>
                  <TableCell>{file.isDirectory ? "-" : formatBytes(file.size)}</TableCell>
                  <TableCell>{new Date(file.lastModified).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menu</span><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!file.isDirectory && <DropdownMenuItem onClick={() => handleDownload(file.name)}>Download</DropdownMenuItem>}
                        <DropdownMenuItem className="text-red-500" onClick={() => { setItemToDelete({ name: file.name, isDirectory: file.isDirectory }); setIsDeleteDialogOpen(true); }}>Deletar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="h-14"><TableCell colSpan={5} className="text-center">Nenhum arquivo encontrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita. <span className="font-bold">{itemToDelete?.name}</span> será deletado permanentemente.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm}>Confirmar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}