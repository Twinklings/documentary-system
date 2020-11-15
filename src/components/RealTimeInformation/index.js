import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {notification} from 'antd'
import { getCookie } from '../../utils/support';

let dataList = [];
let intervalDuration = 5000;
let timer = null;
let heartHandler = null;
let oncloseTimer = null;
let notifyKey = [] ;//'update-notify'
let dataParamCode = 200;

class RealTimeInformation extends Component {
  static propTypes = {
    
  };

  constructor(props) {
    super(props);
    this.state = {
      type: props.defaultActiveKey,
      tabs: [],
      active: {},
    };
  }

    componentDidMount(){
        var is_support = ("WebSocket" in window);
        if (is_support) {
            if(getCookie('userName')){
                this.initWebSocket();
            }
        }else{
            console.log("您的浏览器不支持 WebSocket!")
        }
    } 

    componentWillUnmount(){
        console.log("关闭链接")
        clearInterval(heartHandler);
        clearInterval(oncloseTimer);
        oncloseTimer = null;
        heartHandler = null;
        timer = null;
        dataList = [];
        intervalDuration = 5000;
        window.layoutSocket && window.layoutSocket.close();
    }

    initWebSocket = () => {
        
        window.layoutSocket = new WebSocket(`ws://121.40.58.47:9060/imserver/${getCookie('tenantId')}/${getCookie('userName')}`);

        // 链接成功
        window.layoutSocket.onopen = function () {
            
            console.log('websocket was connected');
            clearInterval(oncloseTimer);
            oncloseTimer = null;
            heartHandler = setInterval(() => {
                window.layoutSocket.send({"HeartBeat":1})
            }, 60000)
        }
        //连接发生错误
        window.layoutSocket.onerror = function() {
            console.log("WebSocket连接发生错误");
        };
        //连接关闭
        window.layoutSocket.onclose = function() {
            console.log("WebSocket连接关闭");
        }
        
        window.layoutSocket.addEventListener("message", (event) => {
            
            let dataParam = JSON.parse(event.data);
            console.log(dataParam,"event");

            if(dataParam.code === 200){
                dataParamCode = 200;
                dataList.push(event.data);
                console.log(!timer,"!timer!timer!timer!timer")
                if(!timer){
                    timer = true;
                    // 获取第一次音频时长
                    let _data = dataList[0];
                    const url = "http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&text=" + encodeURI(JSON.parse(_data).data);      
                    const audio = new Audio(url);
                    audio.src = url;
                    audio.load();
                    audio.oncanplay = () => {  
                        // 获取音频时长
                        // console.log("获取第一次音频时长",audio.duration*1000);
                        intervalDuration = audio.duration*1000+1000;
                        this.outputInformation();
                    }
                }
            }else if(dataParam.code === 401){
                dataParamCode = 401;
                // 断开链接
                clearInterval(heartHandler);
                clearTimeout(timer);
                heartHandler = null;
                timer = null;
                dataList = [];
                intervalDuration = 5000;
                window.layoutSocket && window.layoutSocket.close();
                // window.layoutSocket && window.layoutSocket.close();
            }
        });

        window.layoutSocket.onclose =  (e) => {
            console.log("ws close", e);
            clearTimeout(timer);
            clearInterval(heartHandler);
            timer = null;
            heartHandler = null;
            // 断链重连
            // this.initWebSocket();
            if(!oncloseTimer && dataParamCode != 401){
                oncloseTimer = setInterval(()=>{
                    if(!heartHandler){
                        console.log("重新链接------")
                        if(getCookie('userName')){
                            this.initWebSocket()
                        }else{
                            clearInterval(oncloseTimer);
                            oncloseTimer = null;
                        }
                    }
                },8000)
            }
        }

    }

    outputInformation = () => {
        timer = setTimeout(() => {
            // console.log("定时器响应",intervalDuration);
            let _data = dataList[0];
            // 播放类型 0文字  1语音
            // console.log(JSON.parse(_data).type,JSON.parse(_data).type === 0,"播放类型")
            if(JSON.parse(_data).type === 0){
                intervalDuration = 10000;
                this.openNotification(JSON.parse(_data),10000);
            }else{
                const url = "http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&text=" + encodeURI(JSON.parse(_data).data);      
                const audio = new Audio(url);
                audio.src = url;
                audio.load();
                audio.oncanplay = () => {  
                    // 获取音频时长
                    // console.log("myVid.duration",audio.duration*1000);
                    intervalDuration = audio.duration*1000+1000;
                    this.openNotification(JSON.parse(_data),audio.duration*1000+1000);
                    audio.play();
                }
            }
            dataList.shift();
                
            if(dataList.length <= 0){
                clearTimeout(timer);
                timer = null;
            }
        }, intervalDuration);
        
    }

    openNotification = (data,time) => {
        notifyKey.push(data.id);
        notification.open({
          message: '新消息',
          description: data.data,
          duration: null,
          key:data.id,
          onClose:()=>{
            if(dataList.length > 0){
                notifyKey.forEach((item, i) => {
                    if (item == data.id) {
                        notifyKey.splice(i, 1); // 从下标 i 开始, 删除 1 个元素
                    }
                })
                window.layoutSocket.send(JSON.stringify({"id":data.id,"pushType":data.type}));
                this.outputInformation();
            }
          }
        });
        if(notifyKey.length < 3){
            this.outputInformation();
        }
    };


  render() {
    
    return (
      <></>
    );
  }
}

export default RealTimeInformation;