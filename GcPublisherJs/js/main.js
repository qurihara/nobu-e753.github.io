
/**
 * Basic controll
 */

var MQTT_CLIENT = null;
var GC_GAMEPAD = null;
var EVENT_HISTORY = null;
/**
 * Reload scan taget devices
 */
function resetDev(){
    const tEnableMouse = document.getElementById("dev_mouse").checked == true;
    const tEnableGamepad = document.getElementById("dev_gamepad").checked == true;
    const tEnableKeyboard = document.getElementById("dev_keyboard").checked == true;

    const tEnableMovescan = document.getElementById("dev_moveless").checked == false;

    GC_GAMEPAD.init(tEnableGamepad, tEnableMovescan);
    GC_MOUSE.init(tEnableMouse, tEnableMovescan);
    GC_KEYBOARD.init(tEnableKeyboard);
}

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
 * Main scan loop
 * 
 *  - max event history length = 8;
 */
function scanDev(){
    const tPrevHistoryCount = EVENT_HISTORY.count;

    var tEvents = [];
    tEvents.push({"dev":"gamepad",  "msg":GC_GAMEPAD.scan()});
    tEvents.push({"dev":"mouse",    "msg":GC_MOUSE.scan()});
    tEvents.push({"dev":"keyboard", "msg":GC_KEYBOARD.scan()});

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

/**
 * default fps = 20
 * default gamepad_model = "classic"
 * default gamepad_id = 0
 */
window.onload = function () {
    const tUrlParams = new URLSearchParams(window.location.search);
    const tFps = (tUrlParams.has('fps')) ? tUrlParams.get('fps') : 20;
    const tGamepadModel = (tUrlParams.has('gamepad_model')) ? tUrlParams.get('gamepad_model') : "simple";
    const tGamepadId = (tUrlParams.has('gamepad_id')) ? tUrlParams.get('gamepad_id') : 0;

    console.info("set scan FPS = %d", tFps);
    console.info("set target gamepad = %s", tGamepadModel);

    switch (tGamepadModel){
        case "simple":
            GC_GAMEPAD = GC_GAMEPAD_simple;
            break;
        case "classic":
            GC_GAMEPAD = GC_GAMEPAD_classic;
            break;
        case "psx":
            GC_GAMEPAD = GC_GAMEPAD_psx;
            break;
        case "xbox":
            GC_GAMEPAD = GC_GAMEPAD_xbox;
            break;
        case "custom":
            GC_GAMEPAD = GC_GAMEPAD_custom;
            break;
        default:
            console.error("Unknown gamepad model : %s", tGamepadModel);
            break;
    }
    GC_GAMEPAD.dev = tGamepadId;

    document.getElementById("mqtt_connect").value = "connect";
    
    window.addEventListener("gamepadconnected", onGamepadConnected);
    window.addEventListener("gamepaddisconnected", onGamepadDisconnected);

    resetDev();
    resetHistory();
    setInterval(scanDev, 1000 / tFps)
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

/**
 * Gamepad events
 */
function onGamepadConnected(e) {
    console.info("gamepad connected(%d) :  %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
};
function onGamepadDisconnected(e){
    console.info("gamepad disconnected : %s",
        e.gamepad.id);
    GC_GAMEPAD.dev = null;
};
