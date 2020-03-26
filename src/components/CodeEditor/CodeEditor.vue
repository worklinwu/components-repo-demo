<template>
  <el-container class="m-code-editor">
    <el-header class="brick-header" height="50px">
      <div class="title">{{ title }}</div>
      <div class="controls">
        <el-radio-group class="device-type" size="mini" v-if="viewType < 70" v-model="deviceType">
          <el-radio-button label="phone">手机</el-radio-button>
          <el-radio-button label="pad">平板</el-radio-button>
          <el-radio-button label="pc">桌面</el-radio-button>
        </el-radio-group>

        <el-radio-group class="view-type" size="mini" v-model="viewType">
          <el-radio-button :label="100">代码</el-radio-button>
          <el-radio-button :label="0">预览</el-radio-button>
          <el-radio-button :label="50">分栏</el-radio-button>
        </el-radio-group>

        <el-button @click="handleRun" plain type="primary">
          <i class="el-icon-video-play"></i>
          运行(ctrl/cmd + s)
        </el-button>
        <el-button @click="handleReset" plain type="primary">
          <i class="el-icon-refresh-left"></i>
          重置
        </el-button>
      </div>
    </el-header>
    <el-main>
      <div class="split-pane-container" @keydown.ctrl.83.prevent="handleRun" @keydown.meta.83.prevent="handleRun">
        <split :gutter-size="1" direction="horizontal">
          <split-area :size="viewType" class="split-pane-left">
            <code-mirror :options="cmOptions" ref="codeMirror" v-model="content"></code-mirror>
            <div ref="code">
              <slot name="code"/>
            </div>
            <div ref="script">
              <slot name="script"/>
            </div>
            <div ref="style">
              <slot name="style"/>
            </div>
          </split-area>
          <split-area :size="99.9 - viewType" class="split-pane-right">
            <div class="mount-el-container">
              <div :class="['device-type-' + deviceType, 'mount-el']" id="mount-el"></div>
            </div>
          </split-area>
        </split>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import Vue from 'vue'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
// language
import 'codemirror/mode/vue/vue.js'
// theme css
import 'codemirror/theme/base16-dark.css'
// active-line.js
import 'codemirror/addon/selection/active-line.js'
// styleSelectedText
import 'codemirror/addon/selection/mark-selection.js'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/scroll/annotatescrollbar.js'
import 'codemirror/addon/search/matchesonscrollbar.js'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/search/match-highlighter.js'
// keyMap
import 'codemirror/mode/clike/clike.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/comment/comment.js'
import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/search/search.js'
import 'codemirror/keymap/sublime.js'
// foldGutter
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/comment-fold.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/indent-fold.js'
import 'codemirror/addon/fold/markdown-fold.js'

export default {
  name: 'CodeEditor',
  components: {
    CodeMirror: codemirror
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    template: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      viewType: 50,
      content: '',
      deviceType: 'pc',
      cmOptions: {
        mode: 'htmlmixed',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        showCursorWhenSelecting: true,
        autoCloseTags: true,
        tabSize: 2,
        foldGutter: true,
        gutters: [
          'CodeMirror-linenumbers',
          'CodeMirror-foldgutter',
          'CodeMirror-lint-markers'
        ],
        autofocus: true,
        styleActiveLine: true
      },
      userCode: {
        template: '',
        script: '',
        style: '',
        uuid: '',
        component: null
      },
      mountEl: '',
      codeOrigin: ''
    }
  },
  computed: {},
  mounted: function () {
    // 初始化编辑器
    this.codeOrigin = this.template
    this.content = this.template
    this.$nextTick(() => {
      this.mountEl = document.getElementById('mount-el')
      this.handleRun()
    })
  },
  methods: {
    handleRun() {
      console.log('code run')
      this.unMountUserCode()
      this.splitCode()
      this.mountUserCode()
    },
    handleReset() {
      this.content = this.codeOrigin
      this.handleRun()
    },
    mountUserCode() {
      this.userCode.uuid = 'uid_' + Math.floor(Math.random() * 1000000000)
      // 生成vue组件挂载
      const parseStrToObj = new Function(this.userCode.script)()
      parseStrToObj.template = this.userCode.template
      const UserCodeComponent = Vue.extend(parseStrToObj)
      this.userCode.component = new UserCodeComponent().$mount()
      this.mountEl.appendChild(this.userCode.component.$el)
      // 挂载样式
      if (this.userCode.css !== '') {
        const styleEl = document.createElement('style')
        styleEl.type = 'text/css'
        styleEl.id = this.userCode.uuid
        styleEl.innerHTML = this.userCode.style
        document.head.appendChild(styleEl)
      }
    },
    unMountUserCode() {
      if (this.userCode.component) {
        this.mountEl.removeChild(this.userCode.component.$el)
        this.userCode.component.$destroy()
        this.userCode.component = null
      }
      // 清楚style样式
      const userStyle = document.getElementById(this.userCode.uuid)
      if (userStyle) {
        document.head.removeChild(userStyle)
      }
    },
    splitCode() {
      this.userCode.template = this.getSource(this.content, 'template')
      this.userCode.style = this.getSource(this.content, 'style')
      this.userCode.script = this.getSource(this.content, 'script').replace(/export default/, 'return ')
    },
    getSource(source, type) {
      const regex = new RegExp(`<${type}[^>]*>`)
      let openingTag = source.match(regex)

      if (!openingTag) {
        return ''
      } else {
        openingTag = openingTag[0]
      }

      return source.slice(
        source.indexOf(openingTag) + openingTag.length,
        source.lastIndexOf(`</${type}>`)
      )
    }
  },
  beforeRouteUpdate: function (to, from, next) {
    this.unMountUserCode()
    next()
  }
}
</script>

<style lang="scss">
  .m-code-editor {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: #fff;

    .el-main {
      display: flex;
      flex-flow: column;
      padding: 0;
    }

    .brick-header {
      padding: 0 20px;
      height: 51px;
      line-height: 50px;
      background-color: #fff;
      border-bottom: solid 1px #eee;

      .title {
        float: left;
        font-size: 16px;
        font-weight: bold;
        color: #555;
      }

      .controls {
        float: right;
        line-height: 32px;
        margin-top: 8px;

        button {
          margin-left: 10px;

          i {
            font-size: 16px;
            vertical-align: -2px;
          }
        }
      }
    }

    .split {
      flex: 1;
    }

    .split-pane-container {
      position: relative;
      height: 100%;
    }

    .vue-codemirror,
    .CodeMirror,
    .split-pane {
      position: relative;
      height: 100%;
    }

    .split-pane-right {
      background-color: #f1f1f1;
      padding-left: 0;
    }

    .device-type {
      margin-right: 20px;
    }

    .view-type {
      margin-right: 20px;
    }

    /*.device-type {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
    }

    .view-type {
      position: absolute;
      bottom: 20px;
      right: 20px;
    }*/

    .mount-el-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: auto;
    }

    .mount-el {
      background-color: #fff;
      position: relative;
      top: 50%;
      transform: translateY(-50%);
      width: 100%;
      height: 100%;
      padding: 10px;
      box-sizing: border-box;
    }

    .mount-el.device-type-phone {
      width: 375px;
      height: 700px;
      margin: 0 auto;
    }

    .mount-el.device-type-pad {
      width: 1024px;
      margin: 0 auto;
    }

    .splitter-pane-resizer {
      background-color: #999;
    }
  }
</style>
