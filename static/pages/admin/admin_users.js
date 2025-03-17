
const admin_users = {
  template: `
    
    <div>

      <div class="admin-users-parent-container">
        <div class="admin-users-container">

          <h1>
            Users
          </h1>

          <div v-for="user in users">
            {{user}}
          </div>

        </div>
      </div>

    </div>

  `,

  data() {
    return {
      users: ''
    }
  },

  methods: {
    async getUsers() {
      const url = window.location.origin;

      try {
        const res = await axios.get(url + '/api/users', {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status === 200) {
          console.log("Users retrieved")
          this.users = res.data;
        }
      } catch (error) {
        console.log(error);
      }
    }
  },

  mounted() {
    this.getUsers();
  },
}

export default admin_users;