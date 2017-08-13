var mqtt = require('mqtt')
const EventEmitter = require('events');
var emitter = new EventEmitter();
export class mqttClient extends EventEmitter{

    constructor(host,port,topic) {
        super()
        this.host=host
        this.port=port
        this.topic=topic
        // mqttClient.sefl = this
    };
    open(){
        if(mqttClient.client!=undefined &&mqttClient.client.connected){
            // alert('已经连接')
            console.log('已经连接');
            return
        }
        mqttClient.client = mqtt.connect({ host: this.host, port: parseInt(this.port) })
        this.onConnect.bind(this)
        // var _this = this
        this.onConnect=this.onConnect.bind(this)
        this.onClose=this.onClose.bind(this)
        this.onMessage = this.onMessage.bind(this)
        mqttClient.client.on('connect', this.onConnect)
        mqttClient.client.on('message',this.onMessage)
        mqttClient.client.on('close',this.onClose)
        // this.onConnect.bind(this)
    }
    send() {
        let client = mqttClient.client
        client.publish('test','send')
    }
    onMessage(topic,message) {
        let obj = JSON.parse(message.toString())
        // console.log('obj',obj)
        this.emit('data', obj)
    }
    onConnect(){
        mqttClient.client.subscribe(this.topic)
        this.connect = true
    }
    onClose() {
        this.connect = false
    }
    getConnectStatus() {

    }
}