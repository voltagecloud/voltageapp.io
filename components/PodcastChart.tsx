import { defineComponent, PropType, onMounted } from "@vue/composition-api";
import Chart from "chart.js";

export default defineComponent({
  props: {
    chartData: {
      type: Array as PropType<{ x: string; y: number }[]>,
      required: true,
    },
  },
  setup: (props, { refs }) => {
    function renderChart() {
      const canvas = refs.chart;
      new Chart(canvas as HTMLCanvasElement, {
        type: "line",
        data: {
          // both boostData and streamData should have exact same length
          labels: props.chartData.map(e => e.x),
          datasets: [
            {
              label: "Satoshis",
              data: props.chartData.map(e => e.y),
              barPercentage: 0.5,
              minBarLength: 2,
              backgroundColor: '#EF820D'
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
      });
    }

    onMounted(renderChart);

    return () => (
      <div style="width: 100%; max-height: 600px;">
        <canvas ref="chart" width="400" height="400" />;
      </div>
    );
  },
});
