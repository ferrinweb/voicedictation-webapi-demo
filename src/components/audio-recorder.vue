<!-- Author: ferrinweb -->
<!-- Create Time: 2018/11/26 17:53 -->
<!-- Description: audio-recorder -->
<template>
  <div class="audio-recorder">
    <audio class="audio" ref="audio" controls autoplay></audio>
    <div class="controls">
      <a href="javascript:" class="button" @click="start" v-if="!time">录音</a>
      <a href="javascript:" class="button active" @click="stop" v-if="time">停止</a>
      <a href="javascript:" class="button" @click="play">播放</a>
      <a href="javascript:" class="button" @click="dictation">识别</a>
      <a href="javascript:" class="button" :class="{'disabled': fileMode}" @click="download">下载</a>
      <a href="javascript:" class="button" :class="{'disabled': fileMode}" @click="destroy">终止</a>
    </div>
    <form class="file">
      <span>请录音，或者选择文件：</span>
      <div class="file-select">
        <input ref="file" type="file" name="audio" src="" @change="setAudioSrc">
        <input type="reset" class="button" value="重置" @click="reset">
      </div>
    </form>
    <p class="result">
      <span class="title">听写识别结果</span>
      <i class="time" v-if="time"> {{(time / 1000).toFixed(3)}}s</i>
      <loading v-if="processing"></loading>
      {{text}}
    </p>
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
      this.time = 0
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
    padding: 3em .5em .5em;
    box-sizing: border-box;
    > * {
      width: 100%;
    }
    * {
      box-sizing: border-box;
    }
  }
  .controls,
  .file,
  .result{
    width: calc(100% - 6px);
    margin-left: 3px;
    margin-right: 3px;
  }
  .controls{
    display: flex;
    justify-content: space-between;
  }
  .button{
    text-decoration: none;
    background-color: #41b883;
    flex-grow: 1;
    padding: 7px 12px;
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
      border-color: #35495e;
    }
    &.active{
      background-color: #4b667d;
      border-color: #4b667d;
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
    margin-bottom: 1em;
    display: block;
  }
  .file{
    line-height: 2em;
    margin-top: 1em;
    padding: .7em 1em;
    border-radius: 3px;
    border: #e2e2e2 1px solid;
    .file-select{
      display: flex;
    }
    [name="audio"]{
      background-color: #f2f2f2;
      padding: 5px;
      border-radius: 3px;
    }
  }
  .result{
    position: relative;
    padding: 2em 2em 1em;
    margin-top: 1em;
    line-height: 1.5em;
    background-color: #f2f2f2;
    border-radius: 3px;
    .title{
      position: absolute;
      top: 5px;
      left: 10px;
      font-size: .75em;
      color: #999;
    }
  }
</style>
