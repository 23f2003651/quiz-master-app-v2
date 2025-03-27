const quiz_page = {
  template: `
    <div class="container py-5 d-flex justify-content-center">
      <div class="card shadow-lg p-5 w-100" style="max-width: 800px;">
        <h2 class="fw-bold text-center mb-3">{{ quiz.title }}</h2>
        <p class="text-center fs-5"><strong>Time Limit:</strong> {{ quiz.duration }} seconds</p>

        <p v-if="timeRemaining > 0" class="text-success text-center fw-bold fs-5">
          <strong>Time Left:</strong> {{ timeRemaining }} seconds
        </p>
        <p v-else class="text-danger text-center fw-bold fs-5">
          <strong>Time Over!</strong>
        </p>

        <div v-if="quiz.questions.length">
          <div class="mb-4">
            <p class="fw-bold fs-4">Q{{ currentQuestionIndex + 1 }}: {{ currentQuestion.question_statement }}</p>

            <ul class="list-group">
              <li v-for="(option, index) in getOptions(currentQuestion)" :key="index" 
                  class="list-group-item d-flex align-items-center fs-5 py-3"
                  style="cursor: pointer;">
                <label class="w-100 d-flex align-items-center gap-3">
                  <input type="radio" 
                        :name="'question' + currentQuestion.id" 
                        :value="index + 1" 
                        v-model="answers[currentQuestion.id]">
                  {{ option }}
                </label>
              </li>
            </ul>
          </div>
          
          <!-- Navigation Buttons -->
          <div class="d-flex justify-content-between mt-4">
            <button @click="prevQuestion" :disabled="currentQuestionIndex === 0" 
                    class="btn btn-secondary px-5 py-2 fs-5">
              Previous
            </button>
            <button @click="nextQuestion" :disabled="currentQuestionIndex === quiz.questions.length - 1" 
                    class="btn btn-primary px-5 py-2 fs-5">
              Next
            </button>
          </div>

          <div class="text-center mt-5">
            <button @click="submitQuiz" class="btn btn-success px-5 py-3 fs-5">
              Submit Quiz
            </button>
          </div>
        </div>
      </div>
    </div>

  `,

  data() {
    return {
      quizId: '',
      quiz: {
        title: '',
        duration: 0,
        chapter_id: '',
        questions: []
      },
      chapter_id: '',
      subject_id: '',

      answers: {},
      currentQuestionIndex: 0,
      timeRemaining: 0,
      timer: null
    }
  },

  computed: {
    currentQuestion() {
      return this.quiz.questions[this.currentQuestionIndex]
    }
  },

  methods: {
    getOptions(question) {
      return [question.opt1, question.opt2, question.opt3, question.opt4];
    },

    nextQuestion() {
      this.currentQuestionIndex++;
    },

    prevQuestion() {
      this.currentQuestionIndex--;
    },

    calculateRemainingTime() {
      const startTime = sessionStorage.getItem(`quizStartTime_${this.quizId}`);
      
      if (startTime) {
        const elapsedTime = Math.floor((Date.now() - parseInt(startTime)) / 1000);
        this.timeRemaining = Math.max(this.quiz.duration - elapsedTime, 0);
      } else {
        this.timeRemaining = this.quiz.duration;
      }
    
      // If time has already expired, submit the quiz immediately
      if (this.timeRemaining <= 0) {
        this.submitQuiz();
      }
    },

    async getQuizz() {
      const url = window.location.origin;

      try {
        const res = await axios.get(url + `/api/quiz/${this.quizId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 200) {
          console.log("Quiz retrieved");

          this.chapter_id = res.data.chapter_id;
          this.subject_id = res.data.subject_id;
          this.quiz = res.data;

          if (!sessionStorage.getItem(`quizStartTime_${this.quizId}`)) {
            sessionStorage.setItem(`quizStartTime_${this.quizId}`, Date.now());
          }

          this.quiz.questions.forEach((question) => {
            if (!(question.id in this.answers)) {
              this.answers[question.id] = "";
            }
          });

          this.calculateRemainingTime();
          this.startTimer();
        }
      } catch (error) {
        console.error("Error: " + error);
      }
    },

    startTimer() {
      if (this.timer) clearInterval(this.timer);

      this.timer = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--;
        } else {
          clearInterval(this.timer);
          this.submitQuiz();
        }
      }, 1000)
    },

    async submitQuiz() {
      clearInterval(this.timer);
      console.log("Submitted Answers:", this.answers);

      const url = window.location.origin;
      try {
        const res = await axios.post(url + '/api/submit-quiz', {
          quiz_id: this.quizId,
          chapter_id: this.quiz.chapter_id,
          subject_id: this.quiz.subject_id,
          answers: this.answers
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 201) {
          console.log("Answers submitted");
          this.$store.commit('setOngoingQuiz', false)
          this.$store.commit('setActiveQuiz', null)
          this.$store.commit('setAlert', { message: "Answers submitted", type: "alert-success" });
        }
      } catch (error) {
        console.error(error);
        this.$store.commit('setAlert', { message: "Failed to submit answers", type: "alert-danger" });
      }

      this.$router.push('/user-scores')
    }
  },

  mounted() {
    this.quizId = this.$route.params.id;
    this.getQuizz();
  },

  beforeUnmount() {
    clearInterval(this.timer);
  }
}

export default quiz_page;