import { toMercator, toWgs84 } from '@turf/turf'
import { LngLatLike } from 'mapbox-gl'

/**
 * 防抖
 * @param func
 * @param delay
 * @returns
 */
function debounce(func: Function, delay: number) {
  let timer: any
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * 复制文本到剪切板
 * @param text
 * @returns
 */
function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      window.$message?.success('Copy successfully')
    })
    return
  }
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed' // 防止在 Safari 中滚动到文本顶部
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
  window.$message?.success('Copy successfully')
}

function exportJSON(data: Object, filename = 'data.json') {
  if (!filename.includes('.')) {
    filename += '.json'
  }

  // 将 JSON 数据转换为字符串
  const jsonStr = JSON.stringify(data, null, 2)

  // 创建 Blob 对象
  const blob = new Blob([jsonStr], { type: 'application/json' })

  // 创建 URL 对象
  const url = URL.createObjectURL(blob)

  // 创建 `<a>` 标签
  const a = document.createElement('a')
  a.href = url
  a.download = filename // 设置下载的文件名
  document.body.appendChild(a)
  a.click() // 触发下载
  document.body.removeChild(a)

  // 释放 URL 对象
  URL.revokeObjectURL(url)
}

function capitalizeFirstLetter(str: string) {
  if (typeof str !== 'string' || str.length === 0) {
    return str
  }
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 延时函数
 * @param ms
 * @returns
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const Utils = {
  debounce,
  copyToClipboard,
  exportJSON,
  capitalizeFirstLetter,
  sleep,
}

export function loadImageWAndH(imageUrl: string): Promise<{ width: number; height: number }> {
  const image = new Image()
  return new Promise((resolve, reject) => {
    image.onload = function () {
      resolve({
        width: image.width,
        height: image.height,
      })
    }
    image.onerror = function (e: any) {
      reject(e)
    }
    image.src = imageUrl
  })
}

export function getLngLatCoordinatesByCenter(center: LngLatLike | number[], width: number, ratio: number) {
  const centerPixel = toMercator(center)
  const topLeftPixel = {
    x: centerPixel[0] - width / 2,
    y: centerPixel[1] - (width * ratio) / 2,
  }
  const bottomRightPixel = {
    x: centerPixel[0] + width / 2,
    y: centerPixel[1] + (width * ratio) / 2,
  }
  const topLeftCoordinates = toWgs84([topLeftPixel.x, topLeftPixel.y])
  const bottomRightCoordinates = toWgs84([bottomRightPixel.x, bottomRightPixel.y])

  return [
    [topLeftCoordinates[0], bottomRightCoordinates[1]],
    [bottomRightCoordinates[0], bottomRightCoordinates[1]],
    [bottomRightCoordinates[0], topLeftCoordinates[1]],
    [topLeftCoordinates[0], topLeftCoordinates[1]],
  ] as [[number, number], [number, number], [number, number], [number, number]]
}
