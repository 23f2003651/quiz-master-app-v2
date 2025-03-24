
const admin_dashboard = {
  template: `
  <div>

    <div class="admin-dashboard-parent-container">
      <div class="admin-dashboard-container">
      
      <h1 class="fw-bold mb-4 d-flex align-items-center">
        Subjects
        <i type="button" class="fa-solid fa-circle-plus ms-2 add-icon" data-bs-toggle="modal" data-bs-target="#addSubjectModal"></i>
      </h1>
      

        <div v-for="subject in subjects" :key="subject.id">
          <div class="admin-dashboard-header">

            <div data-bs-toggle="collapse" :data-bs-target="'#subject-'+subject.id">
              <h3 type="button" class="fw-bold subject-names">
                {{ subject.name }}
              </h3>
            </div>

            <!-- Edit & Delete buttons -->
            <div class="dropdown">
              <button class="btn btn-light border-0 p-2 dots-btn" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><button class="dropdown-item" @click="setSubject(subject)" data-bs-toggle="modal" data-bs-target="#addChapterModal">➕ Add Chapter</button></li>
                <li><button class="dropdown-item" @click="setSubject(subject)" data-bs-toggle="modal" data-bs-target="#editSubjectModal">✏️ Edit</button></li>
                <li><button class="dropdown-item text-danger" @click="setSubject(subject)" data-bs-toggle="modal" data-bs-target="#deleteSubjectModal">🗑 Delete</button></li>
              </ul>
            </div>
          </div>

          <div class="collapse" :id="'subject-' + subject.id">
            <div>
              
              <div v-if="subject.chapters.length === 0" class="text-center text-muted">
                No chapters available
              </div>

              <div v-else class="table-responsive-manage mx-auto" style="max-width: 1200px;">
                <table class="table table-striped table-hover align-middle">
                  <thead class="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Chapter Name</th>
                      <th>Description</th>
                      <th class="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(chapter, index) in subject.chapters" :key="chapter.id">
                      <td>{{ index + 1 }}</td>
                      <td class="fw-bold">{{ chapter.name }}</td>
                      <td>{{ chapter.description }}</td>
                      <td class="text-center">
                        <div class="btn-group" role="group">
                          <button class="btn btn-primary btn-sm" @click="setChapter(chapter)" data-bs-toggle="modal" data-bs-target="#editChapterModal">
                            ✏️ Edit
                          </button>
                          <button class="btn btn-danger btn-sm" @click="setChapter(chapter)" data-bs-toggle="modal" data-bs-target="#deleteChapterModal">
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>

        </div>
        
      </div>
    </div>

    <!-- Modal Components -->
    <!-- Add Subject -->
    <modal-component modal-id="addSubjectModal" title="Add Subject">
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
    <modal-component modal-id="editSubjectModal" title="Edit Subject">
      <template v-slot:body>
        <input v-model="newSubjectName" type="text" class="form-control" placeholder="Enter New Subject Name">
        <input v-model="newSubjectDesc" type="text" class="form-control" placeholder="Enter New Subject Description">
      </template>

      <template v-slot:footer>
        <button class="btn btn-success" @click="editSubject()">Save</button>
      </template>
    </modal-component>

    <!-- Delete Subject -->
    <modal-component modal-id="deleteSubjectModal" title="Delete Subject">
      <template v-slot:body>
        <p>Are you sure you want to delete <span class="fw-bold">{{ currSubject.name }}</span>?</p>
      </template>

      <template v-slot:footer>
        <button class="btn btn-danger" @click="deleteSubject()" data-bs-dismiss="modal">Delete</button>
      </template>
    </modal-component>

    <!-- Add Chapter -->
    <modal-component modal-id="addChapterModal" title="Add Chapter">
      <template v-slot:body>
        <input v-model="addChapterName" type="text" class="form-control" placeholder="Enter Chapter Name">
        <br>
        <input v-model="addChapterDesc" type="text" class="form-control" placeholder="Enter Chapter Description">
      </template>

      <template v-slot:footer>
        <button class="btn btn-success" @click="addChapter()">Add</button>
      </template>
    </modal-component>

    <!-- Edit Chapter -->
    <modal-component modal-id="editChapterModal" title="Edit Chapter">
      <template v-slot:body>
        <input v-model="newChapterName" type="text" class="form-control" placeholder="Enter New Chapter Name">
        <input v-model="newChapterDesc" type="text" class="form-control" placeholder="Enter New Chapter Description">
      </template>

      <template v-slot:footer>
        <button class="btn btn-success" @click="editChapter()" data-bs-dismiss="modal">Save</button>
      </template>
    </modal-component>

    <!-- Delete Chapter -->
    <modal-component modal-id="deleteChapterModal" title="Delete Chapter">
      <template v-slot:body>
        <p>Are you sure you want to delete <span class="fw-bold">{{ currChapter.name }}</span>?</p>
      </template>

      <template v-slot:footer>
        <button class="btn btn-danger" @click="deleteChapter()" data-bs-dismiss="modal">Delete</button>
      </template>
    </modal-component>


  </div>
  `,

  data() {
    return {
      subjects: [],

      // add new subject & chapter
      addSubjectName: "",
      addSubjectDesc: "",
      addChapterName: "",
      addChapterDesc: "",

      // set current subject & chapter
      currSubject: "",
      currChapter: "",

      // edit subject
      newSubjectName: "",
      newSubjectDesc: "",
      newChapterName: "",
      newChapterDesc: ""

    }
  },

  methods: {

    // Set the current subject
    setSubject(subject) {
      this.currSubject = subject;
      this.newSubjectName = subject.name;
      this.newSubjectDesc = subject.description;
    },

    // Set the current chapter
    setChapter(chapter) {
      this.currChapter = chapter;
      this.newChapterName = chapter.name;
      this.newChapterDesc = chapter.description;
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

    // Add a chapter .post()
    async addChapter() {
      const url = window.location.origin;

      try {
        const res = await axios.post(url + `/api/chapters`, {
          name: this.addChapterName,
          description: this.addChapterDesc,
          subject_id: this.currSubject.id
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 201) {
          console.log("Chapter added");
          this.addChapterName = "";
          this.addChapterDesc = "";
          this.$store.commit('setAlert', { message: "Chapter created", type: "alert-success" });
          this.getSubjects();
        }

      } catch (error) {
        console.error(error);
        this.$store.commit('setAlert', { message: "Failed to create chapter", type: "alert-danger" });
      }
    },

    // Edit a chapter .put()
    async editChapter() {
      const url = window.location.origin;

      try {
        const res = await axios.put(url + `/api/chapters/${this.currChapter.id}`, {
          name: this.newChapterName,
          description: this.newChapterDesc
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 204) {
          console.log("Chapter updated");
          this.$store.commit('setAlert', { message: "Chapter updated", type: "alert-success" });
          this.getSubjects();
        }

      } catch (error) {
        console.error(error);
        this.$store.commit('setAlert', { message: "Failed to update chapter", type: "alert-danger" });
      }
    },
    
    // Delete a chapter .delete()
    async deleteChapter() {
      const url = window.location.origin;

      try {
        const res = await axios.delete(url + `/api/chapters/${this.currChapter.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 204) {
          console.log("Chapter deleted");
          this.$store.commit('setAlert', { message: "Chapter deleted", type: "alert-success" });
          this.getSubjects();
        }

      } catch (error) {
        console.error(error);
        this.$store.commit('setAlert', { message: "Failed to delete chapter", type: "alert-danger" });
      }
    },
  },

  mounted() {
    this.getSubjects();
  }
}

export default admin_dashboard;
