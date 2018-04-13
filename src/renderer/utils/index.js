import Vue from 'vue'
import Http from './http.js'
const install = {
    install(Vue, option) {
        Vue.prototype.$http = Http;
    }
}
export default {install}