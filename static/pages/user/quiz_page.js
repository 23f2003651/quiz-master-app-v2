const quiz_page = {
  template: `
    <div class="container py-5">
      <h2>{{ quiz.title }}</h2>
      <p><strong>Time Limit:</strong> {{ quiz.duration }} seconds</p>

      <p v-if="timeRemaining > 0"><strong>Time Left:</strong> {{ timeRemaining }} seconds</p>
      <p v-else class="text-danger"><strong>Time Over!</strong></p>

      <div v-if="quiz.questions.length">
        <div class="mb-4">
          <p><strong>Q{{ currentQuestionIndex + 1 }}:</strong> {{ currentQuestion.question_statement }}</p>

          <ul class="list-group">
            <li v-for="(option, index) in getOptions(currentQuestion)" :key="index" class="list-group-item">
              <label class="d-flex align-items-center">
                <input type="radio" :name="'question' + currentQuestion.id" :value="index + 1" v-model="answers[currentQuestion.id]"
                  class="mr-2"> 
                {{ option }}
              </label>
            </li>
          </ul>
        </div>
        
        <!-- Navigation Buttons -->
        <div class="d-flex justify-content-between mt-3">
          <button @click="prevQuestion" :disabled="currentQuestionIndex === 0" class="btn btn-secondary">Previous</button>
          <button @click="nextQuestion" :disabled="currentQuestionIndex === quiz.questions.length - 1" class="btn btn-primary">Next</button>
        </div>

        <div class="text-center mt-4">
          <button @click="submitQuiz" class="btn btn-success">Submit Quiz</button>
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
      return this.quiz.questions[this.currentQuestionIndex];
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

          this.chapter_id = res.chapter_id;
          this.subject_id = res.subject_id;

          this.quiz = res.data;
          this.timeRemaining = this.quiz.duration;

          this.quiz.questions.forEach((question) => {
            if (!(question.id in this.answers)) {
              this.answers[question.id] = "";
            }
          });

          this.startTimer();
        }
      } catch (error) {
        console.error("Error: " + error);
      }
    },

    startTimer() {
      this.timer = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--;
        } else {
          clearInterval(this.timer);
          this.submitQuiz();
          this.$router.push('/user-scores')
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
