import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Contracts from './views/Contracts.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/contracts',
      name: 'contracts',
      component: Contracts
    },
    {
      path: '/mailing',
      name: 'mailing',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/invoices',
      name: 'invoices',
      component: Home
    }
  ]
})
