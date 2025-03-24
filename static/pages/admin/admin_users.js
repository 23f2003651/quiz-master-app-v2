
const admin_users = {
  template: `
    
  <div>
  <div class="admin-users-parent-container container mt-4">
    <div class="admin-users-container p-4 shadow-lg rounded bg-white">
      
      <!-- Header -->
      <div class="fw-bold mb-4 d-flex justify-content-between align-items-center">
        <h1 class="fw-bold m-0">Users</h1>
        <button @click="create_csv()" class="btn btn-primary fw-bold px-3 py-2 d-flex align-items-center">
          <i class="bi bi-download me-2"></i> Download Users Data
        </button>
      </div>

      <!-- Users Table -->
      <div class="table-responsive">
        <table class="table table-striped table-hover table-bordered align-middle">
          <thead class="table-dark text-center">
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
              <td class="text-center">
                <span 
                  role="button" 
                  @click="setUser(user)" 
                  class="badge text-white px-3 py-2 rounded-pill" 
                  :class="{'bg-success': user.active, 'bg-danger': !user.active}" 
                  data-bs-toggle="modal" 
                  data-bs-target="#toggleUser"
                >
                  {{ user.active ? 'Yes' : 'No' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Toggle User Modal -->
  <modal-component modal-id="toggleUser" title="Toggle User">
    <template v-slot:body>
      <p class="text-center fs-5">
        Are you sure you want to toggle 
        <span class="fw-bold">{{ currUser.username }}</span> to 
        <span class="fw-bold" :class="{'text-success': !currUser.active, 'text-danger': currUser.active}">
          {{ !currUser.active ? 'Active' : 'Inactive' }}
        </span>?
      </p>
    </template>

    <template v-slot:footer>
      <button class="btn btn-success ms-2" @click="toggleUser(currUser.id)" data-bs-dismiss="modal">
        Confirm
      </button>
    </template>
  </modal-component>

  </div>


  `,

  data() {
    return {
      users: '',
      currUser: ''
    }
  },

  methods: {

    setUser(user) {
      this.currUser = user;
    },

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

    async toggleUser(id) {
      const url = window.location.origin
      const user_id = Number(id)

      try {
        const res = await axios.put(url + `/api/toggleUser/${user_id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status === 200) {
          console.log("User toggled successfully")
          this.getUsers();
        }
      } catch (error) {
        console.error("Error:", error)
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