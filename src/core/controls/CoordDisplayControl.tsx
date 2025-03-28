import { IControl, Map } from "mapbox-gl";
import { render, watch } from "vue";

export class CoordDisplayControl implements IControl {
  public containerId = "coord-control";
  onAdd(map: Map): HTMLElement {
    const container = document.createElement("div");
    container.id = this.containerId;
    container.className = "coord-control";
    render(this.createCoordDisplay(map, this.containerId), container);
    return container;
  }

  onRemove(map: Map): void {
    map.off("mousemove", () => {});
    map.off("zoom", () => {});
  }
  createCoordDisplay(map: Map, containerId: string) {
    let coordSpan: NodeListOf<Element>;
    let zoomSpan: HTMLElement | null = null;
    let fpsSpan: HTMLElement | null = null;
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 0;
    map.on("mousemove", (e) => {
      if (!coordSpan) {
        coordSpan = document.querySelectorAll(`#${containerId} .coord-value`)!;
      } else {
        const { lng, lat } = e.lngLat;
        coordSpan[0].innerHTML = `[${lng.toFixed(8)}°N，${lat.toFixed(8)}°E]`;
      }
    });
    map.on("zoom", (e) => {
      if (!zoomSpan) {
        zoomSpan = document.querySelector(`#${containerId} .zoom-value`)!;
      } else {
        zoomSpan.innerHTML = `${e.target.getZoom().toFixed(2)}`;
      }
    });
    map.on("render", () => {
      frameCount++;
      const now = performance.now();
      const delta = now - lastTime;
      if (!fpsSpan) {
        fpsSpan = document.querySelector(`#${containerId} .render-fps`)!;
      }
      if (delta >= 1000) {
        // 每秒更新一次 FPS
        fps = (frameCount / delta) * 1000;
        // console.log(`FPS: ${fps.toFixed(2)}`)
        fpsSpan && (fpsSpan.innerHTML = `${fps.toFixed(2)}`);
        frameCount = 0;
        lastTime = now;
      }
    });
    return (
      <div class="coord-wrap">
        <div>
          <span>Zoom：</span>
          <span class="zoom-value">0</span>
        </div>
        <div>
          <span>LngLat：</span>
          <span class="coord-value">[0，0]</span>
        </div>
        <div>
          <span>FPS：</span>
          <span class="render-fps">0</span>
        </div>
      </div>
    );
  }
}
