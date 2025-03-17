
const admin_quiz = {
  template: /*html*/`
  <div>
    
    <div class="admin-quiz-parent-container">
      <div class="admin-quiz-container">
        
        <h1>
          Quizzes
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addQuizModal">Add</button>
        </h1>

        <div v-for="quiz in quizzes" :key="quiz.id">
          <div class="admin-quiz-header" data-bs-toggle="collapse" :data-bs-target="'#quiz-'+quiz.id">

            <h3 class="fw-bold">
              {{ quiz.title }} | {{ quiz.duration }} minutes
              <button class="btn btn-primary" @click="setQuiz(quiz)" data-bs-toggle="modal" data-bs-target="#addQuestionModal">Add Questions</button>
            </h3>

            <!-- Edit & Delete buttons -->
            <div class="btn-group" role="group">
              <button class="btn btn-primary" @click="setQuiz(quiz)" data-bs-toggle="modal" data-bs-target="#editQuizModal" type="button">Edit</button>
              <button class="btn btn-danger" @click="setQuiz(quiz)" data-bs-toggle="modal" data-bs-target="#deleteQuizModal" type="button">Delete</button>
            </div>
          </div>

          <div class="collapse" :id="'quiz-'+quiz.id">
            <div v-if="quiz.questions.length === 0" class="card card-body">
              No questions available
            </div>

            <div v-for="question in quiz.questions" :key="question.id" class="card card-body">
              {{ question.id }} - {{ question.question_statement }}
              <br>
              {{ question.opt1 }} | {{ question.opt2 }} | {{ question.opt3 }} | {{ question.opt4 }}
              <br>{{ question.correct_opt }}
              
              <div class="btn-group" role="group">
                <button class="btn btn-primary" @click="setQuestion(question)" data-bs-toggle="modal" data-bs-target="#editQuestionModal" type="button">Edit</button>
                <button class="btn btn-danger" @click="setQuestion(question)" data-bs-toggle="modal" data-bs-target="#deleteQuestionModal" type="button">Delete</button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>

    <!-- Add Quiz Modal -->
    <modal-component modal-id="addQuizModal" title="Add Quiz">
      <template v-slot:body>
        <input v-model="quizTitle" type="text" class="form-control" placeholder="Enter Quiz Title">
        <br>
        <input v-model="quizDate" type="datetime-local" class="form-control" placeholder="Enter Quiz Date">
        <br>
        <input v-model="quizDuration" type="number" class="form-control" placeholder="Enter Quiz Duration (in seconds)">
        <br>

        <!-- Subject dropdown -->
        <select class="form-select" v-model="selectedSubject" @change="fetchChapters" aria-label="Default select example">
        <option v-for="subject in subjects" :key="subject.id" :value="subject.id">{{subject.name}}</option>
        <option disabled selected value="">Select a subject</option>
        </select>

        <br>

        <!-- Chapter dropdown -->
        <select class="form-select" v-model="selectedChapter" aria-label="Default select example">
          <option disabled selected value="">Select a chapter</option>
          <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">
            {{ chapter.name }}
          </option>
        </select>
      </template>

      <template v-slot:footer>
        <button class="btn btn-success" @click="addQuiz">Add</button>
      </template>
    </modal-component>

    <!-- Edit Quiz Modal -->
    <modal-component modal-id="editQuizModal" title="Edit Quiz">
      <template v-slot:body>
        <input v-model="newQuizTitle" type="text" class="form-control" placeholder="Enter Quiz Title">
        <br>
        <input v-model="newQuizDate" type="datetime-local" class="form-control" placeholder="Enter Quiz Date">
        <br>
        <input v-model="newQuizDuration" type="number" class="form-control" placeholder="Enter Quiz Duration (in seconds)">
        <br>

        <!-- Subject dropdown -->
        <select class="form-select" v-model="selectedSubject" @change="fetchChapters" aria-label="Default select example">
        <option v-for="subject in subjects" :key="subject.id" :value="subject.id">{{subject.name}}</option>
        <option disabled selected value="">Select a subject</option>
        </select>

        <br>

        <!-- Chapter dropdown -->
        <select class="form-select" v-model="selectedChapter" aria-label="Default select example">
          <option disabled selected value="">Select a chapter</option>
          <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">
            {{ chapter.name }}
          </option>
        </select>
      </template>

      <template v-slot:footer>
        <button class="btn btn-success" @click="editQuiz" data-bs-dismiss="modal">Save</button>
      </template>
    </modal-component>

    <!-- Delete Quiz -->
    <modal-component modal-id="deleteQuizModal" title="Delete Quiz">
      <template v-slot:body>
        <p>Are you sure you want to delete <span class="fw-bold">{{ currQuiz.title }}</span>?</p>
      </template>

      <template v-slot:footer>
        <button class="btn btn-danger" @click="deleteQuiz()" data-bs-dismiss="modal">Delete</button>
      </template>
    </modal-component>

    <!-- Add Question -->
    <modal-component modal-id="addQuestionModal" title="Add Question">
      <template v-slot:body>
        <input v-model="addQuestionStatement" type="text" class="form-control" placeholder="Enter Question Statement">
        <br>
        <input v-model="addOption1" type="text" class="form-control" placeholder="Enter Option-1">
        <input v-model="addOption2" type="text" class="form-control" placeholder="Enter Option-2">
        <input v-model="addOption3" type="text" class="form-control" placeholder="Enter Option-3">
        <input v-model="addOption4" type="text" class="form-control" placeholder="Enter Option-4">
        <select v-model="addCorrectOption" class="form-select" aria-label="Default select example">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option disbale selected value="">Choose Correct Option</option>
        </select>
      </template>

      <template v-slot:footer>
        <button class="btn btn-success" @click="addQuestion()">Add</button>
      </template>
    </modal-component>

    <!-- Edit Question -->
    <modal-component modal-id="editQuestionModal" title="Edit Question">
      <template v-slot:body>
        <input v-model="editQuestionStatement" type="text" class="form-control" placeholder="Edit Question Statement">
        <br>
        <input v-model="editOption1" type="text" class="form-control" placeholder="Edit Option-1">
        <input v-model="editOption2" type="text" class="form-control" placeholder="Edit Option-2">
        <input v-model="editOption3" type="text" class="form-control" placeholder="Edit Option-3">
        <input v-model="editOption4" type="text" class="form-control" placeholder="Edit Option-4">
        <select v-model="editCorrectOption" class="form-select" aria-label="Default select example">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option disbale selected value="">Choose Correct Option</option>
        </select>
      </template>

      <template v-slot:footer>
        <button class="btn btn-success" @click="editQuestion" data-bs-dismiss="modal">Save</button>
      </template>
    </modal-component>

    <!-- Delete Question -->
    <modal-component modal-id="deleteQuestionModal" title="Delete Question">
      <template v-slot:body>
        <p>Are you sure you want to delete <span class="fw-bold">{{ currQues.question_statement }}</span>?</p>
      </template>

      <template v-slot:footer>
        <button class="btn btn-danger" @click="deleteQuestion()" data-bs-dismiss="modal">Delete</button>
      </template>
    </modal-component>

  </div>
  `,

  data() {
    return {
      quizzes: [],
      subjects: [],
      chapters: [],

      currQuiz: '',
      currQues: '',

      quizTitle: '',
      quizDuration: '',
      quizDate: '',

      selectedSubject: '',
      selectedChapter: '',

      newQuizTitle: '',
      newQuizDate: '',
      newQuizDuration: '',

      addQuestionStatement: '',
      addOption1: '',
      addOption2: '',
      addOption3: '',
      addOption4: '',
      addCorrectOption: '',

      editQuestionStatement: '',
      editOption1: '',
      editOption2: '',
      editOption3: '',
      editOption4: '',
      editCorrectOption: ''

    }
  },

  methods: {
    setQuiz(quiz) {
      this.currQuiz = quiz;
      this.newQuizTitle = quiz.title;
      this.newQuizDuration = quiz.duration;

      const date = new Date(quiz.date_of_quiz);
      this.newQuizDate = date.toISOString().slice(0, 16);
    },

    setQuestion(question) {
      this.currQues = question;
      this.editQuestionStatement = question.question_statement;
      this.editOption1 = question.opt1;
      this.editOption2 = question.opt2;
      this.editOption3 = question.opt3;
      this.editOption4 = question.opt4;
      this.editCorrectOption = question.correct_opt;
    },

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
        console.log("No quizzes found");
      }
    },

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

    async fetchChapters() {
      const url = window.location.origin;

      try {
        const res = await axios.get(url + '/api/subjects/' + this.selectedSubject + '/chapters', {
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

    // Add a quiz .post()
    async addQuiz() {
      const url = window.location.origin;

      try {
        const res = await axios.post(url + '/api/quiz', {
          title: this.quizTitle,
          duration: this.quizDuration,
          date_of_quiz: this.quizDate,
          chapter_id: this.selectedChapter,
          subject_id: this.selectedSubject
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 201) {
          console.log("Subject added");
          
          // Reset the form
          this.qqizTitle = '';
          this.quizDuration = '';
          this.quizDate = '';
          this.selectedSubject = '';
          this.selectedChapter = '';
          
          this.$store.commit('setAlert', { message: "Subject created", type: "alert-success" });
          this.getQuizzes();
        }

      } catch (error) {
        console.error(error);
        this.$store.commit('setAlert', { message: "Failed to create subject", type: "alert-danger" });
      }
    },

    // Edit a quiz .put()
    async editQuiz() {
      const url = window.location.origin;

      try {
        const res = await axios.put(url + `/api/quiz/${this.currQuiz.id}`, {
          title: this.newQuizTitle,
          duration: this.newQuizDuration,
          date_of_quiz: this.newQuizDate,
          chapter_id: this.selectedChapter,
          subject_id: this.selectedSubject
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 204) {
          console.log("Subject updated");
          this.$store.commit('setAlert', { message: "Subject updated", type: "alert-success" });
          this.getQuizzes();
        }

      } catch (error) {
        console.error(error);
        this.$store.commit('setAlert', { message: "Failed to update subject", type: "alert-danger" });
      }
    },

    // Delete a quiz .delete()
    async deleteQuiz() {
      const url = window.location.origin;

      try {
        const res = await axios.delete(url + `/api/quiz/${this.currQuiz.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 204) {
          console.log("Quiz deleted");
          this.$store.commit('setAlert', { message: "Quiz deleted", type: "alert-success" });
          this.getQuizzes();
        }

      } catch (error) {
        console.error(error);
        this.$store.commit('setAlert', { message: "Failed to delete quiz", type: "alert-danger" });
      }
    },

    // Add a question .get()
    async addQuestion() {
      const url = window.location.origin;

      try {
        const res = await axios.post(url + `/api/questions`, {
          question_statement: this.addQuestionStatement,
          opt1: this.addOption1,
          opt2: this.addOption2,
          opt3: this.addOption3,
          opt4: this.addOption4,
          correct_opt: this.addCorrectOption,
          quiz_id: this.currQuiz.id
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 201) {
          console.log("Question Added");

          this.addQuestionStatement = "";
          this.addOption1 = "";
          this.addOption2 = "";
          this.addOption3 = "";
          this.addOption4 = "";
          this.correct_opt = "";

          this.$store.commit('setAlert', { message: "Question added", type: "alert-success" });
          this.getQuizzes();
        }

      } catch (error) {
        console.error(error);
        this.$store.commit('setAlert', { message: "Failed to add question", type: "alert-danger" });
      }
    },

    async editQuestion() {
      const url = window.location.origin;

      try {
        const res = await axios.put(url + `/api/questions/${this.currQues.id}`, {
          question_statement: this.editQuestionStatement,
          opt1: this.editOption1,
          opt2: this.editOption2,
          opt3: this.editOption3,
          opt4: this.editOption4,
          correct_opt: this.editCorrectOption,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 204) {
          console.log("Question updated");
          this.$store.commit('setAlert', { message: "Question updated", type: "alert-success" });
          this.getQuizzes();
        }

      } catch (error) {
        console.error(error);
        this.$store.commit('setAlert', { message: "Failed to update question", type: "alert-danger" });
      }
    },

    async deleteQuestion() {
      const url = window.location.origin;

      try {
        const res = await axios.delete(url + `/api/questions/${this.currQues.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 204) {
          console.log("Question deleted");
          this.$store.commit('setAlert', { message: "Question deleted", type: "alert-success" });
          this.getQuizzes();
        }

      } catch (error) {
        console.error(error);
        this.$store.commit('setAlert', { message: "Failed to delete question", type: "alert-danger" });
      }
    }

  },

  mounted() {
    this.getQuizzes();
    this.getSubjects();
  }
}

export default admin_quiz;