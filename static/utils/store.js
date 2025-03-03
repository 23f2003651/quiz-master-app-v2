const store = new Vuex.Store({
  state: {
    loggedIn: !!sessionStorage.getItem('token'),
    token: sessionStorage.getItem('token'),
    alertMessage: "",
    alertType: "",
    showAlert: false
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
    },
    setAlert(state, { message, type }) {
      state.alertMessage = message;
      state.alertType = type;
      state.showAlert = true;

      setTimeout(() => {
        state.showAlert = false;
      }, 5000);
    },
    hideAlert(state) {
      state.showAlert = false;
    }
  }
})

export default store;