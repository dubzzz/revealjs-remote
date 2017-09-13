var socket = io.connect(window.location.protocol + '//' + window.location.host);
socket.emit('register', 'display-screenshots');

var mc = new Hammer(document.body);
mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

function send_command(type, data) {
    socket.emit('command', JSON.stringify({type: type, data: data}));
}

mc.on('press', function(e) {
    var x = 100.0 * e.center.x / document.body.offsetWidth;
    var y = 100.0 * e.center.y / document.body.offsetHeight;
    send_command("pointer", {x: x, y: y});
});
mc.on('swipeleft', function() {
    send_command("arrow", {direction: "left"});
});
mc.on('swiperight', function() {
    send_command("arrow", {direction: "right"});
});
mc.on('swipeup', function() {
    send_command("arrow", {direction: "up"});
});
mc.on('swipedown', function() {
    send_command("arrow", {direction: "down"});
});

document.getElementById("button_prev").addEventListener("click", function(e) {
    send_command("goto", {target: "prev"});
    e.preventDefault();
});
document.getElementById("button_next").addEventListener("click", function(e) {
    send_command("goto", {target: "next"});
    e.preventDefault();
});

socket.on('screenshot', function(data) {
    document.body.style.backgroundImage = "url('" + data + "')";
    document.body.style.backgroundSize = "100% 100%";
});
