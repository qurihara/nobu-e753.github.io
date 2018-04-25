/**
 * Scanner module for XBox
 */
var GC_GAMEPAD_xbox = {};

GC_GAMEPAD_xbox.dev = null;

GC_GAMEPAD_xbox.enableDev = false;
GC_GAMEPAD_xbox.enableAng = false;

GC_GAMEPAD_xbox.init = function(aEnableDev, aEnableAng){
    GC_GAMEPAD_xbox.enableDev = aEnableDev;
    GC_GAMEPAD_xbox.enableAng = aEnableDev && aEnableAng;
    
    GC_GAMEPAD_xbox.stateStr = "";
}

GC_GAMEPAD_xbox.scan = function(){
    return null;
}