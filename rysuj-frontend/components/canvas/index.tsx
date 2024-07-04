"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useEffect, useState, MouseEvent } from "react";

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);

  useEffect(() => {
    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [painting, setPainting] = useState(false);
  const [width, height] = useWindowSize();

  const draw = (e: MouseEvent) => {
    if (!painting) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const { clientX, clientY } = e;
    const { offsetLeft, offsetTop } = canvas;

    ctx.lineTo(clientX - offsetLeft, clientY - offsetTop);
    ctx.stroke();
  };

  const startPainting = (e: MouseEvent) => {
    setPainting(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      const { clientX, clientY } = e;
      const { offsetLeft, offsetTop } = canvas;

      ctx.beginPath();
      ctx.moveTo(clientX - offsetLeft, clientY - offsetTop);
    }
  };

  const finishedPainting = () => {
    setPainting(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const { width: newWidth, height: newHeight } = rect;

      canvas.width = newWidth;
      canvas.height = newHeight;
    }
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
      }
    }
  });

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        { "h-full": width > height, "w-full": width < height },
        "min-w-0 max-w-full min-h-0 max-h-full aspect-square bg-white",
      )}
      onMouseDown={startPainting}
      onMouseUp={finishedPainting}
      onMouseMove={draw}
      onMouseLeave={finishedPainting}
    />
  );
}
