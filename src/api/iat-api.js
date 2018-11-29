import request from './request'
import {saltMd5} from '@/utils/salt-md5'
import {Base64} from 'js-base64'
import readAsArrayBuffer from '@/utils/readAsArrayBuffer'
import arrayBufferToBase64 from '@/utils/arrayBufferToBase64'
import host from './host'
import ASRConfig from './asr-config'

export function IAT (audio) {
  let {engineType, aue} = ASRConfig
  let param = {
    engine_type: engineType,
    aue
  }
  let curTime = (new Date().getTime() / 1000) | 0 + ''
  param = Base64.encode(JSON.stringify(param))

  const upload = buffer => {
    return request({
      url: host + 'asr',
      method: 'post',
      data: 'audio=' + encodeURI(arrayBufferToBase64(buffer)),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-Appid': ASRConfig.appId,
        'X-CurTime': curTime,
        'X-Param': param,
        'X-CheckSum': saltMd5(ASRConfig.APIKey + curTime + param)
      }
    })
  }

  let typeString = audio.toString()
  if (typeString.length === 13 && (typeString.indexOf('File') !== -1 || typeString.indexOf('Blob') !== -1)) {
    return readAsArrayBuffer(audio).then(buffer => {
      return upload(buffer)
    })
  } else {
    return upload(audio)
  }
}
