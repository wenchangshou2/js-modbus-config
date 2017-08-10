<template>
    <div id="content">
        <h1>
            modbus 配置文件编辑器
        </h1>
        <el-row>
            <el-col :span="6">
                上传配置文件:
                <input type="file" @change="previewContent">
                <br/>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                保存文件：
                <el-button @click="saveConfigFile">
                    保存配置文件
                </el-button>
            </el-col>
        </el-row>
        <el-form :inline="true" style="margin:5px;">
            <el-form-item label="MQTT 主机：">
                <el-input v-model="mqttConf.host" placeholder="mqtt server"></el-input>
            </el-form-item>
            <el-form-item label="MQTT 端口:">
                <el-input v-model="mqttConf.port" placeholder="mqtt port"></el-input>
            </el-form-item>
            <el-form-item label="">
                <el-button type="primary" @click="connectMqtt">连接</el-button>
            </el-form-item>
            <el-form-item label="">
                <el-button type="primary" @click="sendMqtt">发送</el-button>
            </el-form-item>
        </el-form>
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="通用配置" name="general">
                <el-form label-width="200px">
                    <el-form-item label="PLC读取超时时间">
                        <el-input-number v-model="general['read-timeout']" :min="100" :max="1000"></el-input-number>
                    </el-form-item>
                    <el-form-item label="PLC连接超时时间">
                        <el-input-number v-model="general['connect-timeout']" :min="100" :max="1000"></el-input-number>
                    </el-form-item>
                    <el-form-item label="mqtt主题">
                        <el-input v-model="general['auto_mqtt_topic']" style="width:60%"></el-input>
                    </el-form-item>
                    <el-form-item label="自动检查时间">
                        <el-input-number v-model="general['auto_check_delay']" :min="100" :max="1000"></el-input-number>
                    </el-form-item>
                    <el-form-item label="挂起时间">
                        <el-input-number v-model="general['timer_status']" :min="10000"></el-input-number>
                    </el-form-item>
                    <el-form-item label="设备号（slave)">
                        <el-input-number v-model="general['slave']"></el-input-number>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="saveGeneral()">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="召唤数据配置" name="call">
                <el-table :data="callArray" style="width:100%">
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
            </el-tab-pane>
            <el-tab-pane label="数据编辑" name="AI">
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
                <el-table ref="dataTable" :data="dataArray" height="450"   style="width:100%" @select="onSelectLine" @selection-change="handleSelectionChange">
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
                    <el-table-column prop="addr" label="地址" width="180">
                    </el-table-column>
                    <el-table-column prop="enable" label="是否启用" width="100">
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
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<style>

</style>

