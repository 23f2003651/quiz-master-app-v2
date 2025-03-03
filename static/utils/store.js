const store = new Vuex.Store({
  state: {
    loggedIn: !!sessionStorage.getItem('token'),
    token: sessionStorage.getItem('token'),
  },

  mutations: {
    setLogin(state) {
      state.loggedIn = true;
    },
    logout(state) {
      state.loggedIn = false;
      state.token = "";
    },
    setToken(state, token) {
      state.token = token;
    }
  }
})

export default store;