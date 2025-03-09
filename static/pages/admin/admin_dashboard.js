
const admin_dashboard = {
  template: /* html */ `
  <div>

    <div class="admin-parent-container">
      <div class="admin-container">

      <h1>subjects</h1>

        <div v-for="subject in subjects" :key="subject.id">
          <div class="admin-header" data-bs-toggle="collapse" :data-bs-target="'#subject-'+subject.id">

            <h3 class="fw-bold">
              {{ subject.name }}
              <button v-if="subject.chapters.length === 0">Add</button>
            </h3>

            <div class="btn-group" role="group">
              <button type="button">edit</button>
              <button type="button">delete</button>
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

  </div>
  `,

  data() {
    return {
      subjects: []
    }
  },

  methods: {
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
          console.log(this.subjects[0]);
        }
      } catch (error) {
        console.error(error);
      }
    }
  },

  mounted() {
    this.getSubjects();
  }
}

export default admin_dashboard;