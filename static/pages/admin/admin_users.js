
const admin_users = {
  template: `
    
  <div>
    <div class="admin-users-parent-container container mt-4">
      <div class="admin-users-container">

      <button @click="create_csv()" class="fw-bold btn btn-primary fw-bold px-4 py-2">
        <i class="bi bi-download"></i> Download Users Data
      </button>

        <h1 class="mb-4">Users</h1>
        
        <table class="table table-striped table-bordered">
          <thead class="table-dark">
            <tr>
              <th scope="col">Username</th>
              <th scope="col">Email</th>
              <th scope="col">Qualification</th>
              <th scope="col">Active</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users.slice(1)" :key="user.id">
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.qualification }}</td>
              <td>
                <span class="badge" :class="{'bg-success': user.active, 'bg-danger': !user.active}">
                  {{ user.active ? 'Yes' : 'No' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
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

    // Get all users .get()
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
    },

    async create_csv() {
      const url = window.location.origin;
      
      try {
        const res = await axios.get(url + '/create-csv', {
          headers: {
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        const task_id = res.data.task_id;
        console.log("Task ID:", task_id);

        const interval = setInterval(async () => {
          try {
            const res = await axios.get(url + `/get-csv/${task_id}`, {
              headers: {
                'Authentication-Token': sessionStorage.getItem('token')
              }
            });
            
            if (res.status === 200) {
              console.log(res.data);
              window.open(url + `/get-csv/${task_id}`);
              console.log("DONEDONEDONE")
              clearInterval(interval);
            }
          } catch (error) {
            console.error("Error while checking task");
          }
        }, 100);
        
      } catch (error) {
        console.error("Error starting task");
      }
    }
  },

  mounted() {
    this.getUsers();
  },
}

export default admin_users;