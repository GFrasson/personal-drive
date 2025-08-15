"use client";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { FolderPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createFolder } from "@/lib/api";
import { toast } from "sonner";

interface CreateFolderDialogProps {
  currentPath: string[];
  onFolderCreate: () => void;
}

export function CreateFolderDialog({ currentPath, onFolderCreate }: CreateFolderDialogProps) {
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
      await createFolder(newFolderName, currentPath);
      toast.success(`Pasta "${newFolderName}" criada.`);
      onFolderCreate();
    } catch {
      toast.error(`Não foi possível criar a pasta ${newFolderName}`);
    } finally {
      setNewFolderName("");
      setIsCreateFolderOpen(false);
    }
  };

  return (
    <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderPlus className="mr-2 h-4 w-4" />Criar pasta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar nova pasta</DialogTitle>
          <DialogDescription>Digite um nome para sua nova pasta.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nome</Label>
            <Input id="name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateFolder}>Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}