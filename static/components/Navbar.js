const Navbar = {
  template: `
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3 shadow-sm" style="height: 50px;">
    <div class="container-fluid">

      <!-- Brand Logo (Left) -->
      <a class="navbar-brand fw-bold fs-4 text-white" href="/" style="padding: 0; margin: 0;">Quizzy</a>

      <div class="collapse navbar-collapse">
        <!-- Align Navbar Links to Left -->
        <div class="navbar-nav me-auto ms-3">
          <router-link v-for="link in navLinks" :key="link.text" :to="link.to" 
            class="nav-link px-3 fw-semibold text-light">
            {{ link.text }}
          </router-link>
        </div>

        <!-- Logout Button (Right) -->
        <div class="navbar-nav">
          <a v-if="state.loggedIn" @click="logout" class="nav-link text-danger fw-bold px-3" style="cursor: pointer;">
            Logout
          </a>
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
					{ to: `/admin-dashboard`, text: "Subjects" },
          { to: `/admin-quiz`, text: "Quiz" },
          { to: `/admin-users`, text: "Users" },
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