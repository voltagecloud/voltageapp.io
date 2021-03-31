import { defineComponent, PropType, onMounted } from "@vue/composition-api";
import Chart from "chart.js";

export default defineComponent({
  props: {
    podcastData: {
      type: Array as PropType<{ x: string; y: number }[]>,
      required: true,
    },
  },
  setup: (props, { refs }) => {
    function renderChart() {
      console.log("attempting render");
      const chartData = props.podcastData;
      const canvas = refs.chart;
      if (!chartData || !canvas) {
        console.log({ chartData, canvas });
        return;
      }
      console.log(canvas);
      const ch = new Chart(canvas as HTMLCanvasElement, {
        type: "bar",
        data: {
          labels: chartData.map((e) => e.x),
          datasets: [
            {
              label: "Podcasts",
              data: chartData,
              barPercentage: 0.5,
              barThickness: 6,
              minBarLength: 2,
            },
          ],
        },
        options: {
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
      console.log({ ch });
    }

    onMounted(renderChart);

    return () => <canvas ref="chart" width="400" height="400" />;
  },
});
