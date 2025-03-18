
const user_dashboard = {
  template: `
  <div>
    <div class="container py-5">
      <div class="main-container row g-4 justify-content-space-between">
              
        <card-component v-for="quiz in quizzes" :key="quiz.id" :title="getQuizSubjectName(quiz.subject_id)">
          <template v-slot:body>
            <div class="quiz-details"><strong>Chapter:</strong> {{getQuizChapterName(quiz.chapter_id)}}</div>
            <div class="quiz-details"><strong>Questions:</strong> {{quiz.questions.length}} </div>
            <div class="quiz-details"><strong>Time Limit:</strong> {{ quiz.duration }} seconds</div>
          </template>

          <template v-slot:footer>
            <button class="card-button btn btn-primary" @click="startQuiz(quiz.id)">Start Quiz</button>
          </template>
        </card-component>

      </div>
    </div>
  </div>
  `,

  data() {
    return {
      quizzes: '',
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

    startQuiz(quiz_id) {
      this.$router.push(`/quiz/${quiz_id}`)
    },

    // Get all quizzes .get()
    async getQuizzes() {
      const url = window.location.origin;

      try {
        const res = await axios.get(url + '/api/quiz', {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 200) {
          console.log("Quizzes retrieved");
          this.quizzes = res.data;
        }
      } catch (error) {
        console.error("Error: " + error);
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
    this.getQuizzes();
    this.getSubjects();
    this.getChapters();
  },
}

export default user_dashboard;