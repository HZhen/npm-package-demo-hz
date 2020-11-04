<template>
  <div class="time-line-box">
    <i class="change-filter" @click="changeFilter">
      {{ isShow ? "筛选收起" : "筛选展开" }}
    </i>
    <div class="time-line">
      <!-- 制作动画处理 -->
      <div class="animation-box" ref="animationBox">
        <div class="left-filter">
          <div class="time-filter">
            <div class="top">
              <div class="cur-time">
                <i class="line"></i>
                <span class="month">{{ showTime.month }}</span>
                <em>|</em>
                <span class="day">{{ showTime.day }}</span>
                <em>|</em>
                <span class="year">{{ showTime.year }}</span>
              </div>
            </div>
            <div class="select-time">
              <el-date-picker
                size="small"
                v-model="time"
                value-format="yyyy-MM-dd"
                type="daterange"
                range-separator
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              ></el-date-picker>
            </div>
          </div>
          <div class="kinds-filter">
            <div class="top">
              <div class="cur-time">
                <i class="line"></i>
                <span>类别筛选</span>
              </div>
            </div>
            <div class="content-filter">
              <el-input
                v-model="filterText"
                placeholder="请输入时间轴类别"
                suffix-icon="iconfont iconsousuo"
                size="mini"
              ></el-input>
              <div class="tree-con">
                <el-tree
                  :data="treeData"
                  show-checkbox
                  node-key="value"
                  :props="defaultProps"
                  ref="tree"
                  :default-expanded-keys="expandedKeys"
                  :filter-node-method="filterNode"
                  @check="handleCheck"
                ></el-tree>
              </div>
            </div>
          </div>
        </div>
        <div class="center-timeline" v-loading="loading" element-loading-text="时间轴加载中">
          <time-line-table
            :timelineData="timelineData"
            :viewData="view_data"
            :time="time"
            :tableModal="tableModal"
            :labList="labList"
            @addEchart="addEchart"
            v-if="timelineData.length != 0 ||  view_data.length != 0"
            @isLoading="isLoading"
          />
          <p v-else class="empty">暂无数据</p>
        </div>
        <div class="right-timeline-kinds">
          <div class="cur-time">
            <i class="line"></i>
            <em>类别时间线</em>
            <div class="sort-con">
              <a :class="{actived: typeIndex === 1}" @click="changeTypeIndex(1)">正序</a>
              <a :class="{actived: typeIndex === 2}" @click="changeTypeIndex(2)" style="margin-left:10px">反序</a>
            </div>
          </div>
          <category-line :categoryLineData="categoryLineData"></category-line>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI);
import {TimeLineTable,CategoryLine} from "./components/index";
import moment from "moment";
import { cloneDeep } from "lodash";