<script>
import { deep } from 'common/common.js'
import { readFileSync, writeFileSync } from 'fs'
import {mqttClient} from 'common/mqtt.js'
let ini = require('ini')
export default {
    data() {
        return {
            selectCellType: '',
            activeName: '',
            configFilePath: '',
            mqttConf: {
                host: 'localhost',
                port: 1883
            },
            general: {
                "read-timeout": 0,
                "conn-timeout": 0,
                "auto_mqtt_topic": '',
                "auth_check_delay": 0,
                "timer_status": 0
            },
            callArray: [],
            multipleSelection:[],
            config: {},
            mqtt: {},
            callInfo: {
                name: '',
                type: '',
                addr: 0,
                count: 0
            },
            dataInfo: {
                id: '',
                type: '',
                addr: '',
                unit: '',
                ref_len: '',
                ref_type: '',
                enable:false
            },
            dataArray: [],
            modifyCallName: '',
            callTypeOptions: [{
                value: 'DO',
                label: "DO"
            }, {
                value: 'DI',
                label: "DI"
            }, {
                value: 'AO',
                label: "AO"
            }, {
                value: 'AI',
                label: "AI"
            }],
            dataType: [{
                value: 'int8',
                label: 'char'
            }, {
                value: 'uint8',
                label: 'byte'
            }, {
                value: 'int16',
                label: 'short'
            }, {
                value: 'uint16',
                label: 'word'
            }, {
                value: 'int32',
                label: 'int'
            }, {
                value: 'uint32',
                label: 'uint'
            }, {
                value: 'uint64',
                label: 'uint64'
            }, {
                value: 'float',
                label: 'floatmsb'
            }, {
                value: 'floatlsb',
                label: 'floatlsb'
            }, {
                value: 'double',
                label: 'doublemsb'
            }, {
                value: 'doublelsb',
                label: 'doublelsb'
            }, {
                value: 'string',
                label: 'string'
            }, {
                value: 'buffer',
                label: 'buf'
            }]
        }
    },
    watch: {
        selectCellType(newName) {
            if (newName === "call") {
                this.getCallData()
            } else {
                this.getData(newName)
            }
            console.log('active', newName)
        }
    },
    methods: {
        sendMqtt() {
            this.mqtt.send()
        },
        connectMqtt() {
            console.log('connect mqtt',this.mqtt);
            let mqttConf=this.mqttConf
            this.mqtt = new mqttClient(mqttConf.host, mqttConf.port)
            this.mqtt.open()
            this.mqtt.on('message',(message)=>{
                console.log('message', message);
            })
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
        deleteMultiData() {
            // console.log(this.dataArray);
            // console.log(this.$refs.dataTable);
            console.log(this.multipleSelection);
            let self = this
            let multipleSelection = this.multipleSelection
            multipleSelection.forEach(function(d) {
                delete self.config[d.name]
                self.getData()
            }, this);
        },
        handleSelectionChange(val){
            this.multipleSelection=val
        },
        onAddCall() {
            let info = this.callInfo
            let tmp = {
                type: info.type,
                addr: info.addr,
                count: info.count
            }
            console.log('y', this.config[info.name]);
            if (this.config[info.name] != undefined) {
                console.log('fffffff');
                this.onModifyCall()
            } else {
                this.config[info.name] = tmp
            }
            // this.$forceUpdate();
            this.getCallData()
        },
        onSelectLine(selection,row) {
            console.log(selection,row);
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
                console.log('config',this.config);
                this.config[info.name] = tmp
            }
            // this.getCallData()
            this.getData(this.selectCellType)
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
            // if (this.modifyCallName != this.callInfo.name) {
            //     delete this.config[this.modifyCallName]
            // }
            console.log('name', info.name)
            this.config[info.name] = tmp
            console.log('change:', this.config[info.name], tmp);
            this.getData(this.selectCellType)
        },
        getData(type) {
            console.log('getdata', type);
            if (type === undefined) {
                type = this.selectCellType
            }
            let tmp = {}
            this.dataArray = []
            let select = this.selectCellType
            let config = this.config
            for (let item in config) {
                if (config[item]["id"] !== undefined && config[item].type === type) {
                    let cur = config[item]
                    tmp = {
                        name: item,
                        id: cur.id,
                        type: cur.type,
                        addr: cur.addr,
                        // ref_type: config[item].ref_type,
                        enable: cur.enable | 0
                    }
                    if (select === "AO" || select === "AI") {
                        tmp['ref_type'] = config[item].ref_type
                    }
                    console.log('tmp', tmp);
                    this.dataArray.push(tmp)
                }
            }
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
            this.getCallData()

        },
        handleDataDelete(index,row) {
            delete this.config[row.name]
            this.getData()
        },
        handleDataEdit(index, row) {
            this.dataInfo = deep(row)
            this.dataInfo.enable = row.enable === 1
            this.getData()
        },
        handleEdit(index, row) {
            console.log(index, row);
            this.modifyCallName = row.name
            this.callInfo = row
        },
        handleDelete(index, row) {
            console.log(index, row);
            delete this.config[row.name]
            this.getCallData()
        },

        getCallData() {
            this.callArray = []
            if (this.configFilePath === '') return
            for (let item in this.config) {
                if (this.config[item]['count'] !== undefined) {
                    console.log(item, this.config[item]);
                    // this.config[item]["name"] = item
                    let tmpObj = deep(this.config[item])
                    tmpObj['name'] = item
                    this.callArray.push(tmpObj)
                }
            }
        },
        saveGeneral() {
            console.log('saveGeneral');
            this.config['general'] = this.general
            this.saveConfigFile()
        },
        saveConfigFile() {
            writeFileSync(this.configFilePath, ini.stringify(this.config, ))
        },
        handleClick(e) {

        },
        parserGeneral(general) {
            this.general = general
        },
        previewContent(event) {
            var input = event.target
            if (input.files && input.files[0]) {
                this.configFilePath = input.files[0].path
                let data = readFileSync(input.files[0].path, 'utf-8').toString()
                let config = ini.parse(data)
                this.config = config
                this.parserGeneral(config['general'])
                console.log(config);
            }
        }
    }
}
</script>
