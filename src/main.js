import Vue from 'vue'
import router from './router'
import * as utils from './utils'
import * as api from './utils/api'

import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n
import 'normalize.css/normalize.css'
import '@/styles/element-ui.scss'
import '@/styles/index.scss' // global css

import App from './App.vue'
// vue 组件
import SplitPanel from 'vue-split-panel'
import CodeEditor from './components/CodeEditor'

const components = require.context('../packages/', true, /index\.js$/)
components.keys().forEach(component => {
  Vue.use(components(component).default)
})

Vue.use(ElementUI, { locale, size: 'small' })
Vue.use(SplitPanel)
Vue.use(CodeEditor)

Vue.config.productionTip = false

Vue.prototype.$utils = utils
Vue.prototype.$test_api = api

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