export default {
  name: 'timeLine',
  props:["dicList","timeLineObj","labList"],
  data() {
    return {
      isFirst: true,
      showTime: {
        month: "",
        day: "",
        year: "",
      },
      selectTime: {
        year: "按年显示",
        month: "按月显示",
        day: "按天显示",
        recentMonth: "最近一个月",
        recentThreeMonth: "最近三个月",
      },
      time: [],
      treeData: [
        {label: "全部",value: "all",children:[]}
      ],
      // 选中的节点
      checkTreeData: [],
      // 默认选中的节点
      expandedKeys:['all'],
      // 一级目录的节点
      firstTreeData:[],
      // 默认全选的二级节点
      defaultTreeList: [],
      tableModal:[],
      // 时间轴数据
      timeLineInfo: {},
      treeNameInfo: {},
      defaultProps: {
        children: "children",
        label: "label",
      },
      timelineData: [],
      categoryLineData: [],
      defaultTimeData: [],
      defaultLabData: [],
      isShowText: "筛选收起",
      isShow: true,
      filterText: "",
      newArr: [],
      showTimeData: [],
      loading: true,
      view_data: [],
      typeIndex: 1
    }
  },
  created() {
    let date = new Date();
    let obj = this.ConverToDate(date);
    this.showTime = obj;
    this.getDicList();
  },
  mounted() {
    let dom = document.getElementsByClassName("el-range-separator")[0];
    dom.setAttribute("class", "el-range-separator iconfont iconriqijiantou");
    if(JSON.stringify(this.timeLineObj) !== "{}") {
      this.isLoading()
      this.timeLineInfo = this.timeLineObj;
      this.handleSortTime(this.timeLineInfo);
    } else {
      this.isLoading()
      this.timelineData = [];
      this.view_data = []
    }
  },
  watch: {
    time (val) {
      this.$emit("timeChange",val)
    },
    filterText(val) {
      this.$refs.tree.filter(val);
    },
    timeLineObj: {
      handler(newValue) {
        if(JSON.stringify(newValue) !== "{}") {
          this.timeLineInfo = newValue;
          this.handleSortTime(this.timeLineInfo)
        } else {
          this.timelineData = [];
          this.view_data = []
        }
      },
      deep: true
    },
    dicList: {
      handler(newValue) {
        console.log(newValue)
        if (newValue && newValue.length) {
          this.getDicList()
        }
      },
      deep: true
    }
  },
  methods: {
    // 三级时间轴的type
    addEchart (val) {
      this.$emit("addEchart",val)
    },
    // 当前时间显示
    ConverToDate(date) {
      var chinese = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九","十","十一","十二"];
      var y = date.getFullYear().toString();
      var m = date.getMonth().toString();
      var d = date.getDate().toString();
      var result = {};
      result.year = y+"年";
      if (m.length == 2) {
        if (m.charAt(0) == "1") {
          result.month = "十" + chinese[Number(m.charAt(1)) + 1] + "月";
        }
      } else {
        m = Number(m);
        result.month = chinese[m + 1] + "月";
      }
      if (d.length == 2) {
        result.day = chinese[d.charAt(0)] + "十" + chinese[d.charAt(1)]+"号";
      } else {
        result.day = chinese[d.charAt(0)]+"号";
      }
      return result;
    },
    // 全息视图的时间排序
    forwardRankingDate(data, p) {
      for (let i = 0; i < data.length - 1; i++) {
        for (let j = 0; j < data.length - 1 - i; j++) {
          if (Date.parse(data[j][p]) > Date.parse(data[j + 1][p])) {
            var temp = data[j];
            data[j] = data[j + 1];
            data[j + 1] = temp;
          }
        }
      }
      return data;
    },
    handleSelectTime() {},
    // 处理时间轴不同类型的内容数据
    setTimeLineTypeData (type,obj) {
      /*
      * examination: "检查检验"; inspectionReport: "既往检查报告"; diagnose: "诊断"; medicalHistory: "既往病史"; appointment: "门诊预约"; mdt: "MDT";
      * follow: "随访"; progressNote: "病程记录"; inHospital: "入院"; outHospital: "出院"; operation: "手术史";
      * operationDoctorAdvice: "手术医嘱"; radiotherapy: "放疗史"; chemotherapy: "化疗史";  drug: "药物";drugMedicine: "当日药物医嘱"
      * otherAdvice: "其他医嘱"; image: "影像"; pathology: "病理";
      */
      let info = {
        title: '',
        des: '',
        time: '',
        url: '',
        list: []
      }
      // 标题
      info.title= obj.title;
      // 时间
      info.time = obj.dateTime ? moment(obj.dateTime).format('H:mm'):''; 
      if(type === 'examination' || type === 'pathology' || type === 'image') { //检查检验、病理、影像
        info.url = obj.data ? obj.data.reportUrl || '' :''
        info.des =  obj.data ? obj.data.diagnosis || '' : '';
      } else if (type === "inspectionReport") { //既往检查报告
        // info.list = obj.inspectionReportData


        info.des = '';
      } else if (type === "diagnose") { //诊断
        info.des = obj.data ? obj.data.diagnosesName || '' : '';
      } else if (type === "medicalHistory") { //既往病史
        info.des = obj.data.content || '';
      } else if (type === "appointment") { //门诊预约
        info.des = obj.data ? obj.data.mainAction || '' : '';
      } else if (type === "mdt") { // MDT
        info.des = obj.data ? obj.data.conclusion || '' : '';
      } else if (type === "follow") { // 随访
        info.des = obj.data ? obj.data.content || '' : '';
      } else if (type === "progressNote") { // 病程记录


        // info.url = obj.data ? obj.data.url || '' : '';
      } else if (type === "inHospital" ) { //入院
        info.des = obj.data ?  obj.data.reason || '' : '';
      } else if (type === "outHospital") { // 出院
        info.des = obj.data ? obj.data.outOffOrgName || '' : '';
      } else if (type === "operation" || type === "operationDoctorAdvice") { // 手术史 || 手术医嘱
        info.des =  obj.data ? obj.data.name || '' : '';
      } else if (type === "radiotherapy") { // 放疗史
        info.des =  obj.data ? obj.data.content || '' : '';
      } else if (type === "chemotherapy") { // 化疗史
        info.des =  obj.data ? obj.data.content || '' : '';
      } else if (type === "drug" ||type === "drugMedicine") { // 药物 || 当日药品医嘱
        info.des = obj.data.drugName+ (obj.data.daysOfMedication + "天"+obj.data.drugUsingFreq+obj.data.drugDoseUnit+obj.data.drugPerDose);
      } else if (type === "otherAdvice") { // 其他医嘱


        // info.des = '';
      } else if(type === "case_summary" || type === "outpatients_emergency_case" ||type === "outpatients_emergency_prescription" ||type === "check_recode" || 
      type === "general_cure_record"|| type ==="midwifery" || type === "nursing_op_record" || type === "nursing_assess_plan" || type === 'informed_consent' ||
      type==='hospital_record_homepage' || type === "tcm_hospital_record_homepage"||type === "in_hospital" || type ==="in_hospital_process" || type === "in_hospital_advice"||
      type === "out_hospital_conclusion" || type === "transfer_record" || type === "medical_org") {
        info.url = obj.data ? obj.data.url || '' : ''
      }
      return info
    },
    // 左侧字典数据
    getDicList () {
      if(this.dicList.length) {
        let list = this.dicList.map(item => {
          return {
            ...item,
            label: item.descCn,
            children: (item.cdict || []).map(option => {
              return {
                ...option,
                label: option.descCn,
              }
            })
          }
        })
        this.tableModal = this.dicList.map(item => {
          return {
            value: item.value,
            label: item.descCn,
            list: (item.cdict || []).map(option => {
              return option.value
            })
          }
        })
        this.firstTreeData = this.dicList.map(item => {
          return item.value
        })
        list.forEach(item => {
          item.children.forEach(option => {
            this.defaultTreeList.push(option.value)
          })
        });
        list.forEach(item => {
          this.treeNameInfo[item.value] = item.descCn
        })
        this.checkTreeData = cloneDeep(this.defaultTreeList);
        this.treeData[0].children = list;
        // this.getlevelCheck(list);
        let params = this.getParamsData(this.checkTreeData)
        this.$emit("changeType",params)
      }
    },
    
    // 设置配置参数
    getParamsData (list) {
      let params = ''
      if(list.length) {
        list.forEach(item => {
          params += '&searchCodeList=' + item
        })
      }
      return params
    },
    // 处理时间轴对应的数据
    handleSortTime (data) {
      let timeInfo = cloneDeep(data);
      let timeList = []
      let categoryList = []
      // 创建数组数据类型模版
      let parArr = []
      for(let key in timeInfo) {
        let result = parArr.some(function(item) {
            if (item.time == key.slice(0,10)) {
                return true;
            }
        })
        if (!result) {
          parArr.push({
            time: key.slice(0,10),
            info: [],
          })
        }
      }
      parArr.sort(function (a, b) {
        return (new Date(b.time)).getTime() - (new Date(a.time)).getTime();
      });
      // 将对象转为数组
      for(let key in timeInfo) {
        for(let i in timeInfo[key]) {
          timeList.push({
            time: key,
            type: i,
            obj: timeInfo[key][i]
          })
        }
      }
      if (timeList.length) {
        // 循环赋值
        for (let prop of timeList) {
          let info =  this.setTimeLineTypeData( prop.type,prop.obj);
          categoryList.push({
            title: info.title,
            des: info.des,
            category: prop.type,
            start_time: info.time,
            time: prop.time,
            urls: info.urls ? info.urls: ''
          })
          for (let item of parArr) {
            if (prop.time.slice(0,10) == item.time) {
              let obj = {};
              obj.title = info.title;
              obj.description = info.des;
              obj.category = prop.type;
              obj.start_time = info.time;
              obj.urls = info.urls || '';
              if (info.list) {
                obj.list = info.list;
              }
              item.info.push(obj);
            }
          }
        }
        this.timelineData = parArr;
        this.handleViewData(parArr);
        this.handleCategory(categoryList)
      } else {
        this.timelineData = [];
        this.view_data = []
      }
    },
    // 处理全息视图的数据
    handleViewData (v) {
      let view_data = v.reduce((arr, _) => {
        const obj = _.info.reduce((obj, info) => {
          let category = ''
          this.tableModal.forEach(item=> {
             if(item.list.indexOf(info.category)>=0) {
              category = item.value
             }
           })
          if (!obj[category]) obj[category] = [];
          obj[category].push({
            // ...info,
            subCategory: info.category,
            urls: info.urls || "",
            title: info.title || "",
            list: info.list,
            description: info.description || "",
          });
          return obj;
        }, {});
        arr.push({
          time: _.time,
          ...obj,
        });
        return arr;
      }, []);
      let list = this.forwardRankingDate(view_data, "time");
      console.log(list)
      this.view_data = list;
    },
    // 处理类别时间线的数据
    handleCategory (data) {
      let list = [];
      let defaultData = [];
      /* 合并相同字段值的数组对象 */
      for (let i = 0; i < data.length; i++) {
        let category = ''
        this.tableModal.forEach(item=> {
          if(item.list.indexOf(data[i].category)>=0) {
            category = item.label
          }
        })
        if (defaultData.indexOf(category) === -1) {
          list.push({
            category: category,
            info: [
              {
                // sortTime: new Date(data[i].start_time).getTime(),
                time: data[i].time.slice(0, 10),
                start_time: data[i].start_time || '',
                title: data[i].title,
                urls: data[i].urls,
                des: data[i].des,
                subCategory: data[i].category
              },
            ],
          });
          defaultData.push( category);
        } else {
          for (let j = 0; j < list.length; j++) {
            if (list[j].category ==  category) {
              list[j].info.push({
                // sortTime: new Date(data[i].start_time).getTime(),
                time: data[i].time.slice(0, 10),
                start_time: data[i].start_time ||'',
                title: data[i].title,
                urls: data[i].urls,
                des: data[i].des,
                subCategory: data[i].category
              });
              break;
            }
          }
        }
        // 根据info中的时间sortTime进行排序
        // list.forEach((item) => {
        //   if (item.info && item.info.length > 1) {
        //     item.info.sort(function (a, b) {
        //       return a.sortTime - b.sortTime;
        //     });
        //   }
        // });
        this.categoryLineData = list;
      }
    },
    // 改变类别时间线的排序
    changeTypeIndex (index) {
      this.typeIndex = index;
      // 根据info中的时间sortTime进行排序
      let  list = cloneDeep(this.categoryLineData)
      if(index === 1) {
        list.forEach((item) => {
          if (item.info && item.info.length > 1) {
            item.info.sort(function (a, b) {
              return (new Date(`${a.time}' '${a.start_time}`)).getTime() - (new Date(`${b.time}' '${b.start_time}`)).getTime();
            });
          }
        });
      } else {
        list.forEach((item) => {
          if (item.info && item.info.length > 1) {
            item.info.sort(function (a, b) {
              return (new Date(`${b.time}' '${b.start_time}`)).getTime() - (new Date(`${a.time}' '${a.start_time}`)).getTime();
            });
          }
        });
      }
      this.categoryLineData = list;
    },
    /* 动画 */
    changeFilter() {
      let dom = this.$refs.animationBox;
      if (this.isShow) {
        dom.setAttribute("class", "animation-box in");
      } else {
        dom.setAttribute("class", "animation-box out");
      }
      this.isShow = !this.isShow;
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    handleCheck (data,subdata) {
      if(this.isFirst) { // 判断是不是第一次点击
        if(data.value === "all") { // 全选的值
          this.checkTreeData = [];
          this.checkTreeData = cloneDeep(this.defaultTreeList);
        } else {
          // 去掉第一级目录的value
          let checkedKeys = cloneDeep(subdata.checkedKeys);
          checkedKeys.forEach((item,index) => {
            if(this.firstTreeData.indexOf(item)>= 0) {
              checkedKeys.splice(index,1)
            }
          })
          this.checkTreeData = checkedKeys
        }
        this.isFirst = false;
        // 选中的类别的拼接
        let params = this.getParamsData(this.checkTreeData)
        this.$emit("changeType",params)
      } else {
        if(data.value === 'all' && subdata.checkedKeys.length === this.defaultTreeList.length + 7) {
          this.checkTreeData = cloneDeep(this.defaultTreeList);
        } else if (data.value === 'all' && subdata.checkedKeys.length === 0 ) {
          this.checkTreeData = []
        } else {
          this.checkTreeData = [];
          subdata.checkedNodes.forEach(item => {
            if(item.value !== "all" && this.firstTreeData.indexOf(item.value) < 0) {
              this.checkTreeData.push(item.value)
            }
          })
        }
        let params = this.getParamsData(this.checkTreeData)
        this.$emit("changeType",params)
      }
    },
    isLoading() {
      this.loading = false;
    }
   },
  components: {
    TimeLineTable,
    CategoryLine,
  },
};
</script>
<style lang="less">
// 时间轴
.el-timeline-item__node--normal {
  width: 20px !important;
  height: 20px !important;
}
.el-timeline-item__node {
  i {
    font-size: 30px;
    background: #fff;
  }
  .el-timeline-item__icon {
    color: #407df3 !important;
  }
}
.el-timeline-item__tail {
  left: 9px !important;
}

.el-timeline {
  li:nth-of-type(even) {
    .el-timeline-item__content {
      position: relative;
      left: calc(-100% - 72px);
      text-align: right;
    }

    .el-timeline-item__timestamp {
      transform: translateX(-162px);
      width: 300px;
    }
  }
  .el-timeline-item__timestamp {
    font-size: 16px;
    color: #000;
    font-weight: 600;
  }
  .el-timeline-item__wrapper {
    padding-left: 44px;
  }
}
.time-line-box {
  .tree-con {
    label{
      margin-bottom: 0;
    }
  }
}
</style>
<style lang="less" scoped>
@import './index.less';
</style>