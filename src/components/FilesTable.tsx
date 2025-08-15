"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { getIconForFile } from "@/lib/icons";
import { downloadFile } from "@/lib/api";
import { FileData } from "@/app/api/files/[[...path]]/route";
import { toast } from "sonner";
import { Button } from "./ui/button";

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

export interface ItemToDelete {
  name: string;
  isDirectory: boolean
}

interface FilesTableProps {
  currentPath: string[];
  isLoading: boolean;
  files: FileData[];
  onDirectoryClick: (path: string[]) => void;
  onClickToDelete: (item: ItemToDelete) => void;
}

export function FilesTable({
  currentPath,
  isLoading,
  files,
  onDirectoryClick,
  onClickToDelete
}: FilesTableProps) {
  const handleNavigate = (folderName: string) => {
    onDirectoryClick([...currentPath, folderName]);
  };

  const handleDownload = async (filename: string) => {
    try {
      await downloadFile([...currentPath, filename]);
      toast(`O download do arquivo "${filename}" foi iniciado.`);
    } catch {
      toast.error(`Não foi possível baixar o arquivo "${filename}".`);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]"></TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Tamanho</TableHead>
          <TableHead>Última modificação</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">Carregando arquivos...</TableCell>
          </TableRow>
        ) : files.length > 0 ? (
          files.map((file) => (
            <TableRow
              key={file.name}
              onDoubleClick={() => file.isDirectory && handleNavigate(file.name)}
              className={file.isDirectory ? 'cursor-pointer' : ''}
            >
              <TableCell>
                {getIconForFile(file.name, file.isDirectory)}
              </TableCell>
              <TableCell className="font-medium" onClick={() => file.isDirectory && handleNavigate(file.name)}>
                {file.name}
              </TableCell>
              <TableCell>
                {file.isDirectory ? "-" : formatBytes(file.size)}
              </TableCell>
              <TableCell>
                {new Date(file.lastModified).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!file.isDirectory &&
                      <DropdownMenuItem onClick={() => handleDownload(file.name)}>
                        Download
                      </DropdownMenuItem>
                    }
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() => {
                        onClickToDelete({ name: file.name, isDirectory: file.isDirectory });
                      }}
                    >
                      Deletar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="h-14">
            <TableCell colSpan={5} className="text-center">Nenhum arquivo encontrado</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}