
const admin_dashboard = {
  template: /* html */ `
  <div>

    <div class="admin-parent-container">
      <div class="admin-container">

      
      <h1>
        Subjects
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addSubjectModal">Add</button>
      </h1>
      

        <div v-for="subject in subjects" :key="subject.id">
          <div class="admin-header" data-bs-toggle="collapse" :data-bs-target="'#subject-'+subject.id">

            <h3 class="fw-bold">
              {{ subject.name }} | {{ subject.description }}
            </h3>

            <!-- Edit & Delete buttons -->
            <div class="btn-group" role="group">
              <button class="btn btn-primary" @click="setSubject(subject)" data-bs-toggle="modal" data-bs-target="#editSubjectModal" type="button">Edit</button>
              <button class="btn btn-danger" @click="setSubject(subject)" data-bs-toggle="modal" data-bs-target="#deleteSubjectModal" type="button">Delete</button>
            </div>
          </div>

          <div class="collapse" :id="'subject-' + subject.id">
            <div v-if="subject.chapters.length === 0" class="card card-body">
              No chapters available
            </div>

            <div v-for="chapter in subject.chapters" :key="chapter.id" class="card card-body">
              {{ chapter.id }} - {{ chapter.name }}
            </div>
          </div>
        </div>
        
      </div>
    </div>

    <!-- Modal Components -->
    <!-- Add Subject -->
    <modal-component modal-id="addSubjectModal" title="Add Subject" @save="addSubject">
      <template v-slot:body>
        <input v-model="addSubjectName" type="text" class="form-control" placeholder="Enter Subject Name">
        <br>
        <input v-model="addSubjectDesc" type="text" class="form-control" placeholder="Enter Subject Description">
      </template>

      <template v-slot:footer>
        <button class="btn btn-success" @click="addSubject">Add</button>
      </template>
    </modal-component>

    <!-- Edit Subject -->
    <modal-component modal-id="editSubjectModal" title="Edit Subject" @save="editSubject">
      <template v-slot:body>
        <input v-model="newSubjectName" type="text" class="form-control" placeholder="Enter New Subject Name">
        <input v-model="newSubjectDesc" type="text" class="form-control" placeholder="Enter New Subject Description">
      </template>

      <template v-slot:footer>
        <button class="btn btn-success" @click="editSubject()">Save</button>
      </template>
    </modal-component>

    <!-- Delete Subject -->
    <modal-component modal-id="deleteSubjectModal" title="Delete Subject" @save="deleteSubject">
      <template v-slot:body>
        <p>Are you sure you want to delete <span class="fw-bold">{{ currSubject.name }}</span>?</p>
      </template>

      <template v-slot:footer>
        <button class="btn btn-danger" @click="deleteSubject()">Delete</button>
      </template>
    </modal-component>

  </div>
  `,

  data() {
    return {
      subjects: [],
      addSubjectName: "",
      addSubjectDesc: "",
      currSubject: "",
      newSubjectName: "",
      newSubjectDesc: "",
    }
  },

  methods: {

    // Set the current subject
    setSubject(subject) {
      this.currSubject = subject;
      this.newSubjectName = subject.name;
      this.newSubjectDesc = subject.description;
    },

    /* ASYNC METHODS */
    // Get all subjects .get()
    async getSubjects() {
      const url = window.location.origin;

      try {
        const res = await axios.get(url + '/api/subjects', {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 200) {
          console.log("Subjects retrieved");
          this.subjects = res.data;
        }
      } catch (error) {
        console.error(error);
      }
    },

    // Add a subject .post()
    async addSubject() {
      const url = window.location.origin;

      try {
        const res = await axios.post(url + '/api/subjects', {
          name: this.addSubjectName,
          description: this.addSubjectDesc
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 201) {
          console.log("Subject added");
          this.addSubjectName = "";
          this.addSubjectDesc = "";
          this.$store.commit('setAlert', { message: "Subject created", type: "alert-success" });
          this.getSubjects();
        }

      } catch (error) {
        console.error(error);
        this.$store.commit('setAlert', { message: "Failed to create subject", type: "alert-danger" });
      }
    },

    // Edit a subject .put()
    async editSubject() {
      const url = window.location.origin;

      try {
        const res = await axios.put(url + `/api/subjects/${this.currSubject.id}`, {
          name: this.newSubjectName,
          description: this.newSubjectDesc
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 204) {
          console.log("Subject updated");
          this.$store.commit('setAlert', { message: "Subject updated", type: "alert-success" });
          this.getSubjects();
        }

      } catch (error) {
        console.error(error);
        this.$store.commit('setAlert', { message: "Failed to update subject", type: "alert-danger" });
      }
    },

    // Delete a subject .delete()
    async deleteSubject() {
      const url = window.location.origin;

      try {
        const res = await axios.delete(url + `/api/subjects/${this.currSubject.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 204) {
          console.log("Subject deleted");
          this.$store.commit('setAlert', { message: "Subject deleted", type: "alert-success" });
          this.getSubjects();
        }

      } catch (error) {
        console.error(error);
        this.$store.commit('setAlert', { message: "Failed to delete subject", type: "alert-danger" });
      }
    },
  },

  mounted() {
    this.getSubjects();
  }
}

export default admin_dashboard;