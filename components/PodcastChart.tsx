import { defineComponent, PropType, onMounted } from "@vue/composition-api";
import Chart from "chart.js";

export default defineComponent({
  props: {
    chartData: {
      type: Array as PropType<{ x: string; boostY: number; streamY: number }[]>,
      required: true,
    },
  },
  setup: (props, { refs }) => {
    function renderChart() {
      const canvas = refs.chart;
      new Chart(canvas as HTMLCanvasElement, {
        type: "bar",
        data: {
          // both boostData and streamData should have exact same length
          labels: props.chartData.map(e => e.x),
          datasets: [
            {
              label: "Streamed Sats",
              data: props.chartData.map(e => e.streamY),
              barPercentage: 0.5,
              minBarLength: 2,
              backgroundColor: '#343851'
            },
            {
              label: "Boosted Sats",
              data: props.chartData.map(e => e.boostY),
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
