import CodeEditor from './CodeEditor'

/* istanbul ignore next */
CodeEditor.install = function (Vue) {
  Vue.component(CodeEditor.name, CodeEditor)
}

export default CodeEditor
