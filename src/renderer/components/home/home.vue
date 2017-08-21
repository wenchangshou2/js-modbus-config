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
    
                <call v-bind:config="config" v-bind:change="WriteData" ></call>
    
            </el-tab-pane>
            <el-tab-pane label="数据编辑" name="data">
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
import { mapMutations } from 'vuex'
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
            // if (newName === "call") {
            //     // this.getCallData()
            // } else {
            //     this.getData(newName)
            // }
            console.log('active', newName)
        },
        activeName(newPage) {
            this.setPage(newPage)
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
        WriteData(){
            console.log('write',data);
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
        onData(message) {
            console.log('message',message);
            let now = new Date()

            this.mqttLastUpdate = now
            this.setPlc(message)
        },
        onSelectLine(selection, row) {
            console.log(selection, row);
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
        ...mapMutations ({
            setPage:'SET_ACTIVE_PAGE',
            setPlc:'SET_PLC_DATA'
        }),
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
