import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";
import useWindowSize from "@/lib/hooks/useWindowSize";
import { cn } from "@/lib/utils";

export interface CanvasRef {
  exportImage: (callback: BlobCallback) => void;
}

const Canvas = forwardRef<CanvasRef>((_, ref) => {
  const [fabricElement, setFabricElement] = useState<FabricCanvas | null>(null);
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(
    null,
  );

  useImperativeHandle(ref, () => ({
    exportImage(callback: BlobCallback) {
      if (!canvasElement) throw new Error("Canvas element not found");

      return canvasElement.toBlob(callback);
    },
  }));

  const [width, height] = useWindowSize();

  useEffect(() => {
    if (canvasElement && fabricElement) {
      const rect =
        canvasElement.parentElement?.parentElement?.getBoundingClientRect();
      if (!rect) throw new Error("Failed to get bounding client rect");

      const { width: newWidth, height: newHeight } = rect;
      canvasElement.width = newWidth;
      canvasElement.height = newHeight;

      fabricElement.setDimensions({ width: newWidth, height: newHeight });
    }
  }, [width, height, canvasElement, fabricElement]);

  useEffect(() => {
    if (canvasElement && !fabricElement) {
      const fabricCanvas = new FabricCanvas(canvasElement, {
        isDrawingMode: true,
        backgroundColor: "#FFF",
      });
      fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
      fabricCanvas.freeDrawingBrush.color = "#000";
      fabricCanvas.freeDrawingBrush.width = 16;

      setFabricElement(fabricCanvas);
    }

    return () => {
      fabricElement?.dispose();
    };
  }, [canvasElement, fabricElement]);

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
