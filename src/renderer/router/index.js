import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/login/index'
import LandingPage from '@/components/LandingPage'
import Penren from '@/views/penren/index'
import AutoFresh from '@/views/auto/index'
Vue.use(Router)

export default new Router({
  routes: [
    { path: '/login', 
      component: Login,
      name:'login',
      hidden: true 
    },
    {
      path: '/',
      component: AutoFresh,
      name: 'autoFresh',
      hidden: true
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
