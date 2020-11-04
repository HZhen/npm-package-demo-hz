<template>
  <div class="time-line-table">
    <div class="title">
      <div class="cur-time">
        <i class="line"></i>
        <em>患者{{ showView ? "全息视图" : "时间轴" }}</em>
        <div class="sort-con" v-show="!showView">
          <a :class="{actived: lineIndex === 1}" @click="changeLineIndex(1)">正序</a>
          <a :class="{actived: lineIndex === 2}" @click="changeLineIndex(2)" style="margin-left:10px">反序</a>
        </div>
        <div class="sort-con" v-show="showView">
          <a :class="{actived: tableIndex === 1}" @click="changeTableIndex(1)">正序</a>
          <a :class="{actived: tableIndex === 2}" @click="changeTableIndex(2)" style="margin-left:10px">反序</a>
        </div>
      </div>
      <span @click="showPatientView">
        {{ showView ? "时间轴" : "患者全息视图"}}
      </span>
    </div>
    <template v-if="!showView">
      <el-timeline>
        <el-timeline-item
          :timestamp="ele.time"
          placement="top"
          v-for="(ele, i) in subTimelineData"
          icon="iconfont iconriqi"
          :key="i"
        >
          <div v-for="(item,index) in ele.info" :key="index" class="time-line-box">
            <p>
              <span class="time-lime-title">
                <i class="iconfont" :class="getCategoryClass(item.category)"></i>
                <span class="sub-title"> {{ item.title ? item.title : ""}}</span>
              </span>
              <span v-show="item.start_time" class="start-time">{{ item.start_time }}</span>
            </p>
            <span class="time-line-desc">{{ item.description ? item.description : ""}}</span>
            <div>
              <span class="check" @click="check(item)">查看</span>
            </div>
          </div>
        </el-timeline-item>
        <el-timeline-item timestamp="last" placement="top" icon="iconfont iconriqi"></el-timeline-item>
      </el-timeline>
    </template>

    <template v-if="showView">
      <div class="chart-con">
        <div class="chart-item" :key="index" v-for="(item,index) of labRecordsList">
          <div class="title">
            <span class="name-unit">{{item.name}}({{item.unit}})</span>
            <span class="btn-content">
              <el-button size="mini" @click="handleDelete(index)">
                <i class="iconfont iconguanbi"></i>
              </el-button>
            </span>
          </div>
          <line-chart :index="index" :recordsInfo="item"></line-chart>
        </div>
      </div>
      <div class="table-con">
        <el-table :data="subViewData" style="width: 100%;"  max-height="750" border>
          <el-table-column prop="time" label="时间" width="120" fixed />
          <el-table-column
            v-for="item in cate_list"
            :prop="item.prop"
            :label="item.label"
            width="180"
            :key="item.prop"
          >
            <template slot-scope="scope">
              <!-- <span>{{ scope.row}}</span> -->
              <template v-if="item.prop !== 'other_check_report'">
                <span v-for="(item,index) of scope.row[item.prop]" :key="index">
                  <h3 class="column-title">{{item.title}}  
                    <span
                      class="check"
                      @click="check(item)"
                    >查看</span></h3>
                  <span class="column-des">{{item.description}}</span>
                </span>
              </template>
              <template v-else>
                <span v-for="(item,index) of scope.row.other_check_report" :key="index">
                  <h3 class="column-title">{{ item.title}}:</h3>
                  <div
                    class="report-item"
                    v-for="(option,index) of item.list.slice(0,5)"
                    :key="index"
                  >
                    <span class="name">{{option.itemname}}</span>
                    <span class="val">{{option.testresult}}</span>
                    <span class="unit">{{option.unit}}</span>
                  </div>
                  <span class="check" @click="openLabRecord(item.list,scope.row.time)">查看更多</span>
                </span>
              </template>
            </template>
          </el-table-column>
         </el-table>
      </div>
    </template>

    <!-- 弹窗的pdf显示 -->
    <el-dialog :visible.sync="dialogVisible" :append-to-body="true" width="70%">
      <div class="img">
        <div class="img-box" v-if="imgs.length > 0">
          <img :src="ele" alt v-for="(ele,index) in imgs" :key="index" />
        </div>
        <!-- pdf 展示 -->
        <div class="pdf" v-if="pdfs.length > 0">
          <pdf
            :src="ele"
            :page="currentPage"
            @num-pages="pageCount = $event"
            @page-loaded="currentPage = $event"
            @loaded="loadPdfHandler"
            v-for="(ele,eindex) in pdfs"
            :key="eindex"
          ></pdf>
          <p class="handle">
            <el-button @click="changePdfPage(-1)" size="small" :disabled="currentPage == 1">上一页</el-button>
            <el-button
              type="primary"
              @click="changePdfPage(1)"
              size="small"
              :disabled="currentPage == pageCount"
            >下一页</el-button>
          </p>
        </div>
        <!-- 文字展示 -->
        <div class="text" v-if="fileType === 'text' && imgs.length === 0 && pdfs.length===0">
          {{textValue}}
        </div>
      </div>
    </el-dialog>
    <!-- 三级时间轴数据 -->
    <el-dialog
      :visible.sync="dialogLabVisible"
      :title="dialogTitle"
      custom-class="lab-dialog"
      :append-to-body="true"
      width="50%"
    >
      <div class="lab-content">
        <div class="remark"></div>
        <div class="lab-con">
          <el-scrollbar style="height: 100%">
            <div class="lab-item" v-for="(item,index) of labRecords" :key="index">
              <span class="name">
                <el-button size="mini" @click="handleAdd(item.itemid,item.unit)">
                  <i class="el-icon-plus"></i>
                </el-button>
                {{item.itemname}}（{{item.itemid}}）
              </span>
              <div class="val-unit-normal">
                <span class="val-unit">
                  <em>{{item.testresult}}</em>
                  {{item.unit}}
                </span>
                <span v-if="item.normal_range" class="normal">({{item.normal_range}}{{item.unit}})</span>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import moment from "moment";
