<template>
  <div class="container flex flex-x-center flex-column">
    <section class="header h-c">
        <p>按'-'按键开始，'='休息一会再喷</p>
    </section>
    <section class="selecter">
      <el-input placeholder="请选择文件" v-model="dictorySelected" :disabled="true">
        <template slot="prepend">
          <el-button type="primary" @click="showFileDialog()">选择字库</el-button>
        </template>
      </el-input>
    </section>
    <section class="config gap-20">
        <el-row>
            <el-radio v-for="(rt,idx) in rateList" :key="idx" v-model="rate" :label="rt" border>{{formatePenRate(rt) }}</el-radio>
        </el-row>
        <el-row class="gap-20 custom-config" type="flex">
            <el-col :span="3" >
                <el-radio class="" v-model="rate" label="customPen" border>
                    自定义喷：
                </el-radio>
            </el-col>
            <el-col :span="8">
                <el-input :disabled="rate!=='customPen'"  v-model="customPen"></el-input>
            </el-col>
            <el-col :span="5" class="flex flex-x-center" >
                {{formatePenRate(customPen)}}
            </el-col>
        </el-row>
    </section>
    <section class="datatable gap-20" v-if="false">
      <div>共有 {{tableData.length}} 条记录</div>
      <el-table v-loading="isLoading" element-loading-text="拼命加载中" :data="tableData" style="width: 100%">
        <el-table-column prop="filename" label="文件名"> </el-table-column>
        <el-table-column prop="filesize" label="文件大小" fixed="right" width="100"> </el-table-column>
      </el-table>
    </section>
    <section class="content gap-20">
        <el-input
            type="textarea"
            class="file-area"
            :autosize="{ minRows: 20, maxRows: 20}"
            resize="none"
            placeholder="文件内容"
            v-model="fileContent">
        </el-input>
    </section>
    <section class="btn-group  flex flex-x-center gap-20">
            <el-button type="primary" round @click="saveFile(dictorySelected,fileContent)">保存文件</el-button>
            <el-button type="primary" round @click="startPenren">启动程序</el-button>
            <el-button type="primary" round @click="stopPenren">停止程序</el-button>
    </section>
  </div>
</template>
<script>
import { remote, ipcRenderer } from "electron";
import path from "path";
import fs from "fs";
const dialog = remote.dialog;
export default {
  name: "file-listing-page",
  data() {
    return {
      dictorySelected: "",
      isLoading: false,
      tableData: [],
      fileContent: "",
      rate: 500,
      customPen: '',
      rateList: [100, 200, 500, 1000, 2000]
    };
  },
  created() {
    let self = this;
    ipcRenderer.on("penren-reply", (event, arg) => {
      if (arg === true) {
        self.$message({
          type: "success",
          message: "开始自动喷人"
        });
      }
    });
  },
  methods: {
    //最大公约数
    getBigFactor(a, b) {
      if (b == 0) {
        return a;
      }
      return this.getBigFactor(b, a % b);
    },
    formatePenRate(rate) {
      if (!rate) {
        return "一下不喷";
      }
      if (rate >= 100000) {
        return "就这速度，还不如打字喷";
      }
      let bigFactor = this.getBigFactor(rate, 1000);

      return rate / bigFactor + "秒" + 1000 / bigFactor + "喷";
    },
    startPenren() {
      if (!this.fileContent) {
        this.$message({
          type: "warning",
          message: "请选择字体库！"
        });
        return false;
      }
      this.$message({
        type: "success",
        message: '超级喷人已经部署，按"-"键即可开始喷人，按"="键即可中场休息'
      });
      ipcRenderer.send("penren", {
        active: "start",
        messageArr: this.fileContent.split("\n"),
        rate: this.rate
      });
    },
    stopPenren() {
      this.$message({
        type: "success",
        message: "超级喷人已经关闭"
      });
      ipcRenderer.send("penren", {
        active: "stop",
        messageArr: this.fileContent.split("\n")
      });
    },
    showFileDialog() {
      dialog.showOpenDialog({ properties: ["openFile"] }, filename => {
        if (filename && filename.length === 1) {
          this.dictorySelected = filename[0];
          this.readFile(this.dictorySelected);
        }
      });
    },
    readFile(filepath) {
      let self = this;
      fs.readFile(filepath, function(err, data) {
        if (err) {
          self.$message({
            type: "error",
            message: "读取文件失败\n" + err
          });
        }
        self.fileContent = data.toString();
      });
    },
    saveFile(filepath, content) {
      let self = this;
      fs.writeFile(filepath, content, function(err) {
        if (err) {
          self.$message({
            type: "error",
            message: "写入文件失败\n" + err
          });
        }
        self.$message({
          type: "success",
          message: "保存文件成功"
        });
      });
    },
    listingFile(filepath) {
      this.isLoading = true;
      fs.readdir(filepath, (err, file) => {
        if (err) {
          this.isLoading = false;
          return alert(err);
        }
        this.tableData = [];
        for (let filename of file) {
          const stat = fs.statSync(path.join(filepath, filename));
          if (stat.isFile()) {
            this.tableData.push({
              filename: filename,
              filesize: stat.size
            });
          }
        }
        this.isLoading = false;
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.custom-config {
  .el-radio.is-bordered{
      border: none;
  }
}
section {
  width: 100%;
}
</style>