var mqtt = require('mqtt')
var events = require('events')
export class mqttClient {
    _t="wen"
    constructor(host,port) {
        this.host=host
        this.port
        mqttClient.sefl = this
        events.EventEmitter.call(this)
    }
    open(){
        mqttClient.client = mqtt.connect({ host: this.host, port: parseInt(this.port) })
        this.onConnect.bind(this)
        // var _this = this
        this.onConnect=this.onConnect.bind(this)
        mqttClient.client.on('connect', this.onConnect)
        mqttClient.client.on('message',this.onMessage)
        // this.onConnect.bind(this)
    }
    send() {
        let client = mqttClient.client
        client.publish('test','send')
    }
    onMessage(topic,message) {
        console.log(topic,message.toString());
    }
    onConnect(){
        console.log('this', this._t);
        this.emit('message','wenchangshou')
        // let self = mqttClient.self
        // console.log(self);
        // console.log(self.send());
        mqttClient.client.subscribe('test')
        mqttClient.client.publish('test','wenchangshou')
    }
    getConnectStatus() {

    }
}