import pdf from "vue-pdf";
import LineChart from "./line-chart.vue";
import { cloneDeep } from "lodash";

export default {
  props: ["timelineData", "viewData", "labList" ,'time','tableModal'],
  name: 'time-line-table',
   components: {
    pdf,
    LineChart,
  },
  data() {
    return {
      dialogVisible: false,
      url: "",
      currentPage: 0, // pdf文件页码
      pageCount: 0, // pdf文件总页数
      fileType: '',
      textValue: '',
      pdfs: [],
      imgs: [],
      showView: false,
      cate_list: [
        {label: "门诊/住院诊疗记录",prop:'outpatients_hospital_record'},
        {label: "手术/操作",prop:'operationf'},
        {label: "治疗",prop:'treatment'},
        {label: "影像报告",prop:'image_report'},
        {label: "病理报告",prop:'pathology_report'},
        {label: "其他检验检测报告",prop:'other_check_report'},
        {label: "文书",prop:'writer'},
      ],
      // 链接的类型判断
      typePdfList: ["progressNote","examination","pathology","image","case_summary","outpatients_emergency_case","outpatients_emergency_prescription",
      "check_recode","general_cure_record","midwifery","nursing_op_record","nursing_assess_plan","informed_consent","hospital_record_homepage","tcm_hospital_record_homepage",
      "in_hospital","in_hospital_process","in_hospital_advice","out_hospital_conclusion","transfer_record","medical_org"],
      prevDisable: "false",
      nextDisable: "false",
      dialogLabVisible: false,
      dialogTitle: "",
      labRecords: [],
      labRecordsList: [],
      chartData: [],
      name: '',
      unit: '',
      isCommon:'',
      // 正序和反序
      subTimelineData:[],
      subViewData: [],
      lineIndex: 1,
      tableIndex: 1
    };
  },
  watch: {
    timelineData(val) {
      this.subTimelineData = val;
    },
    viewData (val) {
      this.subViewData = val
    },
    labList: {
      handler(newValue) {
         if(newValue.length && !this.isCommon ) {
          this.labRecordsList.push({
            name: this.name,
            unit: this.unit,
            list: newValue,
          });
          this.name = '';
          this.unit = '';
          this.dialogLabVisible = false;
        } else {
          this.name = '';
          this.unit = '';
          this.dialogLabVisible = false;
        }
      },
      deep: true
    }
  },
  created() {
    this.$emit("isLoading", false);
    // // 将props的值保存在当前组件
    this.subTimelineData = this.timelineData;
    this.subViewData = this.viewData;
  },
  methods: {
    // 获取二级类别的图标样式
    getCategoryClass(category) {
      let name = '';
      let iconVal = ''
      this.tableModal.forEach(item => {
        if(item.list.indexOf(category)>=0) {
          name = item.value
        }
      })
      if(name === "outpatients_hospital_record") {
        iconVal = 'iconicon1'
      } else if(name === "operationf" || name === "treatment") {
        iconVal = 'iconshengmingtizheng'
      } else if (name === "other_check_report") {
        iconVal = "iconicon2"
      } else if (name === "pathology_report" || name === "image_report" ) {
        iconVal = "iconicon3"
      }
      return iconVal
    },
    // 改变时间轴的排序
    changeLineIndex (index) {
      this.lineIndex = index;
      this.subTimelineData.reverse() 
    },
    // 改变时间轴的排序
    changeTableIndex (index) {
      this.tableIndex = index;
      this.subViewData.reverse() 
    },
    showPatientView() {
      this.showView = !this.showView;
    },
    check(val) {
      let category = val.category || val.subCategory;
      this.fileType = this.typePdfList.indexOf(category) < 0 ? 'text' : 'pdf';
      this.textValue = ''
      this.pdfs = [];
      this.imgs = [];
      if(this.fileType === "pdf" && val.urls) {
        let uri = val.urls;
        // 处理pdf 和图片
        if (uri.indexOf("pdf") != -1) {
          this.pdfs.push(uri);
        } else {
          this.imgs.push(uri);
        }
      } else {
        this.textValue = val.description || '';
      }
      if(this.imgs.length >0 || this.pdfs.length >0 || this.textValue) {
        this.dialogVisible = true;
      } else {
        this.$message({
          message: '警告,没有内容可以打开',
          type: 'warning'
        });
      }
    },
    openLabRecord(val, title) {
      this.labRecords = val;
      this.dialogTitle = title;
      this.dialogLabVisible = true;
    },
    /* 生成折线数据并添加到全息图 */
    async handleAdd(name, unit) {
      this.$emit("addEchart",name)
      this.name = name;
      this.unit = unit
      // 判断是否已经存在当前类别的曲线
      this.isCommon = false;
      this.labRecordsList.forEach((item) => {
        if (item.name === name) {
          this.isCommon = true;
        }
      });
    },
    /* 删除折线图数据 */
    handleDelete(index) {
      let list = cloneDeep(this.labRecordsList);
      list.splice(index, 1);
      this.labRecordsList = list;
    },
    changePdfPage(val) {
      this.currentPage += val;
    },
    // pdf加载时
    loadPdfHandler() {
      this.currentPage = 1; // 加载的时候先加载第一页
    },
  },
};
</script>
<style lang="less">
.el-timeline-item__node i {
  font-size: 30px;
  background: #fff;
}
.lab-dialog {
  width: 700px !important;
  .lab-con {
    height: 340px;
  }
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
}
</style>
<style lang="less" scoped>
.table-con {
  padding: 20px;
  p{
    margin-bottom: 0;
  }
}
.time-line-table {
  overflow: auto;
  position: relative;
  width: 100%;
  height: 100%;
  .title {
    text-align: right;
    padding-top: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    span {
      color: #407df3;
      cursor: pointer;
      border-bottom: 1px solid #407df3;
      margin-right: 20px;
    }
    .cur-time {
      margin-left: 20px;
      font-size: 16px;
      display: flex;
      align-items: center;
      .line {
        display: inline-block;
        width: 3px;
        height: 12px;
        background: rgba(64, 125, 243, 1);
        border-radius: 2px;
      }
      em {
        font-style: normal;
        font-weight: 600;
        margin-left: 8px;
      }
      .sort-con {
        margin-left: 10px;
        display: inline-block;
        a {
          cursor: pointer;
          color: #007bff;
        }
        a.actived {
          text-decoration: underline;
        }
      }
    }
  }
  .iconfont {
    font-size: 12px !important;
  }
}
.column-title {
  font-size: 14px;
  font-family: PingFangSC, PingFangSC-Semibold;
  font-weight: 600;
  text-align: justify;
  color: rgba(0, 0, 0, 0.85);
  line-height: 22px;
}
.column-des {
  font-size: 14px;
  font-family: PingFangSC, PingFangSC-Regular;
  font-weight: 400;
  text-align: justify;
  color: rgba(0, 0, 0, 0.85);
  line-height: 22px;
}
.report-item {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  span {
    font-size: 14px;
    font-family: PingFangSC, PingFangSC-Regular;
    font-weight: 400;
    text-align: justify;
    color: rgba(0, 0, 0, 0.85);
    line-height: 22px;
  }
  .name {
    margin-right: 15px;
  }
  .val {
    margin-right: 8px;
  }
}
.lab-content {
  .lab-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 35px;
    line-height: 35px;
    padding-right: 30px;
    box-sizing: border-box;
    cursor: pointer;
    .el-button {
      background-color: transparent;
      border: 1px dashed transparent;
      margin-left: 10px;
      padding: 0px;
      margin-right: 10px;
      span {
        i {
          font-size: 20px;
        }
      }
    }
    .name {
      font-size: 14px;
      font-family: PingFangSC, PingFangSC-Regular;
      font-weight: 400;
      text-align: justify;
      color: rgba(0, 0, 0, 0.85);
      line-height: 22px;
    }
    .val-unit-normal {
      .val-unit {
        font-size: 14px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        text-align: justify;
        color: rgba(0, 0, 0, 0.85);
        line-height: 22px;
        em {
          font-size: 14px;
          font-family: PingFangSC, PingFangSC-Regular;
          font-weight: 400;
          text-align: justify;
          color: rgba(0, 0, 0, 0.85);
          line-height: 22px;
          margin-right: 5px;
        }
      }
      .normal {
        font-size: 14px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        text-align: justify;
        color: rgba(0, 0, 0, 0.85);
        line-height: 22px;
      }
    }
  }
}
.chart-con {
  padding: 20px;
  .chart-item {
    margin-bottom: 20px;
    .title {
      display: flex;
      justify-content: space-between;
      height: 80px;
      line-height: 80px;
      span {
        border: none;
      }
      .name-unit {
        padding-left: 30px;
        font-size: 14px;
        font-family: PingFangSC, PingFangSC-Semibold;
        font-weight: 600;
        text-align: justify;
        color: rgba(0, 0, 0, 0.85);
        line-height: 22px;
      }
    }
  }
}
// timeline
ul {
  transform: translateX(0%);
  position: absolute;
  left: 50%;
}
ul li {
  list-style: none;
  position: relative;
  height: 100%;
  .iconDate {
    display: inline-block;
    padding: 5px;
    border-radius: 20px;
    color: #fff;
    background-color: #407df3;
  }
  .line {
    position: absolute;
    width: 1px;
    left: 9px;
    top: 1px;
    border-left: 2px solid #000;
    height: 100%;
  }
  .time {
    position: relative;
    z-index: 999;
  }
  .time-lime-title {
    font-size: 14px;
    font-weight: 600;
    display: flex;
    flex-direction: row;
    .iconfont {
      width: 22px;
      font-size: 22px!important;
      color: #6693FF;
    }
    .sub-title {
      line-height: 25px;
      font-size: 14px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .timeContent {
    margin-left: 20px;
  }
  .start-time {
    margin-left: 10px;
    color: rgba(0, 0, 0, 0.65);
    font-size: 12px;
    line-height: 25px;
  }
  .time-line-desc {
    color: rgba(0, 0, 0, 0.65);
    font-size: 12px;
    margin-bottom: 8px;
    word-wrap: break-word;
    display: inline-block;
  }
  .time-line-box {
    display: flex;
    margin-top: 32px;
    flex-direction: column;
    position: relative;
    p::after {
      content: "";
      display: inline-block;
      width: 12px;
      height: 1px;
      border-top: 2px solid #e4e7ed;
      position: absolute;
    }
    p {
      margin-bottom: 8px;
      display: flex;
    }
  }
}
ul {
  li:nth-of-type(even) {
    .time-line-box {
      // justify-content: flex-end;
      p {
        display: flex;
        // justify-content: flex-end;
        flex-direction: row-reverse;
        align-items: center;
        // margin-bottom: 0;
        .start-time {
          margin-right: 10px;
        }
        .time-lime-title {
           display: flex;
          // justify-content: flex-end;
          flex-direction: row-reverse;
        }
      }
      p::after {
        right: -37px;
        top: 12px;
      }
      .iconfont {
        margin-left: 12px;
      }
      .time-line-desc,.check {
        margin-right: 34px;
      }
    }
  }
  li:nth-of-type(odd) {
    .time-line-box {
      p::after {
        left: -35px;
        top: 12px;
      }
      .iconfont {
        margin-right: 12px;
      }
      .time-line-desc,.check {
        margin-left: 34px;
      }
    }
  }
}
.check {
  font-size: 12px;
  color: #1890ffff;
  border-bottom: 1px solid #1890ffff;
  cursor: pointer;
}
.img {
  .img-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  img {
    max-width: 100%;
    margin-bottom: 20px;
  }
}
.pdf {
  margin-top: 40px;
}
.handle {
  text-align: right;
  margin-top: 20px;
}
</style>