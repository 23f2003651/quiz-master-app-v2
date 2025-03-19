const admin_summary = {
  template: `
  <div class="container mt-4">
  
    <h2>Admin Summary</h2>
    <p>Overview of user activity and statistics.</p>

    <!-- Always visible Chart -->
    <chart-component chartId="adminSubjectChart" title="Subjects & Chapters" chartType="bar"
    :chartData="Object.assign({}, chartData)"
    >
      <template #footer>
        <button type="button" class="btn btn-success">Download Report</button>
      </template>
      
    </chart-component>

  </div>
  `,

  data() {
    return {
      chartData: {
        labels: [],
        datasets: [
          {
            label: "Subjects & Chapters",
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
            // Replace entire object to trigger reactivity
            this.chartData = {
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
    }
  },

  mounted() {
    this.subjectsData();
  },
};

export default admin_summary;
