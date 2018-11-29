/**
 * Convert Blob To ArrayBuffer
 * @param blob {blob|file}
 * @return {Promise<any>}
 */
const readAsArrayBuffer = function (blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (e) {
      resolve(e.target.result)
    }
    reader.onerror = function (e) {
      reject(e)
    }
    reader.readAsArrayBuffer(blob)
  })
}

export default readAsArrayBuffer
