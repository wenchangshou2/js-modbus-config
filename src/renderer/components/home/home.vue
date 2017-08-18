<template>
    <div id="content">
        <h1>
            modbus 配置文件编辑器
        </h1>
        <el-form :inline="true" style="margin:5px;">
            <el-form-item label="上传文件配置">
                <input type="file" @change="previewContent" style="width:170px">
            </el-form-item>
            <el-form-item label="保存配置">
                <el-button @click="saveConfigFile">
                    保存
                </el-button>
    
            </el-form-item>
        </el-form>
        <el-form :inline="true" style="margin:5px;">
            <el-form-item label="MQTT 主机：">
                <el-input v-model="mqttConf.host" placeholder="mqtt server"></el-input>
            </el-form-item>
            <el-form-item label="MQTT 端口:">
                <el-input v-model="mqttConf.port" placeholder="mqtt port"></el-input>
            </el-form-item>
            <el-form-item label="MQTT 主题:">
                <el-input v-model="mqttConf.topic" placeholder="mqtt topic"></el-input>
            </el-form-item>
            <el-form-item label="">
                <el-button type="primary" @click="connectMqtt">连接</el-button>
            </el-form-item>
            <el-form-item label="">
                <el-button type="primary" @click="sendMqtt">发送</el-button>
            </el-form-item>
            <el-form-item label="最后更新时间">
                {{mqttLastUpdate}}
            </el-form-item>
        </el-form>
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="通用配置" name="general">
                <generator @saveGeneral="saveGeneral" v-bind:general="general"></generator>
            </el-tab-pane>
            <el-tab-pane label="召唤数据配置" name="call">
    
                <call v-bind:config="config" ></call>
    
            </el-tab-pane>
            <el-tab-pane label="数据编辑" name="AI">
                <config-data v-bind:config="config"></config-data>
            </el-tab-pane>
            <el-tab-pane label="MQTT配置" name="mqtt">
                <el-form>
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
import { mqttClient } from 'common/mqtt.js'
import { generator, call,configData } from './child'
import {callTypeOptions} from '@/common/data'
let generaltor
let ini = require('ini')
let YAML = require('yamljs');
export default {
    data() {
        return {
            selectCellType: '',
            activeName: '',
            configFilePath: '',
            mqttLastUpdate: '',
            callTypeOptions: callTypeOptions,
            mqttConf: {
                host: 'localhost',
                port: 1883,
                topic: '/app/plc/auto-status'
            },
            general: {
                "read-timeout": 0,
                "conn-timeout": 0,
                "auto_mqtt_topic": '',
                "auth_check_delay": 0,
                "timer_status": 0
            },
            callArray: [],
            multipleSelection: [],
            config: {},
            mqtt: {},
            dataInfo: {
            },
            dataArray: [],
            modifyCallName: '',
        }
    },
    watch: {
        selectCellType(newName) {
            if (newName === "call") {
                // this.getCallData()
            } else {
                this.getData(newName)
            }
            console.log('active', newName)
        },
        activeName(newPage) {
            // console.log('newpage', newPage);
            // if (newPage === 'call') {
            //     this.getCallData()
            // }
        }
    },
    created() {
        this.mqttLastUpdate = '未更新'
    },
    components: {
        generator,
        call,
        configData
    },
    methods: {
        sendMqtt() {
            this.mqtt.send()
        },
        onChangeEnable(index, row) {
            // this.dataArray[index] = row
            console.log('row', row);
            console.log(this.config);
            this.config[row.name].enable = row.enable
        },
        connectMqtt() {
            console.log('connect mqtt', this.mqtt);
            let mqttConf = this.mqttConf
            this.mqtt = new mqttClient(mqttConf.host, mqttConf.port, mqttConf.topic)
            this.mqtt.open()
            this.mqtt.on('data', this.onData)
            // this.mqtt.on('event',function(message){
            //     console.log('fffffff');
            // })
            this.mqtt.on('data', this.onData)
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
        onData(message) {
            let now = new Date()
            this.mqttLastUpdate = now
            let selectItem = this.selectCellType
            console.log(now);
            if (selectItem === 'AI' || selectItem === 'AO') {
                let ids = message[selectItem].ids
                for (let index in ids) {
                    this._changeValue(index, ids[index].outputs.v)
                }
            } else if (selectItem === 'DO' || selectItem === 'DI') {
                console.log(message);
                let ids = message[selectItem].ids
                for (let index in ids) {
                    console.log(ids[index].output);
                    this._changeValue(index, ids[index].output.v)
                }
            }
        },
        onSelectLine(selection, row) {
            console.log(selection, row);
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
                    console.log(cur);
                    tmp = {
                        name: item,
                        id: cur.id,
                        type: cur.type,
                        addr: cur.addr,
                        // ref_type: config[item].ref_type,
                        enable: cur.enable === 1
                    }
                    if (select === "AO" || select === "AI") {
                        tmp['ref_type'] = config[item].ref_type
                        tmp['value'] = 0
                        tmp['unit'] = config[item].unit || ''
                        console.log(config[item]);
                    } else {
                        tmp['value'] = 0
                    }
                    console.log('tmp', tmp);
                    this.dataArray.push(tmp)
                }
            }
        },
        handleDataDelete(index, row) {
            delete this.config[row.name]
            this.getData()
        },
        handleDataEdit(index, row) {
            this.dataInfo = deep(row)
            this.dataInfo.enable = row.enable === 1
            this.getData()
        },
        saveGeneral() {
            console.log('saveGeneral');
            this.config['general'] = this.general
            this.saveConfigFile()
        },
        saveConfigFile() {
            let configPath = this.configFilePath
            if (configPath.indexOf('yaml') >= 0) {
                writeFileSync(this.configFilePath, YAML.stringify(this.config))

            } else {
                writeFileSync(this.configFilePath, ini.stringify(this.config))
            }
        },
        handleClick(e) {

        },
        parserGeneral(general) {
            console.log('general', general);
            this.general = general
        },
        previewContent(event) {
            var input = event.target
            if (input.files && input.files[0]) {
                let config
                let fileName = input.files[0].name
                this.configFilePath = input.files[0].path
                let data = readFileSync(input.files[0].path, 'utf-8').toString()
                if (fileName.indexOf('yaml') >= 0) {
                    config = YAML.parse(data)
                } else if (fileName.indexOf('ini') >= 0) {
                    config = ini.parse(data)
                }
                console.log(config);
                this.config = config
                this.parserGeneral(config['general'])
            }
        }
    }
}
</script>
