function play_pointer(data) {
    var frame = 1;
    var x = document.body.offsetWidth * (+data.x) / 100.;
    var y = document.body.offsetHeight * (+data.y) / 100.;
    var half_dimension = 5;

    var elt = document.createElement("div");
    elt.style.diplay = "block";
    elt.style.position = "absolute";
    elt.style.backgroundColor = "#ffffff";
    elt.style.borderRadius = "50%";
    elt.style.zIndex = 999;
    document.body.appendChild(elt);

    function update(elt, frame) {
        var frame_dimension = (1. + (frame -1) / 5.) * half_dimension;
        elt.style.opacity = 1 / Math.sqrt(frame);
        elt.style.left = (x - frame_dimension) + "px";
        elt.style.top = (y - frame_dimension) + "px";
        elt.style.height = (2 * frame_dimension) + "px";
        elt.style.width = (2 * frame_dimension) + "px";
    }
    update(elt, frame);

    function iter() {
        if (++frame >= 20) {
            document.body.removeChild(elt);
            return;
        }
        update(elt, frame);
        setTimeout(iter, 50);
    }

    setTimeout(iter, 50);
}

function play_arrow(arrow) {
    switch (arrow) {
        case "left":
            Reveal.right();
            break;
        case "right":
            Reveal.left();
            break;
        case "up":
            Reveal.down();
            break;
        case "down":
            Reveal.up();
            break;
    }
}

var socket = io.connect("http://localhost:8080/");
socket.on('command', function(raw) {
    console.log("Received command " + raw);
    var command = JSON.parse(raw);
    switch (command.type) {
        case "pointer":
            play_pointer(command.data);
            break;
        case "arrow":
            play_arrow(command.data.direction);
            break;
    }
});
