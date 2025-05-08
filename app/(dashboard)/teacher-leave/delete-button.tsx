"use client";
import { Button } from "@/components/ui/button";

import { deleteTeacherLeave } from "@/lib/action/teacherLeave.action";
import { Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const DeleteButton = ({ id }: { id: string }) => {
  console.log("DeleteButton", id);

  const handleDelete = async () => {
    await deleteTeacherLeave(id);
    toast("Leave request deleted successfully");
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
