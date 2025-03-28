declare namespace DrawCore {
  export type DrawPlaneOptions = {
    duration?: number;
    deleteAll?: boolean;
    drawMode?: string;
  };

  export type DrawPointOptions = {
    duration?: number;
    deleteAll?: boolean;
  };

  export type DrawSnapLineOptions = {
    duration?: number;
    deleteAll?: boolean;
    enableSnap: boolean;
    snapThreshold: number; //吸附线阈值，单位像素
    bounds: Array<number[][]>;
  };
}
