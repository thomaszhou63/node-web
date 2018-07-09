import Vue from 'vue'
import Router from 'vue-router'

import GoodsList from '@/views/GoodsList'
import Cart from '@/views/Cart'
import Address from '@/views/Address'
import OrderConfirm from '@/views/OrderConfirm'
import OrderSuccess from '@/views/OrderSuccess'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'GoodsList',
      component:GoodsList
    },
    {
      path: '/Cart', // 购物车页面
      name: 'Cart',
      component:Cart
    },
    {
      path: '/goods',
      name: 'GoodsList',
      component: GoodsList
    },
    {
      path: '/address',
      name: 'Address',
      component:Address
    },
    {
      path: '/OrderConfirm',
      name: 'OrderConfirm',
      component:OrderConfirm
    },
    {
      path: '/OrderSuccess',
      name: 'OrderSuccess',
      component:OrderSuccess
    }
  ]
})
