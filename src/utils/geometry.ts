import { toMercator, toWgs84 } from "@turf/turf";
/**
 * 根据折线生成等宽多边形
 * @param polyline
 * @param width
 * @returns
 */
export function generatePolygonFromPolyline(
  polyline: number[][],
  width: number
) {
  const halfWidth = width / 2;
  const leftSide: number[][] = [];
  const rightSide: number[][] = [];
  const segments: Array<number[][]> = [];

  for (let i = 0; i < polyline.length; i++) {
    const [x1, y1] = toMercator(polyline[i]);

    let prevSegment: number[] | null = null;
    let nextSegment: number[] | null = null;

    if (i > 0) {
      const [px, py] = toMercator(polyline[i - 1]);
      prevSegment = [x1 - px, y1 - py];
    }
    if (i < polyline.length - 1) {
      const [nx, ny] = toMercator(polyline[i + 1]);
      nextSegment = [nx - x1, ny - y1];
      segments.push([polyline[i], polyline[i + 1]]);
    }

    let nx: number | undefined, ny: number | undefined;
    if (prevSegment && nextSegment) {
      // 计算前后线段的法向量
      const [dx1, dy1] = prevSegment;
      const [dx2, dy2] = nextSegment;

      const length1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const length2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

      const normal1 = [-dy1 / length1, dx1 / length1];
      const normal2 = [-dy2 / length2, dx2 / length2];

      // 计算角平分线方向
      nx = normal1[0] + normal2[0];
      ny = normal1[1] + normal2[1];

      // 对角平分线归一化处理
      const bisectorLength = Math.sqrt(nx * nx + ny * ny);
      nx /= bisectorLength;
      ny /= bisectorLength;

      // 计算调整后的角平分线的长度因子，防止折角处顶点超出边界
      const angleBetween = -((dx1 * dx2 + dy1 * dy2) / (length1 * length2));
      const scale = halfWidth / Math.sin(Math.acos(angleBetween) / 2);
      // 调整角平分线的长度
      nx *= scale;
      ny *= scale;
    } else if (prevSegment) {
      const [dx1, dy1] = prevSegment;
      const length1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      nx = (-dy1 / length1) * halfWidth;
      ny = (dx1 / length1) * halfWidth;
    } else if (nextSegment) {
      const [dx2, dy2] = nextSegment;
      const length2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      nx = (-dy2 / length2) * halfWidth;
      ny = (dx2 / length2) * halfWidth;
    }

    // 计算左右两侧的顶点
    if (nx !== undefined && ny !== undefined) {
      rightSide.push(toWgs84([x1 + nx, y1 + ny]));
      leftSide.push(toWgs84([x1 - nx, y1 - ny]));
    }
  }

  // 生成完整的封闭多边形，连接左侧和右侧
  const polygon = [...leftSide, ...rightSide.reverse(), leftSide[0]];

  return {
    segments,
    polygon,
  };
}
