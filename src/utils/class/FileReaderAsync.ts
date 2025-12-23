type ReadMethod = 'text' | 'arrayBuffer' | 'dataURL' | 'binaryString'

export class FileReaderAsync {
  static read<T extends ReadMethod>(
    file: File | Blob,
    method: T,
    encoding?: string
  ): Promise<
    T extends 'text'
      ? string
      : T extends 'arrayBuffer'
      ? ArrayBuffer
      : T extends 'dataURL'
      ? string
      : T extends 'binaryString'
      ? string
      : never
  > {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => resolve(event.target?.result as any)
      reader.onerror = (error) => reject(error)

      switch (method) {
        case 'text':
          reader.readAsText(file, encoding)
          break
        case 'arrayBuffer':
          reader.readAsArrayBuffer(file)
          break
        case 'dataURL':
          reader.readAsDataURL(file)
          break
        default:
          reject(new Error(`Unsupported method: ${method}`))
      }
    })
  }

  static text(file: File | Blob, encoding?: string): Promise<string> {
    return this.read(file, 'text', encoding)
  }

  static arrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
    return this.read(file, 'arrayBuffer')
  }

  static dataURL(file: File | Blob): Promise<string> {
    return this.read(file, 'dataURL')
  }
}
