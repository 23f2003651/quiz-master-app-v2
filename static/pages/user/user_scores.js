
const user_scores = {
  template: `
  <div class="container mt-4">
    <div class="user-scores-parent-container">
      <div class="user-scores-container table-responsive">

        <!-- Header -->
        <div class="fw-bold mb-4 d-flex justify-content-between align-items-center">
          <h1 class="fw-bold m-0">Scores</h1>

          <div class="input-group w-25">
            <span class="input-group-text bg-white border-end-0">
                <SearchIcon />
            </span>
            <input v-model="searchQuery" type="text" class="form-control border-start-0" placeholder="Search...">
          </div>
        </div>

        <table v-if="scores.length" class="table table-striped">
          <thead class="table-dark">
            <tr>
              <th scope="col">S.No</th>
              <th scope="col">Subject Name</th>
              <th scope="col">Chapter Name</th>
              <th scope="col">Marks</th>
              <th scope="col">Submission Time</th>
              <th scope="col">Details</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            <tr v-for="(score, index) in filteredScores" :key="index">
              <td>{{ index+1 }}</td>
              <td>{{ getQuizSubjectName(score.subject_id) }}</td>
              <td>{{ getQuizChapterName(score.chapter_id) }}</td>
              
              <td>
                <span style="font-size: 15px" :class="{
                  'badge bg-success': getScore(score.user_answers, score.correct_answers).percentage >= 50,
                  'badge bg-danger': getScore(score.user_answers, score.correct_answers).percentage < 50
                }">
                  {{ getScore(score.user_answers, score.correct_answers).text }}
                </span>
              </td>

              <td>{{ formatTimestamp(score.time_stamp_of_attempt) }}</td>
              <td><a type="button" data-bs-toggle="modal" data-bs-target="#viewScoreDetails" @click="getQuizz(score.quiz_id)"><i class="bi bi-eye-fill"></i></a></td>
            </tr">
          </tbody>
        </table>

        <p v-else class="text-muted">No scores available.</p>

      </div>
    </div>

    <!-- Answer Details -->
    <div class="modal fade" id="viewScoreDetails" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalLabel">Some title</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">

              <div v-for="(question, sno) in currQuiz.questions" :key="sno" class="mb-4">
                <p class="fw-bold">
                  Q{{ sno + 1 }}: <span :class="{'text-success': isCorrect(currQuiz.id, question.id), 'text-danger': isIncorrect(currQuiz.id, question.id)}">{{ question.question_statement }}</span>
                </p>

                <ul class="list-group">
                  <li v-for="(option, index) in getOptions(question)" :key="index" class="list-group-item"
                  :class="{'text-white corr-ans': index + 1 === getCorrAnswer(currQuiz.id, question.id), 'text-white wrong-ans': index + 1 === getUserAnswer(currQuiz.id, question.id) && !isCorrect(currQuiz.id, question.id)}">
                    <label class="d-flex align-items-center">
                      <input disabled type="radio" :name="'question' + question.id" :checked="getValue(currQuiz.id, question.id) === index + 1"
                        class="mr-2"> 
                      <span :class="{'fw-bold': getValue(currQuiz.id, question.id) === index + 1}">{{ option }}</span>
                    </label>
                  </li>
                </ul>
              </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

  </div>
  `,

  data() {
    return {
      scores: '',

      subjects: [],
      chapters: [],

      searchQuery: "",

      score_percentage: 0,

      currQuiz: {},

    }
  },

  methods: {

    getValue(quiz_id, questionID) {
      for (let index = 0; index < this.scores.length; index++) {
        if (this.scores[index].quiz_id === quiz_id) {
          return this.scores[index].user_answers[questionID];
        }        
      }
    },

    getCorrAnswer(quiz_id, questionID) {
      for (let index = 0; index < this.scores.length; index++) {
        if (this.scores[index].quiz_id === quiz_id) {
          return this.scores[index].correct_answers[questionID];
        }        
      }
    },
    
    getUserAnswer(quiz_id, questionID) {
      for (let index = 0; index < this.scores.length; index++) {
        if (this.scores[index].quiz_id === quiz_id) {
          return this.scores[index].user_answers[questionID];
        }        
      }
    },

    // check if answer is correct or not
    isCorrect(quiz_id, questionId) {
      for (let index = 0; index < this.scores.length; index++) {
        if (this.scores[index].quiz_id === quiz_id) {
          return this.scores[index].user_answers[questionId] && this.scores[index].user_answers[questionId] == this.scores[index].correct_answers[questionId];
        }        
      }
    },

    isIncorrect(quiz_id, questionId) {
      for (let index = 0; index < this.scores.length; index++) {
        if (this.scores[index].quiz_id === quiz_id) {
          return !this.scores[index].user_answers[questionId] || this.scores[index].user_answers[questionId] != this.scores[index].correct_answers[questionId];
        }        
      }
      
    },

    // get options for the question
    getOptions(question) {
      return [question.opt1, question.opt2, question.opt3, question.opt4];
    },

    getScore(user_ans, corr_ans) {
      let score = 0;
      const total_marks = Object.keys(corr_ans).length;
      
      for (const key in corr_ans) {
        if (user_ans[key] && user_ans[key] == corr_ans[key]) {
          score++;
        }
      }

      return {
        text: `${score} / ${total_marks}`,
        percentage: (score / total_marks) * 100
      };
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
        const res = await axios.get(url + `/api/get-history-scores/${user_id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 200) {
          console.log("fetched scores");
          this.scores = res.data;
          this.filteredScores = res.data;
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

    async getQuizz(quiz_id) {
      const url = window.location.origin;

      try {
        const res = await axios.get(url + `/api/quiz/${quiz_id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status == 200) {
          console.log("Quiz retrieved");
          this.currQuiz = res.data
        }
      } catch (error) {
        console.error("Error: " + error);
      }
    },

    viewDetails() {
      console.log("View score details")
    }
  },

  watch: {
    searchQuery: function(newSearch) {
      newSearch = newSearch.trim().toLowerCase();
  
      if (!newSearch) {
        this.filteredScores = this.scores;
      } else {
        this.filteredScores = this.scores.filter(score => {
          const subjectMatch = this.getQuizSubjectName(score.subject_id).toLowerCase().includes(newSearch);
          const chapterMatch = this.getQuizChapterName(score.chapter_id).toLowerCase().includes(newSearch);
  
          return subjectMatch || chapterMatch;
        });
      }
    }
  },  

  mounted() {
    this.getScores();
    this.getSubjects();
    this.getChapters();
  }
}

export default user_scores;