/**
 * Scanner module for classic gamepad (16buttons)
 */
var GC_GAMEPAD_classic = {};

GC_GAMEPAD_classic.id = null;

GC_GAMEPAD_classic.enableDev = false;
GC_GAMEPAD_classic.enableAng = false;

GC_GAMEPAD_classic.init = function(aEnableDev, aEnableAng){
    GC_GAMEPAD_classic.enableDev = aEnableDev;
    GC_GAMEPAD_classic.enableAng = aEnableDev && aEnableAng;
    
    GC_GAMEPAD_classic.stateStr = "";
}

GC_GAMEPAD_classic.scan = function(){
    var tDev = navigator.getGamepads()[GC_GAMEPAD_classic.dev];
    if (!GC_GAMEPAD_classic.enableDev || (tDev == null))
        return null;
    
    // scan dpad
    const tLF = tDev.buttons[14].pressed;
    const tRT = tDev.buttons[15].pressed;
    const tUP = tDev.buttons[12].pressed;
    const tDW = tDev.buttons[13].pressed;
    var tRawDpad = (tLF<<3) | (tDW<<2) | (tRT<<1) | (tUP<<0);
    tNewDpad = GC_GAMEPAD_classic.to9dir[tRawDpad];

    // scan buttons
    var tNewBtn = 0x000;
    for (var i=0; i< Math.min(12, tDev.buttons.length); i++)
        tNewBtn += (tDev.buttons[i].pressed | 0) << i;
        
    // scan analog (no analog sticks)
    var tNewAng = [0, 0, 0, 0]

    const tNewState = {
        "dpad" : tNewDpad,
        "btn" : tNewBtn,
        "ang" : tNewAng,
        "dur" : -1
    };
    const tNewStateStr = JSON.stringify(tNewState);
    if (GC_GAMEPAD_classic.stateStr !== tNewStateStr){
        GC_GAMEPAD_classic.stateStr = tNewStateStr;
        return tNewState;
    } else
        return null;
}

GC_GAMEPAD_classic.to9dir = [
    5, // 0x0
    8, // 0x1
    6, // 0x2
    9, // 0x3
    2, // 0x4
    5, // 0x5
    3, // 0x6
    5, // 0x7
    4, // 0x8
    7, // 0x9
    5, // 0xA
    5, // 0xB
    1, // 0xC
    5, // 0xD
    5, // 0xE
    5  // 0xF
];
