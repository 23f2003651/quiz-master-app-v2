
const user_dashboard = {
  template: `
  <div>
    <div class="container py-5">
      <div class="input-group w-100 mb-5 mx-auto">
        <span class="input-group-text bg-white border-end-0">
            <SearchIcon />
        </span>
        <input v-model="searchQuery" type="text" class="form-control border-start-0" placeholder="Search...">
      </div>
      <div class="main-container row g-4 justify-content-space-between">
              
        <card-component v-for="quiz in filteredQuizzes" :key="quiz.id" v-if="quiz.questions.length!=0" :title="getQuizSubjectName(quiz.subject_id)">
          <template v-slot:body>
            <div class="quiz-details"><strong>Chapter:</strong> {{getQuizChapterName(quiz.chapter_id)}}</div>
            <div class="quiz-details"><strong>Questions:</strong> {{quiz.questions.length}} </div>
            <div class="quiz-details"><strong>Time Limit:</strong> {{ quiz.duration }} seconds</div>
            <div class="quiz-details"><strong>Deadline:</strong> {{ formatDate(quiz.date_of_quiz) }}</div>
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
      quizzes: [],
      filteredQuizzes: [],

      subjects: [],

      chapters: [],

      searchQuery: ""
    }
  },

  methods: {

    formatDate(date) {
      const utcDate = new Date(date + "Z"); // Ensure it's treated as UTC
      return utcDate.toLocaleString('en-GB', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'  // Force UTC to avoid conversion
      });
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

    async startQuiz(quiz_id) {
      try {
        const url = window.location.origin + `/api/quiz/${quiz_id}`;
        const res = await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status === 200) {
          const quiz = res.data;
          const now = new Date();
          const quizDate = new Date(quiz.date_of_quiz + "Z");

          if (quizDate < now) {
            this.$store.commit('setAlert', { message: "Quiz has been expired", type: "alert-danger" });

            setTimeout(() => {
              location.reload();
            }, 2000);                                                                      
            
            return;
          }

          this.$router.push(`/quiz/${quiz_id}`);
        } else {
          this.$store.commit('setAlert', { message: "Failed to fetch details", type: "alert-danger" });
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
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

          const now = new Date();

          this.quizzes = res.data.filter(quiz => {
            const quizDate = new Date(quiz.date_of_quiz);
            return quizDate > now;
          });
          this.filteredQuizzes = res.data.filter(quiz => {
            const quizDate = new Date(quiz.date_of_quiz);
            return quizDate > now;
          });

          console.log("Filtered Quizzes: ", this.quizzes);
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

  watch: {
    searchQuery: function(newSearch) {
      newSearch = newSearch.trim().toLowerCase();
  
      if (!newSearch) {
        this.filteredQuizzes = this.quizzes;
      } else {
        this.filteredQuizzes = this.quizzes.filter(quiz => {
          const quizTitleMatch = quiz.title.toLowerCase().includes(newSearch);
  
          const subjectMatch = this.getQuizSubjectName(quiz.subject_id)
            .toLowerCase()
            .includes(newSearch);
  
          const chapterMatch = this.getQuizChapterName(quiz.chapter_id)
            .toLowerCase()
            .includes(newSearch);
  
          return quizTitleMatch || subjectMatch || chapterMatch;
        });
      }
    }
  },

  mounted() {
    this.getQuizzes();
    this.getSubjects();
    this.getChapters();
  },
}

export default user_dashboard;