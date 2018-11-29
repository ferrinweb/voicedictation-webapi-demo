/**
 * Convert Blob To DataUrl
 * @param blob
 * @return {Promise<any>}
 */
const readAsDataURL = function (blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (e) {
      resolve(e.target.result)
    }
    reader.onerror = function (e) {
      reject(e)
    }
    reader.readAsDataURL(blob)
  })
}

export default readAsDataURL
