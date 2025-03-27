// router and store
import router from "./utils/router.js";
import store from "./utils/store.js";

// components
import Navbar from "./components/Navbar.js";
import LoginIcon from "./components/LoginIcon.js";
import Modal from "./components/Modal.js";
import CardComponent from "./components/Card.js";
import ChartComponent from "./components/Chart.js";
import SearchIcon from "./components/SearchIcon.js";

Vue.component("LoginIcon", LoginIcon);
Vue.component("modal-component", Modal);
Vue.component("card-component", CardComponent)
Vue.component("chart-component", ChartComponent)
Vue.component("SearchIcon", SearchIcon)

console.log("app.js loaded");

new Vue({
  el: "#app",
  template: `
    <div>
      <Navbar />
      <div>
        <router-view />
          <div id="alert" v-if="$store.state.showAlert" :class="['alert', $store.state.alertType, 'global-alert', 'fw-bold']" role="alert">
            
            <span class="icon">
              <i v-if="$store.state.alertType === 'alert-danger'" class="fas fa-times-circle"></i>
              <i v-else class="fas fa-check-circle"></i>
            </span>
          
            <span class="message mr-5">
              <strong v-if="$store.state.alertType === 'alert-danger'">Error:</strong>
              <strong v-else>Success:</strong> 
              {{ $store.state.alertMessage }}
            </span>

            <button type="button" class="fw-bold close-btn" @click="$store.commit('hideAlert')"></button>
            <i type="button" @click="$store.commit('hideAlert')" class="fa-solid fa-xmark"></i>
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