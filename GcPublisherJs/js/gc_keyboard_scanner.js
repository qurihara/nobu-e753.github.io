/**
 * Keyboard scanner 
 *  - key : Set[Int] (ascii code) 
 *  - mod : Int (3bit: Ctrl/Shift/Alt) 
 */
var GC_KEYBOARD = {};

GC_KEYBOARD.key = new Set([]);
GC_KEYBOARD.mod = 0x0;
GC_KEYBOARD.event = false;

GC_KEYBOARD.handleKeyDown = function(e) {
    const tAsciiCode = GC_KEYBOARD.toAscii[e.code];
    if (!!tAsciiCode){
        GC_KEYBOARD.key.add(tAsciiCode);
        GC_KEYBOARD.mod = (e.ctrlKey<<0) | (e.shiftKey<<1) | (e.altKey<<2);
        GC_KEYBOARD.event |= true;
    }
    e.preventDefault();
}
GC_KEYBOARD.handleKeyUp = function(e) {
    const tAsciiCode = GC_KEYBOARD.toAscii[e.code];
    if (!!tAsciiCode)
        GC_KEYBOARD.key.delete(tAsciiCode);
}

GC_KEYBOARD.init = function(enable_keyboard) {
    window.removeEventListener("keydown", GC_KEYBOARD.handleKeyDown);
    window.removeEventListener("keyup", GC_KEYBOARD.handleKeyUp);
    GC_KEYBOARD.key.clear();
    GC_KEYBOARD.mode = 0x0;    
    GC_KEYBOARD.event = false;

    if (enable_keyboard) {
        window.addEventListener("keydown", GC_KEYBOARD.handleKeyDown);
        window.addEventListener("keyup", GC_KEYBOARD.handleKeyUp);
    }
}

GC_KEYBOARD.scan = function(){
    if (GC_KEYBOARD.event && GC_KEYBOARD.key.size > 0) {
        const tNewState = {
            "key": Array.from(GC_KEYBOARD.key),
            "mod": GC_KEYBOARD.mod,
            "dur": 2    // defalt press duration = 2frame
        };
        GC_KEYBOARD.event = false;
        return tNewState;
    } else
        return null;
}

GC_KEYBOARD.toAscii = {
    "KeyA": 0x61,
    "KeyB": 0x62,
    "KeyC": 0x63,
    "KeyD": 0x64,
    "KeyE": 0x65,
    "KeyF": 0x66,
    "KeyG": 0x67,
    "KeyH": 0x68,
    "KeyI": 0x69,
    "KeyJ": 0x6A,
    "KeyK": 0x6B,
    "KeyL": 0x6C,
    "KeyM": 0x6D,
    "KeyN": 0x6E,
    "KeyO": 0x6F,
    "KeyP": 0x70,
    "KeyQ": 0x71,
    "KeyR": 0x72,
    "KeyS": 0x73,
    "KeyT": 0x74,
    "KeyU": 0x75,
    "KeyV": 0x76,
    "KeyW": 0x77,
    "KeyX": 0x78,
    "KeyY": 0x79,
    "KeyZ": 0x7A,
    "Digit0":       0x30,
    "Digit1":       0x31,
    "Digit2":       0x32,
    "Digit3":       0x33,
    "Digit4":       0x34,
    "Digit5":       0x35,
    "Digit6":       0x36,
    "Digit7":       0x37,
    "Digit8":       0x38,
    "Digit9":       0x39,
    "Backspace":    0x08,
    "Tab":          0x09,
    "Enter":        0x0A,
    "Escape":       0x1B,
    "Space":        0x20,
    "Delete":       0x7F
}
