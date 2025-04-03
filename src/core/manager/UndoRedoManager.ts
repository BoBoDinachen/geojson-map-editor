export interface EditAction {
  apply: () => void; // 执行操作
  undo: () => void; // 逆向执行操作
}

class UndoRedoManager {
  private undoStack: EditAction[] = [];
  private redoStack: EditAction[] = [];

  constructor() {
    this._addKeyboardListener();
  }

  // 执行新操作
  execute(action: EditAction) {
    action.apply(); // 应用操作
    this.undoStack.push(action); // 记录到撤销栈
    this.redoStack = []; // 执行新操作时，清空重做栈
  }

  // 撤销 (Undo)
  undo() {
    if (this.undoStack.length === 0) return;
    const action = this.undoStack.pop()!;
    action.undo(); // 执行逆操作
    this.redoStack.push(action);
  }

  // 重做 (Redo)
  redo() {
    if (this.redoStack.length === 0) return;
    const action = this.redoStack.pop()!;
    action.apply(); // 重新应用操作
    this.undoStack.push(action);
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  dispose() {
    window.removeEventListener("keydown", this._handleShortcut);
    this.undoStack = [];
    this.redoStack = [];
  }

  private _addKeyboardListener() {
    window.addEventListener("keydown", this._handleShortcut.bind(this));
  }

  private _handleShortcut(event: KeyboardEvent) {
    if (event.ctrlKey && event.code === "KeyZ") {
      if (event.shiftKey) {
        this.redo(); // `Ctrl + Shift + Z`→ 重做
        console.log("===重做===");
        console.table({ undoStack: this.undoStack, redoStack: this.redoStack });
      } else {
        this.undo(); // `Ctrl + Z` → 撤销
        console.log("===撤销===",);
        console.table({ undoStack: this.undoStack, redoStack: this.redoStack });
      }
    }
  }
}

export default new UndoRedoManager();
