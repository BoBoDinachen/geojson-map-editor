import { IControl, Map } from "mapbox-gl";
import { ref, render } from "vue";

export class ViewModeControl implements IControl {
  public containerId = "view-mode-control";
  private map: Map | null = null;
  private _is2DView = false;
  onAdd(map: Map): HTMLElement {
    this.map = map;
    const container = document.createElement("div");
    container.id = this.containerId;
    container.className = "view-mode-control";
    render(this.createControl(), container);
    return container;
  }

  onRemove(map: Map): void {}

  public handleToggleViewMode() {
    const button: HTMLElement = document.querySelector(
      `#${this.containerId} > div`
    )!;
    this._is2DView = !this._is2DView;
    button.style.backgroundColor = this._is2DView ? "#1e88e5" : "#44a048";
    button.innerHTML = this._is2DView ? "2D" : "3D";
    this.map?.setPitch(this._is2DView ? 0 : 60);
    this.map?.setMaxPitch(this._is2DView ? 0 : 60);
  }

  createControl() {
    return (
      <div
        style={{
          backgroundColor: this._is2DView ? "#1e88e5" : "#44a048",
        }}
        onClick={() => {
          this.handleToggleViewMode();
        }}
      >
        {this._is2DView ? "2D" : "3D"}
      </div>
    );
  }
}
