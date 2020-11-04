<template>
  <div :id="'mountNode' + index"></div>
</template>
<script>
import { Chart } from "@antv/g2";
export default {
  name: "line-chart",
  props: ["index", "recordsInfo"],
  data() {
    return {
      chart: null,
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.drawChart();
    });
  },
  mounted() {
    this.$nextTick(function () {
      this.drawChart();
    });
  },
  methods: {
    drawChart() {
      const chart = new Chart({
        container: "mountNode" + this.index,
        autoFit: true,
        height: 300,
        width: 800,
      });

      chart.data(this.recordsInfo.list);
      chart.scale({
        year: {
          range: [0, 1],
        },
        value: {
          min: 0,
          nice: true,
        },
      });

      chart.tooltip({
        showCrosshairs: true, // 展示 Tooltip 辅助线
        shared: true,
      });

      chart.line().position("time*value").label("value");
      chart.point().position("time*value");

      chart.render();
    },
  },
};
</script>