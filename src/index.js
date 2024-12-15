var start = false;
var algorithm = null;
var placeTarget = "drone-port";

var dronePorts = [];

$(document).ready(function () {
    $("#start").click(function () {
        start = true;
        algorithm = $("#algorithm").val() - 1;
        console.log(algorithm);
        $(".menu").css("display", "none");
    });

    $("#drone-port-select").css("background-color", "rgba(255, 255, 255, 0.25)")
        .click(function (e) {
            placeTarget = "drone-port";
            $("#drone-port-select").css("background-color", "rgba(255, 255, 255, 0.25)");
            $("#path-node-select").css("background-color", "rgba(0, 0, 0, 0)");
        });

    $("#path-node-select").click(function (e) {
        placeTarget = "path-node";
        $("#path-node-select").css("background-color", "rgba(255, 255, 255, 0.25)");
        $("#drone-port-select").css("background-color", "rgba(0, 0, 0, 0)");
    });

    $(".map").click(function (e) {
        if (start) {
            if (placeTarget === "drone-port")
                createDronePort(e.pageX - 16, e.pageY - 16);
            else if (placeTarget === "path-node") {
                createPathNode(e.pageX - 8, e.pageY - 8);
            }
        }
    });
});

function createDronePort(x, y) {
    if (!canCreateDronePort(x, y)) return;

    $("#drone-port").clone(false, false).css("position", "absolute").css("left", x).css("top", y).css("z-index", 10).appendTo(".map");
    dronePorts.push({ x: x, y: y });
}

function canCreateDronePort(x, y) {
    for (var i = 0; i < dronePorts.length; i++) {
        const portX = dronePorts[i].x;
        const portY = dronePorts[i].y;

        const bbX1 = portX - 200;
        const bbX2 = portX + 200 + 32;
        const bbY1 = portY - 200;
        const bbY2 = portY + 200 + 32;

        if (x >= bbX1 && x <= bbX2 && y >= bbY1 && y <= bbY2) {
            return false;
        }
    }
    return true;
}

function createPathNode(x, y) {
    $("#path-node").clone(false, false).css("position", "absolute").css("left", x).css("top", y).css("z-index", 10).appendTo(".map");
}

function canCreatePathNode(x, y) {
    return true;
}