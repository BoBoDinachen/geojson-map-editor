/**
 * 防抖
 * @param func
 * @param delay
 * @returns
 */
function debounce(func: Function, delay: number) {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export const Utils = {
  debounce,
};
