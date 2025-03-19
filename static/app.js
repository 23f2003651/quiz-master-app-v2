// router and store
import router from "./utils/router.js";
import store from "./utils/store.js";

// components
import Navbar from "./components/Navbar.js";
import LoginIcon from "./components/LoginIcon.js";
import Modal from "./components/Modal.js";
import CardComponent from "./components/Card.js";
import ChartComponent from "./components/Chart.js";

Vue.component("LoginIcon", LoginIcon);
Vue.component("modal-component", Modal);
Vue.component("card-component", CardComponent)
Vue.component("chart-component", ChartComponent)

console.log("app.js loaded");

new Vue({
  el: "#app",
  template: `
    <div>
      <Navbar />
      <div>
        <router-view />
        <div id="alert" v-if="$store.state.showAlert" :class="['alert', $store.state.alertType, 'global-alert', 'fw-bold']" role="alert">
          {{ $store.state.alertMessage }}
          <button type="button" class="fw-bold btn-close" @click="$store.commit('hideAlert')"></button>
        </div>
      </div>
    </div>
  `,
  router,
  store,
  components: {
    Navbar,
  }
});