const admin_summary = {
  template: `
  <div class="container mt-4">
  
    <h2>Admin Summary</h2>
    <p>Overview of user activity and statistics.</p>


    <div class="row text-center mb-4">
    <div class="col-md-3">
      <div class="card shadow-sm p-3">
        <h5>Total Users</h5>
        <p class="fw-bold fs-4">{{ adminStatsData[0] }}</p>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card shadow-sm p-3">
        <h5>Total Subjects</h5>
        <p class="fw-bold fs-4">{{ adminStatsData[1] }}</p>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card shadow-sm p-3">
        <h5>Total Quizzes</h5>
        <p class="fw-bold fs-4">{{ adminStatsData[2] }}</p>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card shadow-sm p-3">
        <h5>Total Chapters</h5>
        <p class="fw-bold fs-4">{{ adminStatsData[3] }}</p>
      </div>
    </div>
    </div>

    <!-- Always visible Chart -->
    <chart-component chartId="adminSubjectChart" title="Total Chapters" chartType="bar"
    :chartData="Object.assign({}, totalChaptersData)">      
    </chart-component>

    <chart-component chartId="adminQuestionsChart" title="Total Questions" chartType="bar"
    :chartData="Object.assign({}, totalQuestionsData)">      
    </chart-component>

    <chart-component chartId="activeUsersChart" title="Active Users" chartType="pie"
    :chartData="Object.assign({}, totalUsersData)">
    </chart-component>


  </div>
  `,

  data() {
    return {
      totalChaptersData: {
        labels: [],
        datasets: [
          {
            label: "Total Chapters",
            data: [],
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },

      totalQuestionsData: {
        labels: [],
        datasets: [
          {
            label: "Total Questions",
            data: [],
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },

      totalUsersData: {
        labels: [],
        datasets: [
          {
            label: "User Status",
            data: [],
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },

      adminStatsData: [],

    };
  },

  methods: {
    async statsData() {
      const url = window.location.origin;

      try {
        const res = await axios.get(url + `/api/chart-data/adminStatsData`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status === 200) {
          console.log("Fetched chart data:", res.data);

          if (Array.isArray(res.data) && res.data.length === 4) {
            
            this.adminStatsData = res.data;
          } else {
            console.error("Invalid API response structure:", res.data);
          }
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    },

    async subjectsData() {
      const url = window.location.origin;

      try {
        const res = await axios.get(url + `/api/chart-data/subjects`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status === 200) {
          console.log("Fetched chart data:", res.data);

          if (Array.isArray(res.data) && res.data.length === 2) {
            
            this.totalChaptersData = {
              labels: res.data[0],
              datasets: [
                {
                  label: "Subjects & Chapters",
                  data: res.data[1],
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                  borderColor: "rgba(54, 162, 235, 1)",
                  borderWidth: 1,
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
    },

    async questionsData() {
      const url = window.location.origin;

      try {
        const res = await axios.get(url + `/api/chart-data/quizzes`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status === 200) {
          console.log("Fetched chart data:", res.data);

          if (Array.isArray(res.data) && res.data.length === 2) {
            
            this.totalQuestionsData = {
              labels: res.data[0],
              datasets: [
                {
                  label: "Total Questions",
                  data: res.data[1],
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                  borderColor: "rgba(54, 162, 235, 1)",
                  borderWidth: 1,
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
    },

    async activeUsersData() {
      const url = window.location.origin;

      try {
        const res = await axios.get(url + `/api/chart-data/activeUsers`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token')
          }
        });

        if (res.status === 200) {
          console.log("Fetched chart data:", res.data);

          if (Array.isArray(res.data) && res.data.length === 2) {
            
            this.totalUsersData = {
              labels: res.data[0],
              datasets: [
                {
                  label: "Status",
                  data: res.data[1],
                  backgroundColor: ["rgba(54, 162, 235, 0.7)", "rgba(255, 99, 132, 0.7)"],
                  borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
                  borderWidth: 1,
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
    this.questionsData();
    this.activeUsersData();
    this.statsData();
  },
};

export default admin_summary;
