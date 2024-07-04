/* eslint-disable no-param-reassign */

"use client";

import { cn } from "@/lib/utils";
import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";

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

export interface CanvasRef {
  toJSON: () => string;
}

interface Props {
  drawing: string;
}

const Canvas = forwardRef<CanvasRef, Props>(({ drawing }, ref) => {
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(
    null,
  );
  const [fabricElement, setFabricElement] = useState<FabricCanvas | null>(null);

  const [width, height] = useWindowSize();

  useImperativeHandle(ref, () => ({
    toJSON: () => {
      if (fabricElement && canvasElement) {
        // Calculate the inverse scale factor based on current canvas size
        const scaleFactor =
          1024 / Math.min(canvasElement.width, canvasElement.height);

        // Temporarily downscale objects for serialization
        fabricElement.getObjects().forEach((obj) => {
          obj.scaleX *= scaleFactor;
          obj.scaleY *= scaleFactor;
          obj.left *= scaleFactor;
          obj.top *= scaleFactor;
          obj.setCoords();
        });

        // Serialize the canvas to JSON
        const json = JSON.stringify(fabricElement.toJSON());

        // Revert the scaling to preserve original editing state
        fabricElement.getObjects().forEach((obj) => {
          obj.scaleX /= scaleFactor;
          obj.scaleY /= scaleFactor;
          obj.left /= scaleFactor;
          obj.top /= scaleFactor;
          obj.setCoords();
        });

        fabricElement.renderAll();
        return json;
      }
      return "{}";
    },
  }));

  useEffect(() => {
    if (canvasElement) {
      const rect = (
        canvasElement.parentElement?.parentElement as HTMLElement
      ).getBoundingClientRect();
      const { width: newWidth, height: newHeight } = rect;

      canvasElement.width = newWidth;
      canvasElement.height = newHeight;

      if (fabricElement) {
        fabricElement.setWidth(newWidth);
        fabricElement.setHeight(newHeight);
      }
    }
  }, [width, height, canvasElement, fabricElement]);

  useEffect(() => {
    if (canvasElement && !fabricElement) {
      const fabricCanvas = new FabricCanvas(canvasElement, {
        isDrawingMode: true,
        backgroundColor: "#FFF",
      });
      fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
      fabricCanvas.freeDrawingBrush.color = "#fff";
      fabricCanvas.freeDrawingBrush.width = 16;

      fabricCanvas.renderAll();

      setFabricElement(fabricCanvas);
    }

    return () => {
      fabricElement?.dispose();
    };
  }, [canvasElement, fabricElement]);

  useEffect(() => {
    if (fabricElement) {
      const scaleFactor = canvasElement
        ? Math.min(canvasElement.width, canvasElement.height) / 1024
        : 1;

      fabricElement.loadFromJSON(drawing).then(() => {
        fabricElement.getObjects().forEach((obj) => {
          obj.scaleX *= scaleFactor;
          obj.scaleY *= scaleFactor;
          obj.left *= scaleFactor;
          obj.top *= scaleFactor;
          obj.setCoords();
        });
        fabricElement.renderAll();
      });
    }
  }, [drawing, fabricElement, canvasElement]);

  useEffect(() => {
    if (canvasElement) {
      const pixelRatio = window.devicePixelRatio;
      const rect = canvasElement.getBoundingClientRect();

      canvasElement.width = rect.width * pixelRatio;
      canvasElement.height = rect.height * pixelRatio;

      if (fabricElement) {
        fabricElement.setDimensions({
          width: rect.width,
          height: rect.height,
        });
        fabricElement.setZoom(1 / pixelRatio);
      }
    }
  }, [width, height, canvasElement, fabricElement]);

  return (
    <div
      className={cn(
        { "h-full": width > height, "w-full": width < height },
        "min-w-0 max-w-[1024px] min-h-0 max-h-[1024px] aspect-square",
      )}
    >
      <canvas ref={setCanvasElement} />
    </div>
  );
});

export default Canvas;
