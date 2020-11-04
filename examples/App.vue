<template>
  <div class="container">
    <timeLine
      :dicList="dicList"
      :timeLineObj="timeLineObj"
      :labList="labList"
      @addEchart="addEchart"
      @changeType="changeType"
      @timeChange="timeChange"
    ></timeLine>
  </div>
</template>

<script>
export default {
  data () {
    return {
      dicList:[],
      dicDeList:[
        {
          code: "010005",
          createTime: "2020-10-21 13:15:36",
          creator: "1",
          descCn: "影像报告",
          id: 102,
          operator: "1",
          parentId: 97,
          sort: "5",
          updateTime: "2020-10-21T05:15:39.000+00:00",
          value: "image_report",
          cdict: [
            {
              cdict: null,
              code: "010005001",
              createTime: "2020-10-21 13:15:36",
              creator: "1",
              descCn: "影像",
              id: 121,
              operator: "1",
              parentId: 102,
              sort: "1",
              updateTime: "2020-10-21T05:15:39.000+00:00",
              value: "image"
            }
          ]
        },
        {
          code: "010006",
          createTime: "2020-10-21 13:15:36",
          creator: "1",
          descCn: "病理报告",
          id: 103,
          operator: "1",
          parentId: 97,
          sort: "6",
          updateTime: "2020-10-21T05:15:39.000+00:00",
          value: "pathology_report",
          cdict: [
            {
              cdict: null,
              code: "010006001",
              createTime: "2020-10-21 13:15:36",
              creator: "1",
              descCn: "病理",
              id: 125,
              operator: "1",
              parentId: 103,
              sort: "1",
              updateTime: "2020-10-21T05:15:39.000+00:00",
              value: "pathology"
            }
          ]
        }
      ],
      timeLineObj:{
        "2020-09-11": {
          "image": {
            dateTime: "2020-09-11 02:10:00",
            title: "肺部CT" 
          },
          "pathology":{
            dateTime: "2020-09-11 02:10:00",
            title: '"内镜活检组织"示慢性炎,局灶鳞上皮化生。'
          }
        }
      },
      labList:[]
    }
  },
  mounted () {
    setTimeout(() => {
      this.dicList = this.dicDeList;
    }, 2000);
  },
  components: {
    // timeLine: components.timeLine
  },
  methods: {
    addEchart (val) {
      console.log(val)
    },
    changeType (val) {
      console.log(val)
    },
    timeChange (val) {
      console.log(val)
    }
  }
}
</script>
<style lang="less" scoped>
.container {
  margin: 20px 50px;
  min-height: 800px;
  height: 800px;
}
</style>