<template>
  <div id="app">
    <img alt="Vue logo" class="logo" src="./assets/logo.png">
    <audio-recorder></audio-recorder>
  </div>
</template>

<script>
import audioRecorder from './components/audio-recorder'

export default {
  name: 'app',
  components: {
    audioRecorder
  }
}
</script>

<style lang="scss">
  html,
  body{
    margin: 0;
    overflow: hidden;
  }
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
  .audio-recorder{
    max-width: 400px;
    width: 100%;
    margin: auto;
  }
  @media screen and (max-width: 720px) {
    .logo{
      width: 120px;
    }
  }
</style>
