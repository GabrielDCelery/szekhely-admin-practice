import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    navBarItems: [{
      label: 'Contracts',
      url: '/contracts'
    }, {
      label: 'Mailing',
      url: '/mailing'
    }, {
      label: 'Invoices',
      url: '/invoices'
    }]
  },
  getters: {
    navBarItems: _state => {
      return _state.navBarItems;
    }
  },
  mutations: {

  },
  actions: {

  }
})
