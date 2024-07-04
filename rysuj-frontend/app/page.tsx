import React from "react";
import Canvas from "@/components/canvas";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col gap-2 w-full h-full items-center">
      <Canvas />
      <Button>Submit</Button>
    </div>
  );
}
