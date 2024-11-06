export class Singleton {

  private static _instance: any;

  protected constructor() {
  }

  // 静态方法，用于获取或创建单例实例
  public static getInstance<T>(): T {
    if (!this._instance) {
      this._instance = new this();
    }
    return this._instance as T;
  }
}
