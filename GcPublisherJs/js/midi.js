
/**
 * Basic controll
 */

var MQTT_CLIENT = null;
var GC_GAMEPAD = null;
var EVENT_HISTORY = null;

/**
 * Reset event history
 */
function resetHistory(){
    EVENT_HISTORY = document.getElementById("event_history");
    EVENT_HISTORY.value = "";
    EVENT_HISTORY.log = [];
    EVENT_HISTORY.count = 0;
}


/**
 * default fps = 20
 * default gamepad_model = "classic"
 * default gamepad_id = 0
 */
window.onload = function () {
    const tUrlParams = new URLSearchParams(window.location.search);

    document.getElementById("mqtt_connect").value = "connect";


    resetHistory();
    // setInterval(scanDev, 1000 / tFps)

    navigator.requestMIDIAccess().then(function(midiAccess) {
       var inputs = [];
       var inputIterator = midiAccess.inputs.values();
       for (var i = inputIterator.next(); !i.done; i = inputIterator.next()) {
           inputs.push(i.value);
       }
       console.log(inputs[0].manufacturer + inputs[0].name);
       inputs[0].onmidimessage = function(e) {
           console.log(e.data[0] + " " + e.data[1] + " " + e.data[2] + " ");

           if (e.data[0] == 144){
             const tPrevHistoryCount = EVENT_HISTORY.count;

             var tEvents = [];
             // tEvents.push({"dev":"gamepad",  "msg":GC_GAMEPAD.scan()});
             // tEvents.push({"dev":"mouse",    "msg":GC_MOUSE.scan()});
             // tEvents.push({"dev":"keyboard", "msg":GC_KEYBOARD.scan()});
             tEvents.push({"dev":"keyboard", "msg": {"key":[101],"mod":0,"dur":2}});

             for (let e of tEvents){
                 if (e.msg){
                     // publish control message
                     var tMsgStr = JSON.stringify(e.msg);
                     if (MQTT_CLIENT && MQTT_CLIENT.isConnected())
                         MQTT_CLIENT.publish(e.dev, tMsgStr);
                     // store log
                     var tLog = `${++EVENT_HISTORY.count} (${e.dev}) : ${tMsgStr}\n`;
                     EVENT_HISTORY.log.push(tLog);
                 }
             }

             while (EVENT_HISTORY.log.length > 8)
                 EVENT_HISTORY.log.shift();

             if (EVENT_HISTORY.count > tPrevHistoryCount){
                 EVENT_HISTORY.value = "";
                 for (let l of EVENT_HISTORY.log)
                     EVENT_HISTORY.value += l;
             }
           }
       };
   });
}
/**
 * MQTT connection
 */
function mqttConnect(){
    var tHost = document.getElementById("mqtt_host").value;
    var tPort = document.getElementById("mqtt_port").value;

    MQTT_CLIENT = new Paho.MQTT.Client(tHost, Number(tPort), "GcPublisher");

    // connect the client
    MQTT_CLIENT.connect({
        reconnect: true,
        onSuccess: onMqttConnectSuccess,
        onFailure: onMqttConnectFailure
    });
}

/**
 * MQTT events
 */
function onMqttConnectSuccess() {
    console.info("MQTT connection success");
    var tButton = document.getElementById("mqtt_connect");
    tButton.value = "connected";
    tButton.className = "button button-black";
    tButton.onclick = null;
}
function onMqttConnectFailure() {
    console.error("MQTT connection failure");
    alert("MQTT connection failure");
}
