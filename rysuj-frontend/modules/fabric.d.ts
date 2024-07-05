import { IObjectOptions, Object as FabricObject } from "fabric";

declare module "fabric" {
  export interface Object {
    originalScaleX?: number;
    originalScaleY?: number;
    originalLeft?: number;
    originalTop?: number;
  }
}
