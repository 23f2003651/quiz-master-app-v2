
const user_scores = {
  template: `
  <div class="container mt-4">
    <div class="user-scores-parent-container">
      <div class="user-scores-container">
        
        <h2 class="mb-3">Scores</h2>

        <table v-if="scores.length" class="table table-striped table-bordered">
          <thead class="thead-dark">
            <tr>
              <th scope="col">User ID</th>
              <th scope="col">Chapter Name</th>
              <th scope="col">Subject Name</th>
              <th scope="col">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(score, index) in scores" :key="index">
              <td>{{ score.user_id }}</td>
              <td>{{ getQuizChapterName(score.chapter_id) }}</td>
              <td>{{ getQuizSubjectName(score.subject_id) }}</td>
              <td>{{ formatTimestamp(score.time_stamp_of_attempt) }}</td>
            </tr>
          </tbody>
        </table>

        <p v-else class="text-muted">No scores available.</p>

      </div>
    </div>
  </div>
  `,

  data() {
    return {
      scores: '',

      subjects: [],
      chapters: []

    }
  },

  methods: {
    // Computed property to get subject name
    getQuizSubjectName(subject_id) {
      const subject = this.subjects.find(s => s.id === subject_id);
      return subject ? subject.name : "Unknown Subject";
    },

    // Computed property to get chapter name
    getQuizChapterName(chapter_id) {
      const chapter = this.chapters.find(s => s.id === chapter_id);
      return chapter ? chapter.name : "Unknown Chapter";
    },

    formatTimestamp(timestamp) {
      if (!timestamp) return "N/A";
      return new Date(timestamp).toLocaleString(); 
    },

    async getScores() {
      const url = window.location.origin;
      const user_id = +sessionStorage.getItem('id');
      
      try {
        const res = await axios.get(url + `/api/get-scores/${user_id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 200) {
          console.log("fetched scores");
          this.scores = res.data;
        }
      } catch (error) {
        console.error(error);
      }
    },

    // Get all subjects .get()
    async getSubjects() {
      const url = window.location.origin;

      try {
        const res = await axios.get(url + `/api/subjects`, {
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

    // Get all chapters .get()
    async getChapters() {
      const url = window.location.origin;

      try {
        const res = await axios.get(url + `/api/chapters`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 200) {
          console.log("Chapters retrieved");
          this.chapters = res.data;
        }
      } catch (error) {
        console.error(error);
      }
    },
  },

  mounted() {
    this.getScores();
    this.getSubjects();
    this.getChapters();
  }
}

export default user_scores;