<template>
    <div>
        <el-row>
            <el-col :span="2">
                召唤类型：
            </el-col>
            <el-col :span="22">
                <el-select v-model="selectCellType" placeholder="请选择">
                    <el-option v-for="item in callTypeOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </el-col>
        </el-row>
        <el-table ref="dataTable" v-bind:data="dataArray" height="450" style="width:100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" prop="select">
            </el-table-column>
            <el-table-column prop="name" label="名称" width="180">
            </el-table-column>
            <el-table-column prop="id" label="id" width="180">
            </el-table-column>
            <el-table-column prop="type" label="召唤类型" width="100">
            </el-table-column>
            <el-table-column prop="ref_type" label="数据类型" width="100" v-if="selectCellType==='AI'||selectCellType==='AO'">
    
            </el-table-column>
            <el-table-column prop="addr" label="地址" width="100">
            </el-table-column>
            <el-table-column label="实时值" prop="value" width="180">
            </el-table-column>
            <!-- <el-table-column prop="enable" label="是否启用" width="100">
                                </el-table-column> -->
            <el-table-column label="是否启用" width="120">
                <template scope="scope">
                    <el-switch v-model="dataArray[scope.$index].enable" on-color="#13ce66" off-color="#ff4949" @change="onChangeEnable(scope.$index,scope.row)">
                    </el-switch>
    
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button size="small" @click="handleDataEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="handleDataDelete(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-row style="margin:20px;">
            <el-col :span="2">
                多行操作
            </el-col>
            <el-col :span="6">
                <el-button @click="deleteMultiData">
                    删除
                </el-button>
            </el-col>
        </el-row>
        <el-form :inline="true">
            <el-form-item label="规则名称">
                <el-input v-model="dataInfo.name" placeholder="规则名称"></el-input>
            </el-form-item>
            <el-form-item label="规则id">
                <el-input v-model="dataInfo.id" placeholder="规则id"></el-input>
            </el-form-item>
            <el-form-item label="召唤类型">
                <!-- <el-input v-model="dataInfo.type" placeholder="召唤类型"></el-input> -->
                <el-select v-model="dataInfo.type">
                    <el-option v-for="item in callTypeOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="召唤地址">
                <el-input v-model="dataInfo.addr" placeholder="召唤地址"></el-input>
            </el-form-item>
            <el-form-item label="数据类型" v-if="selectCellType==='AI'||selectCellType==='AO'">
                <el-select v-model="dataInfo.ref_type">
                    <el-option v-for="item in dataType" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="是否启用">
                <el-switch v-model="dataInfo.enable" on-color="#13ce66" off-color="#ff4949">
                </el-switch>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onAddData">添加</el-button>
                <el-button type="primary" @click="onModifyData">修改</el-button>
                <el-button type="primary" @click="resetData">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<style>

</style>
<script>
import { callTypeOptions, dataType } from '@/common/data'
import { deep } from '@/common/common.js'
export default {
    data() {
        return {
            selectCellType: '',
            callTypeOptions: callTypeOptions,
            dataInfo: {
                id: '',
                type: '',
                addr: '',
                unit: '',
                ref_len: '',
                ref_type: '',
                enable: false
            },
            dataType: dataType
        }
    },
    methods: {
        handleDataEdit(index, row) {
            this.dataInfo = deep(row)
            this.dataInfo.enable = row.enable === 1
        },
        onChangeEnable(index, row) {
            // this.dataArray[index] = row
            console.log('row', row);
            console.log(this.config);
            this.config[row.name].enable = row.enable
        },
        handleSelectionChange(val) {
            this.multipleSelection = val
        },
        handleDataDelete(index, row) {
            console.log('delete');
            delete this.config[row.name]
            console.log(this.config[row.name], row.name);
        },
        resetData() {
            this.dataInfo = {
                id: '',
                type: '',
                addr: '',
                unit: '',
                ref_len: '',
                ref_type: '',
                enable: false
            }

        },
        onModifyData() {
            let info = this.dataInfo
            console.log('info', info);
            let tmp = {
                id: info.id,
                type: info.type,
                enable: info.enable ? 1 : 0,
                ref_type: info.ref_type,
                addr: info.addr
            }
            console.log('name', info.name)
            this.config[info.name] = tmp
            console.log('change:', this.config[info.name], tmp);
        },
        onAddData() {
            let self = this
            let info = this.dataInfo
            let enable = info.enable ? 1 : 0
            let config = this.config

            let tmp = {
                id: info.id,
                type: info.type,
                enable: enable,
                ref_type: info.ref_type,
                addr: info.addr
            }
            if (config[info.name] !== undefined) {
                this.onModifyData()

            } else {
                console.log('config', this.config);
                this.config[info.name] = tmp
            }
        },
        deleteMultiData() {
            // console.log(this.dataArray);
            // console.log(this.$refs.dataTable);
            console.log(this.multipleSelection);
            let self = this
            let multipleSelection = this.multipleSelection
            multipleSelection.forEach(function (d) {
                delete self.config[d.name]
                self.getData()
            }, this);
        },
    },
    props: {
        config: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    computed: {
        dataArray() {
            console.log('dataarray');
            let tmp = {}
            let arr = []
            let select = this.selectCellType
            // let config = this.config
            for (let item in this.config) {
                if (this.config[item]["id"] !== undefined && this.config[item].type === select) {
                    let cur =deep(this.config[item])
                    tmp = {
                        name: item,
                        id: cur.id,
                        type: cur.type,
                        addr: cur.addr,
                        enable: cur.enable === 1
                    }
                    if (select === 'AO' || select === 'AI') {
                        tmp['ref_type'] = this.config[item].ref_type
                        tmp['value'] = 0
                        tmp['unit'] = this.config[item].unit || ''
                    } else {
                        tmp['value'] = 0
                    }
                    arr.push(tmp)
                }
            }
            return arr
        }
    }
}
</script>


