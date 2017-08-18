<template>
    <div>
        <el-table v-bind:data="callArray" style="width:100%">
            <el-table-column prop="name" label="召唤名称" width="180">
            </el-table-column>
            <el-table-column prop="type" label="召唤类型" width="100">
            </el-table-column>
            <el-table-column prop="addr" label="召唤起始地址" width="100">
            </el-table-column>
            <el-table-column prop="count" label="召唤数量" width="100">
            </el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    
        <el-form :inline="true">
            <el-form-item label="规则名称">
                <el-input v-model="callInfo.name" placeholder="规则名称"></el-input>
            </el-form-item>
            <el-form-item label="召唤类型">
                <el-select v-model="callInfo.type" placeholder="召唤类型">
                    <el-option v-for="item in callTypeOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="召唤起始地址">
                <el-input-number v-model="callInfo['addr']" :min="0" :max="65535"></el-input-number>
            </el-form-item>
            <el-form-item label="召唤数量">
                <el-input-number v-model="callInfo['count']" :min="0" :max="65535"></el-input-number>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onAddCall">添加</el-button>
                <el-button type="primary" @click="onModifyCall">修改</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
import {callTypeOptions} from '@/common/data'
import { deep } from '@/common/common.js'
export default {
    name: 'call',
    data() {
        return {
            callInfo:{
                name:'',
                type:'',
                addr:0,
                count:0
            },
            callTypeOptions: callTypeOptions
        }
    },
    props: {
        config: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    computed:{
        callArray:function(){
            let arr=[]
            for(let item in this.config){
                if(this.config[item]['count']!==undefined){
                    let tmpObj=deep(this.config[item])
                    tmpObj['name']=item
                    arr.push(tmpObj)
                }
            }
            return arr
        }
    },
    methods: {
        handleEdit(index, row) {
            this.modifyCallName = row.name
            this.callInfo = row
        },
        handleDelete(index, row) {
            console.log(index, row);
            delete this.config[row.name]
            this.getCallData()
        },
        handleEdit(index, row) {
            this.modifyCallName = row.name
            this.callInfo = row
        },
        onModifyCall() {
            let info = this.callInfo
            let tmp = {
                type: info.type,
                addr: info.addr,
                count: info.count
            }
            if (this.modifyCallName != this.callInfo.name) {
                delete this.config[this.modifyCallName]
            }
            this.config[info.name] = tmp
            // this.getCallData()

        },
        onAddCall() {
            let info = this.callInfo
            let tmp = {
                type: info.type,
                addr: info.addr,
                count: info.count
            }
            if (this.config[info.name] != undefined) {
                this.onModifyCall()
            } else {
                this.config[info.name] = tmp
            }
            // this.$forceUpdate();
            // this.getCallData()
        },
    }
}
</script>
<style>

</style>


