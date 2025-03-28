import { DrawRectangleMode } from "./rectangle";
import { CircleMode } from "./circle_mode";
import { DrawPointMode } from "./draw_point_mode";
import { DrawPolygonMode } from "./draw_polygon";
import { SnapLineMode } from "./snap_line_mode";

export {
  DrawRectangleMode,
  CircleMode,
  DrawPointMode,
  DrawPolygonMode,
  SnapLineMode,
};

export enum DrawModeEnum {
  "RECTANGLE_MODE" = "draw_rectangle",
  "CIRCLE_MODE" = "draw_circle",
  "POLYGON_MODE" = "draw_polygon",
  "SNAP_LINE_MODE" = "draw_snap_line",
  "MEASURE_LINE_MODE" = "draw_measure_line",
  "POINT_MODE" = "draw_point",
}
