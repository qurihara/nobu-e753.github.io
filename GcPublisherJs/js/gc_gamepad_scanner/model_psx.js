/**
 * Scanner module for PSX (Dualshock2 + Converter)
 */
var GC_GAMEPAD_psx = {};

GC_GAMEPAD_psx.dev = null;

GC_GAMEPAD_psx.enableDev = false;
GC_GAMEPAD_psx.enableAng = false;

GC_GAMEPAD_psx.init = function(aEnableDev, aEnableAng){
    GC_GAMEPAD_psx.enableDev = aEnableDev;
    GC_GAMEPAD_psx.enableAng = aEnableDev && aEnableAng;
    
    GC_GAMEPAD_psx.stateStr = "";
}


GC_GAMEPAD_psx.scan = function(){

    if (!GC_GAMEPAD_psx.enableDev || (GC_GAMEPAD_psx.dev == null))
        return null;
    var tDev = GC_GAMEPAD_psx.dev;

    // scan dpad
    const tLF = (tDev.axes[4] < -0.5) ? 1:0;
    const tRT = (tDev.axes[4] >  0.5) ? 1:0;
    const tUP = (tDev.axes[5] < -0.5) ? 1:0;
    const tDW = (tDev.axes[5] >  0.5) ? 1:0;
    var tRawDpad = (tLF<<3) | (tDW<<2) | (tRT<<1) | (tUP<<0);
    tNewDpad = GC_GAMEPAD_psx.to9dir[tRawDpad];

    // scan buttons
    var tNewBtn = 0x000;
    for (var i=0; i< Math.min(12, tDev.buttons.length); i++)
        tNewBtn += (tDev.buttons[i].pressed | 0) << i;
        
    // scan analog (no analog sticks)
    var tNewAng = [0,0,0,0];
    tNewAng[0] = GC_GAMEPAD_psx.to8bit(tDev.axes[0]);
    tNewAng[1] = GC_GAMEPAD_psx.to8bit(tDev.axes[1]);
    tNewAng[2] = GC_GAMEPAD_psx.to8bit(tDev.axes[2]);
    tNewAng[3] = GC_GAMEPAD_psx.to8bit(tDev.axes[3]);
    
    const tNewState = {
        "dpad" : tNewDpad,
        "btn" : tNewBtn,
        "ang" : tNewAng,
        "dur" : -1
    };
    const tNewStateStr = JSON.stringify(tNewState);
    if (GC_GAMEPAD_psx.stateStr !== tNewStateStr){
        GC_GAMEPAD_psx.stateStr = tNewStateStr;
        return tNewState;
    } else
        return null;
}

GC_GAMEPAD_psx.to9dir = [
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

GC_GAMEPAD_psx.to8bit = function(v){
    return (v * 127) | 0;
}
