/**
 * Mouse scanner 
 *  - Buttons
 *    - left   : 0x01
 *    - right  : 0x02
 *    - middle : 0x04
 *  - Move (delta position)
 *    - x : mov[0]
 *    - y : mov[1] (flipped)
 */
var GC_MOUSE = {};

GC_MOUSE.btn = [0, 0, 0];
GC_MOUSE.mov = [0, 0];
GC_MOUSE.event = false;

GC_MOUSE.handleMouseDown = function(e) {
    GC_MOUSE.btn[e.button] = 1;
    GC_MOUSE.event |= true;
}
GC_MOUSE.handleMouseUp = function(e) {
    GC_MOUSE.btn[e.button] = 0;
    GC_MOUSE.event |= true;
}
GC_MOUSE.handleMouseMove = function(e){
    const dx = e.movementX;
    const dy = e.movementY;
    GC_MOUSE.mov[0] += dx;
    GC_MOUSE.mov[1] -= dy;
    GC_MOUSE.event |= true;
}

GC_MOUSE.init = function(enable_mouse, enable_mov) {
    window.removeEventListener("mousedown", GC_MOUSE.handleMouseDown);
    window.removeEventListener("mouseup", GC_MOUSE.handleMouseUp);
    window.removeEventListener("mousemove", GC_MOUSE.handleMouseMove);
    GC_MOUSE.btn = [0, 0, 0];
    GC_MOUSE.mov = [0, 0];
    GC_MOUSE.event = false;

    if (enable_mouse) {
        window.addEventListener("mousedown", GC_MOUSE.handleMouseDown);
        window.addEventListener("mouseup", GC_MOUSE.handleMouseUp);
    }
    if (enable_mouse && enable_mov) {
        window.addEventListener("mousemove", GC_MOUSE.handleMouseMove);
    }
}

GC_MOUSE.scan = function(){
    if (GC_MOUSE.event) {
        const tNewBtn = GC_MOUSE.btn[0] + (GC_MOUSE.btn[1] << 1) + (GC_MOUSE.btn[2] << 2);
        const tNewMov = GC_MOUSE.mov;
        const tNewState = {
            "btn": tNewBtn,
            "mov": tNewMov,
            "dur": -1
        };
        GC_MOUSE.event = false;
        GC_MOUSE.mov = [0, 0];
        return tNewState;
    } else
        return null;
}
