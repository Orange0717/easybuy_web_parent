import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
//import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
//import NProgress from 'nprogress'
//import 'nprogress/nprogress.css'
import routes from './routes'
//import Mock from './mock'   //我们使用axios异步访问后台，就需要将mock注释
//Mock.bootstrap();

//文件上传与删除需要一个分布式文件系统的id
Vue.prototype.$fileIp = "http://192.168.43.50";

Vue.prototype.$filePath = "";

// 引用axios，并设置基础URL为后端服务api地址
var axios = require('axios')
axios.defaults.baseURL = 'http://127.0.0.1:9527/services'  //对应后端网关统一地址
// 将API方法绑定到全局  也就是给vue配置一个全局属性，在其他的组件中，可以使用this.$http获取配置的axios
Vue.prototype.$http = axios
Vue.config.productionTip = false

import 'font-awesome/css/font-awesome.min.css'

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)

//NProgress.configure({ showSpinner: false });

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  //NProgress.start();
  if (to.path == '/login') {
    sessionStorage.removeItem('user');
  }
  let user = JSON.parse(sessionStorage.getItem('user'));
  if (!user && to.path != '/login') {
    next({ path: '/login' })
  } else {
    next()
  }
})

//router.afterEach(transition => {
//NProgress.done();
//});

new Vue({
  //el: '#app',
  //template: '<App/>',
  router,
  store,
  //components: { App }
  render: h => h(App)
}).$mount('#app')

