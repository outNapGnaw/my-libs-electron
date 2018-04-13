import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import Electron from 'vue-electron'
import 'normalize.css/normalize.css'
import VueUtils from './utils/index.js'

import '@/assets/iconfont/base'
import '@/assets/iconfont/custom'
import IconSvg from '@/components/Icon-svg/index.vue'

if (!process.env.IS_WEB) Vue.use(Electron)


Vue.use(ElementUI)
Vue.use(VueUtils.install);

Vue.component('icon-svg', IconSvg);
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App},
  router,
  store,
  template: '<App/>'
}).$mount('#app')
