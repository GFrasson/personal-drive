"use client";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteItem } from "@/lib/api";
import { toast } from "sonner";
import { ItemToDelete } from "./FilesTable";

interface DeleteItemDialogProps {
  currentPath: string[];
  isOpen: boolean;
  itemToDelete: ItemToDelete | null;
  onOpenChange: (isOpen: boolean) => void;
  onDeleteConfirm: () => void;
  onDeleteConfirmEnd: () => void;
}

export function DeleteItemDialog({
  currentPath,
  isOpen,
  itemToDelete,
  onOpenChange,
  onDeleteConfirm,
  onDeleteConfirmEnd
}: DeleteItemDialogProps) {
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) {
      return;
    }

    try {
      await deleteItem(itemToDelete.name, itemToDelete.isDirectory, currentPath);
      toast.success(`"${itemToDelete.name}" deletado.`);
      onDeleteConfirm();
    } catch {
      toast.error(`Não foi possível deletar "${itemToDelete.name}".`);
    } finally {
      onDeleteConfirmEnd();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. <span className="font-bold">{itemToDelete?.name}</span> será deletado permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}