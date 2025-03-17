
const user_dashboard = {
  template: `
  <div>
    <div class="container py-5">
      <div class="main-container row g-4 justify-content-space-between">
        <card-component title="Mathematics">
          <template v-slot:body>
            <div class="quiz-details"><strong>Chapter:</strong> Algebra</div>
            <div class="quiz-details"><strong>Questions:</strong> 10</div>
            <div class="quiz-details"><strong>Time Limit:</strong> 15 mins</div>
          </template>

          <template v-slot:footer>
            <button class="btn btn-primary">Start Quiz</button>
          </template>
        </card-component>
      </div>
    </div>
  </div>
  `
}

export default user_dashboard;