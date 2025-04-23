"use client";
import { Button } from "@/components/ui/button";
import { deleteStudentAbsence } from "@/lib/action/student-absence.action";
import { Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const DeleteButton = ({ id }: { id: string }) => {
  const handleDelete = async () => {
    await deleteStudentAbsence(id);
    toast("Student absence deleted successfully");
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-destructive hover:text-destructive"
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};

export default DeleteButton;
