"use client";
import { Button } from "@/components/ui/button";
import { deleteUser } from "@/lib/action/user.action";
import React, { useState } from "react";

import { DeleteUserParams } from "@/lib/action/user.action";

const Delete = (id: DeleteUserParams) => {
  const [loading, setIsLoading] = useState(false);
  const handleDelete = async () => {
    setIsLoading(true);
    console.log("Delete user", id);

    await deleteUser(id);
    setIsLoading(false);
  };
  return (
    <div>
      <Button
        disabled={loading}
        variant="destructive"
        size="sm"
        onClick={() => handleDelete()}
      >
        {loading ? "Deleteing.." : "Delete"}
      </Button>
    </div>
  );
};

export default Delete;
