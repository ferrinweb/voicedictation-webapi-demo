import recordWorker from './record-worker'
const URL = window.URL || window.webkitURL
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia

const ERROR = {
  PERMISSION_DENIED: '用户拒绝提供信息。',
  PermissionDeniedError: '用户拒绝提供信息。',
  NOT_SUPPORTED_ERROR: '浏览器不支持录音功能。',
  NotSupportedError: '浏览器不支持录音功能。',
  MANDATORY_UNSATISFIED_ERROR: '无法发现指定的硬件设备。',
  MandatoryUnsatisfiedError: '无法发现指定的硬件设备。'
}

const Recorder = function (config = {}) {
  this.throwError = (config && config.error) || function (message) {
    console.error(message)
  }

  const onsuccess = stream => {
    // 创建一个音频环境对象
    const AudioContextProxy = window.AudioContext || window.webkitAudioContext
    const context = new AudioContextProxy()

    // 将声音输入这个对像
    const audioInput = context.createMediaStreamSource(stream)

    const defaultConfig = {
      sampleRate: 48000, // 采样率(48000)，注意：设定的值必须为 48000 的约数
      bufferSize: 4096, // 缓存大小，用来缓存声音
      sampleBits: 16, // 采样比特率，8 或 16
      twoChannel: false // 双声道
    }

    config = Object.assign({}, defaultConfig, config)

    let channelNumber = config.twoChannel ? 2 : 1

    // 加载并启动 record worker
    let workerString = recordWorker.toString()
    // 移除函数包裹
    workerString = workerString.substr(workerString.indexOf('{') + 1)
    workerString = workerString.substr(0, workerString.lastIndexOf('}'))
    const workerBlob = new Blob([workerString])
    const workerURL = URL.createObjectURL(workerBlob)
    const worker = new Worker(workerURL)

    worker.postMessage({
      command: 'init',
      config
    })

    let recorder = null
    if (context.createScriptProcessor) {
      recorder = context.createScriptProcessor(config.bufferSize, channelNumber, channelNumber)
    } else if (context.createJavaScriptNode) {
      recorder = context.createJavaScriptNode(config.bufferSize, channelNumber, channelNumber)
    } else {
      this.throwError(ERROR['NotSupportedError'])
    }

    this.recording = false
    let callback = null
    let audioBlob = null

    this.start = () => {
      if (this.recording) return
      audioBlob = null
      audioInput.connect(recorder)
      recorder.connect(audioInput.context.destination)
      this.recording = true
    }

    this.stop = (success) => {
      if (!this.recording) return
      callback = success
      audioInput.disconnect(recorder)
      recorder.disconnect(audioInput.context.destination)
      this.recording = false
    }

    this.clear = () => {
      if (this.recording) {
        alert('请先停止录音！')
        return
      }
      worker.postMessage({
        command: 'clear'
      })
    }

    this.getBuffer = success => {
      callback = success
      worker.postMessage({
        command: 'getBuffer'
      })
    }

    this.getSource = () => {
      return new Promise((resolve) => {
        if (audioBlob) {
          resolve(audioBlob)
        } else {
          this.exportWAV(data => {
            resolve(data)
          })
        }
      })
    }

    const download = filename => {
      let url = URL.createObjectURL(audioBlob)
      let link = document.createElement('a')
      link.href = url
      link.download = filename || new Date().getTime() + '.wav'
      link.click()
      link = null
    }

    this.download = filename => {
      if (!audioBlob) {
        this.exportWAV(data => {
          audioBlob = data
          download(filename)
        })
        return
      }
      download(filename)
    }

    const play = player => {
      const src = URL.createObjectURL(audioBlob)
      if (!player) {
        player = document.createElement('audio')
        player.controls = 'controls'
        player.autoplay = 'autoplay'
        player.onended = () => {
          player = null
        }
      }
      player.src = src
    }

    this.play = player => {
      if (!audioBlob) {
        this.exportWAV(data => {
          audioBlob = data
          play(player)
        })
        return
      }
      play(player)
    }

    this.exportWAV = (success, type) => {
      if (audioBlob) {
        callback && callback(audioBlob)
        return
      }
      callback = success
      type = type || config.type || 'audio/wav'
      worker.postMessage({
        command: 'exportWAV',
        type
      })
    }

    // 销毁录制对象
    this.destroy = () => {
      recorder = null
      context.state !== 'closed' && context.suspend() && context.close()
    }

    worker.onmessage = e => {
      callback && callback(e.data)
    }

    // 音频采集
    recorder.onaudioprocess = e => {
      if (this.recording) {
        const buffer = !config.twoChannel ? [
          e.inputBuffer.getChannelData(0)
        ] : [
          e.inputBuffer.getChannelData(0),
          e.inputBuffer.getChannelData(1)
        ]
        worker.postMessage({
          command: 'record',
          buffer
        })
      }
    }
  }

  if (navigator.getUserMedia) {
    navigator.getUserMedia(
      {
        audio: true
      },
      onsuccess,
      error => {
        this.throwError(ERROR[error.code || error.name] || '无法打开麦克风。异常信息:' + (error.code || error.name))
      }
    )
  } else {
    this.throwError('浏览器不支持录音功能。')
  }
}

export default Recorder
