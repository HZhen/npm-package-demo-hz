<template>
  <div class="category-line">
    <div class="category-list" v-for="(item,index) of categoryLineData" :key="index">
      <div class="category-title" @click="changeIndex(index)">
        <span class="img-con">
          <img
            src="../images/icon_arrow.png"
            :class="{ 'icon-checked': index === checkIndex }"
            alt
          />
        </span>
        <span class="category">{{item.category}}</span>
      </div>
      <transition
        name="fade"
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <div class="category-con" v-if="index === checkIndex">
          <div class="category-con-item" v-for="(option,oindex) of item.info" :key="oindex">
            <div class="left">
              <i class="point"></i>
              <div class="s-line"></div>
            </div>
            <div class="right">
              <div class="time-title">
                <span class="time">{{option.time}}</span>
                <span class="title">{{option.title}}</span>
              </div>
              <div class="view-detail">
                <span class="start-time">{{option.start_time}}</span>
                <span
                  class="check"
                  @click="check(option)"
                >查看</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
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
  </div>
</template>

<script>
import pdf from "vue-pdf";
export default {
  name: "category-line",
  props: ["categoryLineData"],
  data() {
    return {
      checkIndex: -1,
      dialogVisible: false,
      url: "",
      currentPage: 0, // pdf文件页码
      pageCount: 0, // pdf文件总页数
      fileType: "pdf", // 文件类型
      textValue:'',
      typePdfList: ["progressNote","examination","pathology","image"],
      pdfs: [],
      imgs: [],
      prevDisable: "false",
      nextDisable: "false",
    };
  },
  created() {
    this.$emit("isLoading", false);
    // 处理pdf跨域问题
  },
  methods: {
    changeIndex(index) {
      if (this.checkIndex === index) {
        this.checkIndex = -1;
      } else {
        this.checkIndex = index;
      }
    },
    check(val) {
      let category = val.subCategory;
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
        this.textValue = val.des || '';
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
    changePdfPage(val) {
      this.currentPage += val;
    },
    // pdf加载时
    loadPdfHandler() {
      this.currentPage = 1; // 加载的时候先加载第一页
    },
  },
  components: {
    pdf,
  },
};
</script>
<style lang="less" scoped>
.category-line {
  padding-top: 5px;
}
.category-list {
  .category-title {
    padding: 20px 0 4px 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    border-bottom: 1px solid #eeeeee;
    &:hover {
      cursor: pointer;
    }
    .category {
      font-size: 14px;
      font-family: PingFangSC, PingFangSC-Semibold;
      font-weight: 600;
      text-align: left;
      color: #000000;
      line-height: 22px;
    }
  }
  .img-con {
    height: 22px;
    line-height: 22px;
    text-align: left;
    margin-right: 12px;
    img {
      vertical-align: middle;
      width: 10px;
      height: 10px;
    }
    .icon-checked {
      transform: rotate(90deg);
      -ms-transform: rotate(90deg); /* IE 9 */
      -moz-transform: rotate(90deg); /* Firefox */
      -webkit-transform: rotate(90deg); /* Safari 和 Chrome */
      -o-transform: rotate(90deg);
    }
  }
  .category-con {
    padding: 16px 12px;
    background-color: #f6f9fe;
  }
  .category-con-item {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 100%;
    padding-left: 18px;
    .left {
      position: absolute;
      top: 0;
      left: 0;
      width: 5px;
      margin-right: 13px;
      height: 100%;
      display: flex;
      flex-direction: column;
      .point {
        width: 5px;
        height: 5px;
        background: #407df3;
        border-radius: 50%;
        // margin-top: 9px;
        margin-right: 12px;
      }
    }
    div.s-line {
      flex: 1;
      width: 1px;
      border-left: 1px dashed #dddddd;
      margin-left: 2px;
    }
    .right {
      flex: 1;
    }
    .time-title {
      display: flex;
      justify-content: flex-start;
      margin-left: -2px;
      .time,
      .title {
        font-size: 12px;
        font-family: SourceHanSansCN, SourceHanSansCN-Regular;
        font-weight: 400;
        text-align: left;
        color: #000000;
        line-height: 22px;
      }
      .time {
        width: 84px;
      }
      .title {
        flex: 1;
      }
    }
    .view-detail {
      display: flex;
      justify-content: flex-start;
      padding-bottom: 16px;
      .start-time {
        width: 84px;
        font-size: 11px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        text-align: justify;
        color: rgba(0, 0, 0, 0.65);
        line-height: 22px;
      }
      .check {
        cursor: pointer;
        flex: 1;
        font-size: 11px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        text-decoration: underline;
        text-align: left;
        color: #1890ff;
        line-height: 22px;
      }
    }
  }
  .category-con-item:last-child {
  }
}
</style>