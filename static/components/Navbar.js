const Navbar = {
  template: `
  <nav style="height: 60px; background: rgba(0,0,0,0.75) !important; color: white; display: flex; align-items: center; padding: 0 20px;" class="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="/">Quizz</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">

        <div class="navbar-nav">
          <router-link v-for="link in navLinks" :key="link.text" :to="link.to" class="nav-link">
            {{ link.text }}
          </router-link>
        </div>

        <div class="navbar-nav ms-auto">
          <a v-if="state.loggedIn" @click="logout" class="nav-link text-danger fw-bold" style="cursor: pointer">Logout</a>
        </div>
      </div>
    </div>
  </nav>
  `,

  computed: {
    navLinks() {
      const role = this.role;
      if (this.state.loggedIn) {
        if (sessionStorage.getItem('role') == 'user') {
          return [
					{ to: `/user-dashboard`, text: "Dashboard" },
          { to: `/user-scores`, text: "Scores" },
          { to: `/user-summary`, text: "Summary" },
        ];
        } else {
          return [
					{ to: `/admin-dashboard`, text: "Dashboard" },
          { to: `/admin-quiz`, text: "Quiz" },
          { to: `/admin-summary`, text: "Summary" },
        ];
        }
      } else {
        return [
          { to: "/", text: "Home" },
          { to: "/login", text: "Login" },
          { to: "/user-register", text: "Register" },
        ];
      }
    },

    state() {
      return this.$store.state;
    }
  },  

  methods: {
    logout() {
      this.$store.commit('setAlert', { message: "Logged out", type: "alert-success" });
      sessionStorage.clear();
      this.$store.commit('logout');
      console.log("Logout Successful");

      this.$nextTick(() => {
        this.$router.push('/login');
      });
    }
  }
}

export default Navbar;