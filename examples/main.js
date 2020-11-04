// 1、在示例中导入组件库
import Vue from 'vue'
import App from './App.vue'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI);
// 本地
// 导入组件库
import timeLine from './../packages/index'
// 注册组件库
Vue.use(timeLine)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
