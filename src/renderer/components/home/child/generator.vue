<template>
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
            <el-button type="primary" @click="saveGeneral">提交</el-button>
        </el-form-item>
    </el-form>
</template>
<style>

</style>
<script>
export default {
    name: 'generator',
    props:{
        general:{
            default:function() {
                return {
                    "read-timeout": 0,
                    "conn-timeout": 0,
                    "auto_mqtt_topic": '',
                    "auth_check_delay": 0,
                    "timer_status": 0
                }
            },
            type: Object
        }
    },
    methods: {
        saveGeneral() {
            this.$emit('saveGeneral')
        }
    }
}
</script>