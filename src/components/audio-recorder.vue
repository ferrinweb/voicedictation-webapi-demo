<!-- Author: ferrinweb -->
<!-- Create Time: 2018/11/26 17:53 -->
<!-- Description: audio-recorder -->
<template>
  <div class="audio-recorder">
    <audio class="audio" ref="audio" controls autoplay></audio>
    <div class="controls">
      <a href="javascript:" class="button" @click="start" v-if="!time">录音</a>
      <a href="javascript:" class="button" @click="stop" v-if="time">停止
        <i class="time"> {{(time / 1000).toFixed(3)}}s</i>
      </a>
      <a href="javascript:" class="button" @click="play">播放</a>
      <a href="javascript:" class="button" @click="dictation">识别</a>
      <a href="javascript:" class="button" :class="{'disabled': fileMode}" @click="download">下载</a>
      <a href="javascript:" class="button" :class="{'disabled': fileMode}" @click="destroy">终止</a>
    </div>
    <form class="file">
      <span>请录音，或者选择文件：</span>
      <input ref="file" type="file" name="audio" src="" @change="setAudioSrc">
      <input type="reset" class="button" value="重置" @click="reset">
    </form>
    <p class="result"><loading v-if="processing"></loading>{{text}}</p>
  </div>
</template>

<script>
import Recorder from '@/utils/recorder'
import { IAT } from '@/api/iat-api'
import ASRConfig from '@/api/asr-config'
import readAsDataUrl from '@/utils/readAsDataUrl'
import loading from '@/components/loading'
export default {
  name: 'audio-recorder',
  components: {
    loading
  },
  data () {
    return {
      recorder: null,
      startTime: 0,
      endTime: 0,
      time: 0,
      timer: null,
      text: '',
      fileMode: false,
      audioDataUrl: null,
      audioDataBlob: null,
      processing: false
    }
  },
  methods: {
    start () {
      if (this.timer) return
      this.reset()
      this.recorder.clear()
      this.recorder.start()
      this.startTime = new Date().getTime()
      this.timer = setInterval(() => {
        this.time = new Date().getTime() - this.startTime
      }, 20)
    },
    stop () {
      this.recorder.stop()
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      setTimeout(() => {
        this.time = 0
      }, 200)
      this.recorder.getSource().then(data => {
        this.audioDataBlob = data
        readAsDataUrl(data).then(data => {
          this.audioData = data
          this.dictation()
        })
      })
    },
    play () {
      this.$refs.audio.src = this.audioData
    },
    download () {
      this.recorder.download()
    },
    destroy () {
      this.recorder.destroy()
    },
    // 选择文件上传识别，并播放
    setAudioSrc () {
      let file = this.$refs.file.files[0]
      if (file) {
        this.fileMode = true
        this.audioDataBlob = file
        readAsDataUrl(file).then(data => {
          this.audioData = data
          this.dictation()
        })
      } else {
        this.fileMode = false
      }
    },
    reset () {
      this.fileMode = false
      this.text = ''
      this.$refs.audio.src = ''
      this.audioData = null
      this.audioDataBlob = null
    },
    dictation () {
      if (!this.audioDataBlob) {
        alert('请先选择文件或录音！')
        return
      }
      this.text = ''
      this.processing = true
      IAT(this.audioDataBlob).then(response => {
        this.processing = false
        this.text = response.data.data
      })
    }
  },
  mounted () {
    let {sampleRate, sampleBits} = ASRConfig
    this.recorder = new Recorder({sampleRate, sampleBits})
  },
  beforeDestroy () {
    this.recorder = null
  }
}
</script>

<style lang="scss" scoped>
  .audio-recorder{
    padding-top: 3em;
    * {
      box-sizing: border-box;
    }
  }
  .controls,
  .file,
  .result{
    width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
  .controls{
    display: flex;
    justify-content: space-between;
  }
  .button{
    text-decoration: none;
    background-color: #41b883;
    padding: 7px 18px;
    white-space: nowrap;
    display: inline-block;
    margin-left: 10px;
    border-radius: 3px;
    border: #41b883 1px solid;
    color: white;
    outline: none!important;
    &:first-child{
      margin-left: 0;
    }
    &:hover{
      background-color: #35495e;
      border: #35495e 1px solid;
    }
    &.disabled{
      background-color: grey;
      border-color: grey;
      pointer-events: none;
    }
  }
  .time{
    font-family: Consolas;
  }
  .audio{
    width: 410px;
    margin: 0 auto 1em;
    display: block;
  }
  .file{
    line-height: 2em;
    margin-top: 1em;
    padding: .7em 1em;
    border-radius: 3px;
    border: #e2e2e2 1px solid;
    [name="audio"]{
      background-color: #f2f2f2;
      padding: 5px;
      border-radius: 3px;
    }
  }
  .result{
    padding: 1em 2em;
    margin-top: 1em;
    line-height: 1.5em;
    background-color: #f2f2f2;
    border-radius: 3px;
  }
</style>
