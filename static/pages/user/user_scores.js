
const user_scores = {
  template: `
  <div class="container mt-4">
    <div class="user-scores-parent-container">
      <div class="user-scores-container">
        
        <h2 class="mb-3">Scores</h2>

        <table v-if="scores.length" class="table table-striped table-bordered">
          <thead class="thead-dark">
            <tr>
              <th scope="col">S.No</th>
              <th scope="col">Chapter Name</th>
              <th scope="col">Subject Name</th>
              <th scope="col">Marks</th>
              <th scope="col">Timestamp</th>
              <th scope="col">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(score, index) in scores" :key="index">
              <td>{{ index+1 }}</td>
              <td>{{ getQuizChapterName(score.chapter_id) }}</td>
              <td>{{ getQuizSubjectName(score.subject_id) }}</td>
              <td>{{ getScore(score.user_answers, score.correct_answers) }}</td>
              <td>{{ formatTimestamp(score.time_stamp_of_attempt) }}</td>
              <td><a type="button" data-bs-toggle="modal" data-bs-target="#viewScoreDetails" @click="viewDetails"><i class="bi bi-eye-fill"></i></a></td>
            </tr">
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

    getScore(user_ans, corr_ans) {
      let score = 0;
      const total_marks = Object.keys(corr_ans).length;
      
      for (const key in corr_ans) {
        if (user_ans[key] && user_ans[key] == corr_ans[key]) {
          score++;
        }
      }

      return `${score}/${total_marks}`;
    },

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

    // Get selected scores .get() (views.py)
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

    viewDetails() {
      console.log("View score details")
    }
  },

  mounted() {
    this.getScores();
    this.getSubjects();
    this.getChapters();
  }
}

export default user_scores;