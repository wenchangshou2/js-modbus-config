<template>
    <div>
        <el-row style="padding-bottom:20px;width:80%">
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
            <el-table-column prop="unit" label="单位" width="100">
            </el-table-column>
            <el-table-column prop="ref_type" label="数据类型" width="100" v-if="selectCellType==='AI'||selectCellType==='AO'">
    
            </el-table-column>
            <el-table-column prop="addr" label="地址" width="100">
            </el-table-column>
            <el-table-column prop="naddr" label="逻辑地址" width="100">
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
                    <el-button size="small" @click="changeData(scope.$index,scope.row)">改变</el-button>
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
            <el-form-item label="逻辑地址">
                <el-input v-model="dataInfo.naddr" placeholder="逻辑地址"></el-input>
            </el-form-item>
            <el-form-item label="数据类型" v-if="selectCellType==='AI'||selectCellType==='AO'">
                <el-select v-model="dataInfo.ref_type">
                    <el-option v-for="item in dataType" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="单位" v-if="selectCellType=='AI'||selectCellType=='AO'">
                <el-input v-model="dataInfo.unit" placeholder="单位"></el-input>
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
import {mapState} from 'vuex'
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
                naddr:'',
                enable: false
            },
            dataArray: [],
            dataType: dataType
        }
    },
    methods: {
        changeData(index,row){
            let self = this
            this.$prompt(
                '请输入需要写入的值', '写入', {
                    confirmButtonText:'写入',
                    cancelButtonText:'取消'
                }
            ).then(({value})=>{
                console.log(self.selectCellType, row,value);
                let tmp = {
                    addr: row.addr,
                    type: self.selectCellType,
                    value: value
                }
                console.log('emit');
                self.$emit('change')
            }).catch(()=>{

            })

            console.log(index,row);
        },
        handleDataEdit(index, row) {
            this.dataInfo = deep(row)
            this.dataInfo.enable = row.enable === 1
        },
        onChangeEnable(index, row) {
            // this.dataArray[index] = row
            this.config[row.name].enable = row.enable
        },
        handleSelectionChange(val) {
            this.multipleSelection = val
        },
        handleDataDelete(index, row) {
            delete this.config[row.name]
            this.getArrayData()
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
            this.getArrayData()
        },
        deleteMultiData() {
            // console.log(this.dataArray);
            // console.log(this.$refs.dataTable);
            console.log(this.multipleSelection);
            let self = this
            let multipleSelection = this.multipleSelection
            multipleSelection.forEach(function (d) {
                delete self.config[d.name]
            }, this);
            this.getArrayData()
        },
        getArrayData(){
            let tmp = {}
            let arr = []
            this.dataArray=null
            let select = this.selectCellType
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
                    tmp['naddr']=this.config[item].naddr||''
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
            this.dataArray = arr
        },
        _changeValue(id, value) {
            // console.log('change', id, value);
            let arr = this.dataArray
            for (let index in arr) {
                // console.log(arr[index].id, id);
                if (arr[index].id === id) {
                    console.log('change');
                    arr[index]['value'] = value
                }
            }
        },
    },
    props: {
        config: {
            type: Object
        }
    },
    watch:{
        config(value){
            console.log('change');
            setTimeout(this.$forceUpdate,200)
            // this.$forceUpdate()
        },
        activePage(newPage){
            if(newPage==='data'){
                this.getArrayData()

            }
        },
        selectCellType(v){
            console.log('vv',v);
            this.getArrayData()
        },
        plcData(data){
            console.log('plc data',data);
            console.log('data',this.dataArray);
            let arr = this.dataArray

            let selectItem = this.selectCellType
            if (selectItem === 'AI' || selectItem === 'AO') {
                if(data[selectItem]==undefined){
                    return
                }
                let ids = data[selectItem].ids
                for (let index in ids) {
                    console.log('ids',ids[index]);
                    this._changeValue(index, ids[index].output.v)
                }
            } else if (selectItem === 'DO' || selectItem === 'DI') {
                let ids = data[selectItem].ids
                for (let index in ids) {
                    console.log(ids[index].output);
                    this._changeValue(index, ids[index].output.v)
                }
            }
        }
    },
    computed: {
        ...mapState([
            'activePage',
            'plcData'
        ])
    }
}
</script>


