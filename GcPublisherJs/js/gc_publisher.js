
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
 *  - max event history length = 7;
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
 */
window.onload = function () {
    const tUrlParams = new URLSearchParams(window.location.search);
    const tFps = (tUrlParams.has('fps')) ? tUrlParams.get('fps') : 20;
    const tGamepadModelName = (tUrlParams.has('gamepad')) ? tUrlParams.get('gamepad') : "classic";

    console.info("set scan FPS = %d", tFps);
    console.info("set target gamepad = %s", tGamepadModelName);

    switch (tGamepadModelName){
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
            console.error("Unknown gamepad model : %s", tGamepadModelName);
            break;
    }

    document.getElementById("mqtt_connect").value = "connect";
    
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
window.addEventListener("gamepadconnected", function(e){
    console.info("gamepad connected : %s. %d buttons, %d axes.",
        e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
    GC_GAMEPAD.dev = e.gamepad;
});

window.addEventListener("gamepaddisconnected", function(e){
    console.info("gamepad disconnected : %s",
        e.gamepad.id);
    GC_GAMEPAD.dev = null;
});