const ChartComponent = {
  props: ["chartId", "title", "chartType", "chartData"],
  template: `
    <div class="card p-3 shadow-sm">
      <h5 class="text-center">{{ title }}</h5>
      <div class="chart-container">
        <canvas :id="chartCanvasId"></canvas>
      </div>
    </div>
  `,
  computed: {
    chartCanvasId() {
      return `${this.chartId}-canvas`;
    }
  },
  data() {
    return {
      chartInstance: null, // Store chart instance
    };
  },
  mounted() {
    this.renderChart();
  },
  watch: {
    chartData: {
      deep: true, // Watches nested properties
      handler() {
        this.updateChart();
      }
    }
  },
  methods: {
    renderChart() {
      const ctx = document.getElementById(this.chartCanvasId);
      if (!ctx) return;

      const maxDataValue = Math.max(...this.chartData.datasets[0].data);

      this.chartInstance = new Chart(ctx.getContext("2d"), {
        type: this.chartType,
        data: this.chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 2,
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: maxDataValue + 1, // Extends y-axis by 1
            }
          },
          plugins: {
            legend: {
              labels: {
                font: { size: 14, weight: "bold" },
              },
            },
          },
        },
      });
    },
    updateChart() {
      if (this.chartInstance) {
        this.chartInstance.destroy(); // Destroy old chart instance
      }
      this.renderChart(); // Re-render the chart
    }
  }
};

export default ChartComponent;
