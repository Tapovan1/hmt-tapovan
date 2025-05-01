import LoadingBox from "@/components/LoadingBox";
import React from "react";

const loading = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center ">
      <LoadingBox />
    </div>
  );
};

export default loading;
