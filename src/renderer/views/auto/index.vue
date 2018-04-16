<template>
    <div class="container">
        <el-row type="flex" justify="center">
          <div class="top flex flex-x-center">
            <i class="el-icon-warning"></i> 
            <span>
              本功能目前仅限于易车网刷口碑帖，往后继续扩展
            </span>
          </div>
        </el-row>
        <el-row type="flex" >
            <el-button type="primary" round @click="importExcelToTable">导入excel
            </el-button>
            <el-button type="success" round @click="freshSelect">刷新选中
            </el-button>
            <el-button type="success" round @click="freshAll">刷新全部
            </el-button>
        </el-row>
        <el-row class="">
          包含网址的列名：
          <el-select v-model="urlCol" placeholder="请选择">
            <el-option
              v-for="item in urlColOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-row>
        <el-row>
          刷新频率：
          <el-radio-group v-model="rate" size="small">
            <el-radio v-for="rt in rateList" :label="rt" border>{{formatePenRate(rt)}}</el-radio>
          </el-radio-group>
        </el-row>
        <el-row>
          刷新次数：
          <el-autocomplete
            class="inline-input"
            v-model="maxCount"
            :fetch-suggestions="querySearch"
            placeholder="请输入内容"
            :trigger-on-focus="false"
          ></el-autocomplete>
          次
        </el-row>
        <el-tabs v-if="workbook.length>0" v-model="activeName"  type="card" @tab-click="handleClick">
          <el-tab-pane v-for="sheet in workbook" :label="sheet.name" :name="sheet.name">
            <el-table
              border
              tooltip-effect="dark"
              :data="sheet.data"
              @header-click="headerClick"
              @selection-change="handleSelectionChange"
              style="width: 100%">
              <el-table-column
                type="selection"
                width="55">
              </el-table-column>
              <el-table-column
                fixed
                v-for="header in sheet.headers"
                v-if="header != 'scan'"
                :prop="header"
                :label="header"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                fixed="right"
                label="操作"
                width="120">
                <template slot-scope="scope">
                <el-button 
                    icon="el-icon-search" circle 
                    @click.native.prevent="freshPage(scope.$index, sheet.data)">
                </el-button>
                <span>{{scope.row.scan}}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
        <div v-else class="no-data flex flex-x-center">
          请导入excel数据！
        </div>
    </div>
</template>
<script>
import { remote } from "electron";
const dialog = remote.dialog;
import axios from "axios";
import htmlparser from "htmlparser2";
import XLSX from "xlsx";
import _ from "lodash";
export default {
  data() {
    return {
      selectRows: [],
      rateList: [1000, 2000, 5000, 10000, 20000, 30000, 60000],
      rate: 10000,
      urlCol: "网址",
      activeName: "",
      importExcelIng: false,
      workbook: [],
      clickHeader: "",
      maxCount: "",
      maxCounts: [
        { value: "1000" },
        { value: "2000" },
        { value: "3000" },
        { value: "4000" }
      ]
    };
  },
  computed: {
    urlColOptions: function() {
      if (this.workbook.length > 0) {
        let currWorkBook = _.find(this.workbook, { name: this.activeName });
        return currWorkBook.headers.map(item => {
          return {
            label: item,
            value: item
          };
        });
      } else {
        return [];
      }
    }
  },
  mounted() {
    // this.getPage();
  },
  methods: {
    querySearch(queryString, cb) {
      var maxCounts = this.maxCounts;
      var results = queryString
        ? maxCounts.filter(this.createFilter(queryString))
        : maxCounts;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return maxCount => {
        return maxCount.value.toString().indexOf(queryString) === 0;
      };
    },
    //最大公约数
    getBigFactor(a, b) {
      if (b == 0) {
        return a;
      }
      return this.getBigFactor(b, a % b);
    },
    formatePenRate(rate) {
      let bigFactor = this.getBigFactor(rate, 60000);

      return rate / bigFactor + "分钟刷新" + 60000 / bigFactor + "次";
    },
    handleSelectionChange(val) {
      console.log("++++++val++++++");
      console.log(val);
      console.log("++++++++++++");
      this.selectRows = val;
    },
    freshSelect() {
      let self = this;
      this.selectRows.map((item, idx) => {
        // this.freshPage(item[self.urlCol])

        let freshTimer = setInterval(function() {
          self.getPage(item[self.urlCol], function(text) {
            self.workbook.map(wb => {
              if (wb.name == self.activeName) {
                self.$set(
                  wb.data,
                  idx,
                  Object.assign(wb.data[idx], { scan: text })
                );
              }
            });
          });
        }, self.rate);
      });
    },
    freshAll() {
      let self = this;
      let currWorkBook = _.find(this.workbook, { name: this.activeName });
      currWorkBook.data.map((item, idx) => {
        // this.freshPage(item[self.urlCol])
        let freshTimer = setInterval(function() {
          self.getPage(item[self.urlCol], function(text) {
            self.workbook.map(wb => {
              if (wb.name == self.activeName) {
                self.$set(
                  wb.data,
                  idx,
                  Object.assign(wb.data[idx], { scan: text })
                );
              }
            });
          });
        }, this.rate);
      });
    },
    freshPage(row) {
      console.log(row);
      this.getPage(row[this.urlCol], function(text) {
        Object.assign({
          scan: text
        });
      });
    },
    headerClick(column, event) {
      this.clickHeader = column.property;
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    importExcelToTable() {
      let self = this;
      let excel = dialog.showOpenDialog({ properties: ["openFile"] });
      let workbook = XLSX.readFile(excel[0]);

      let sheetNames = workbook.SheetNames;
      self.activeName = sheetNames[0];
      sheetNames.map(item => {
        let sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
        let headerArr = [];
        sheetData.map(item => {
          headerArr.push(_.keys(item));
        });
        let headers = _.union(...headerArr);

        self.workbook.push({
          name: item,
          headers: headers,
          data: sheetData
        });
      });
    },
    getPage(url, cb) {
      if (url == "") {
        return false;
      }
      let self = this;
      axios.get(url).then(res => {
        var parser = new htmlparser.Parser(
          {
            onopentag: function(name, attribs) {},
            ontext: function(text) {
              if (text.indexOf("浏览量") > -1) {
                cb(text);
              }
            },
            onclosetag: function(tagname) {}
          },
          { decodeEntities: true }
        );
        parser.write(res.data);
        parser.end();
      });
    }
  }
};
</script>
<style lang="scss">
.url-input {
  padding-right: 20px;
}
.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.select-column {
  background-color: #ecf5ff;
}
th.select-column {
  background-color: #ecf5ff;
}
.top {
  color: #e6a23c;
}
.no-data {
  width: 100%;
  height: 500px;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
  color: #c0c4cc;
}
</style>

