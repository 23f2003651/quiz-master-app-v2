
const user_summary = {
  template: `
  <div class="container mt-4">
  
    <h2>User Summary</h2>
    <p>Overview of user activity and statistics.</p>

    <div class="row text-center mb-4">
    <div class="col-md-3">
      <div class="card shadow-sm p-3">
        <h5>Attempted Quizzes</h5>
        <p class="fw-bold fs-4">{{ stats[0] }}</p>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card shadow-sm p-3">
        <h5>Avg. Score (%)</h5>
        <p class="fw-bold fs-4">{{ stats[1] }}</p>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card shadow-sm p-3">
        <h5>Best Score (%)</h5>
        <p class="fw-bold fs-4 text-success">{{ stats[2] }}</p>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card shadow-sm p-3">
        <h5>Worst Score (%)</h5>
        <p class="fw-bold fs-4 text-danger">{{ stats[3] }}</p>
      </div>
    </div>
    </div>

    <!-- Always visible Chart -->
    <chart-component chartId="userScores" title="Scores" chartType="bar"
    :chartData="Object.assign({}, userScoresData)">      
    </chart-component>

    <!-- User Performance -->
    <chart-component chartId="userPerformance" title="Performance" chartType="line"
    :chartData="Object.assign({}, userPerfDataData)">      
    </chart-component>

  </div>
  `,

  data() {
    return {

      stats: [],

      userScoresData: {
        labels: [],
        datasets: [
          {
            label: "Marks in %age",
            data: [],
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },

      userPerfDataData: {
        labels: [],
        datasets: [
          {
            label: "Marks in %age",
            data: [],
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },

    };
  },

  methods: {

    // Get scores chart data .get() (views.py)
    async subjectsData() {
      const url = window.location.origin;

      try {
        const res = await axios.get(url + `/api/chart-data/user-scores`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status === 200) {
          console.log("Fetched chart data:", res.data);

          if (Array.isArray(res.data) && res.data.length === 3) {
            // Replace entire object to trigger reactivity
            this.userScoresData = {
              labels: res.data[0],
              datasets: [
                {
                  label: "Marks in %age",
                  data: res.data[1],
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                  borderColor: "rgba(54, 162, 235, 1)",
                  borderWidth: 1,
                },
              ],
            };

            this.stats = res.data[2];

          } else {
            console.error("Invalid API response structure:", res.data);
          }
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    },

    async userPerformanceData() {
      const url = window.location.origin;

      try {
        const res = await axios.get(url + `/api/chart-data/user-scores`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status === 200) {
          console.log("Fetched chart data:", res.data);

          if (Array.isArray(res.data) && res.data.length === 3) {
            // Replace entire object to trigger reactivity
            this.userPerfDataData = {
              labels: res.data[0],
              datasets: [
                {
                  label: "Marks in %age",
                  data: res.data[1],
                  backgroundColor: "rgba(64, 224, 208, 0.2)",
                  borderColor: "rgb(64, 224, 208)",
                  borderWidth: 3,
                  pointRadius: 5,
                  pointBackgroundColor: "rgb(64, 224, 208)",
                },
              ],
            };
          } else {
            console.error("Invalid API response structure:", res.data);
          }
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    }
  },

  mounted() {
    this.subjectsData();
    this.userPerformanceData();
  },
};

export default user_summary;
