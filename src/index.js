import Vector2 from "./math/Vector.js";

// config
var config = {
    distanceBetweenPorts: 200,
    distanceBetweenNodes: 30,
    distanceMaxTravelGap: 100
}

var simState = {start: false, algorithm: null};
var placeTarget = "drone-port";

var mapElements = {
    dronePorts: [],
    pathNodes: [],
    lines: []
}

$(document).ready(function () {
    $("#start").click(function () {
        simState.start = true;
        simState.algorithm = $("#algorithm").val() - 1;
        $(".menu").css("display", "none");
    });

    $("#drone-port-select").css("background-color", "rgba(255, 255, 255, 0.25)")
        .click(function (e) {
            placeTarget = "drone-port";
            $("#drone-port-select").css("background-color", "rgba(255, 255, 255, 0.25)");
            $("#path-node-select").css("background-color", "");
        });

    $("#path-node-select").click(function (e) {
        placeTarget = "path-node";
        $("#path-node-select").css("background-color", "rgba(255, 255, 255, 0.25)");
        $("#drone-port-select").css("background-color", "");
    });

    $(".map").click(function (e) {
        if (isStarted()) {
            if (placeTarget === "drone-port")
                createDronePort(new Vector2(((e.pageX) >> 5) * 32 + 16, ((e.pageY) >> 5) * 32 + 16));
            else if (placeTarget === "path-node") {
                createPathNode(new Vector2(((e.pageX) >> 5) * 32 + 16, ((e.pageY) >> 5) * 32 + 16));
            }
        }
    });

    $(document).mousemove(function (e) {
        $("#x").text("X: " + e.pageX);
        $("#y").text("Y: " + e.pageY);
    });

    // draw grid
    // const height = $(".map").height();
    // const width = $(".map").width();
    // for (let i = 0; i < height; i += 32) {
    //     drawLine(new Vector2(0, i), new Vector2(width, i));
    // }
    // for (let i = 0; i < width; i += 32) {
    //     drawLine(new Vector2(i, 0), new Vector2(i, height));
    // }
});

function createDronePort(pos) {
    if (!canCreateDronePort(pos)) return;

    $("#drone-port").clone(false, false).css("position", "absolute").css("left", pos.x - 16).css("top", pos.y - 16).css("z-index", 10).appendTo(".map");
    mapElements.dronePorts.push({ pos: pos });
    drawLines({pos: pos}, true);
}

function canCreateDronePort(pos) {
    for (let i = 0; i < mapElements.dronePorts.length; i++) {
        const otherPos = mapElements.dronePorts[i].pos;

        if (pos.distance(otherPos) < config.distanceBetweenPorts)
            return false;
    }
    for (let i = 0; i < mapElements.pathNodes.length; i++) {
        const otherPos = mapElements.pathNodes[i].pos;

        if (pos.distance(otherPos) < config.distanceBetweenNodes)
            return false;
    }
    return true;
}

function createPathNode(pos) {
    if (!canCreatePathNode(pos)) return;

    $("#path-node").clone(false, false).css("position", "absolute").css("left", pos.x - 8).css("top", pos.y - 8).css("z-index", 10).appendTo(".map");
    mapElements.pathNodes.push({ pos: pos });
    drawLines({pos: pos}, false);
}

function canCreatePathNode(pos) {
    for (let i = 0; i < mapElements.pathNodes.length; i++) {
        const otherPos = mapElements.pathNodes[i].pos;

        if (pos.distance(otherPos) < config.distanceBetweenNodes)
            return false;
    }
    for (let i = 0; i < mapElements.dronePorts.length; i++) {
        const otherPos = mapElements.dronePorts[i].pos;

        if (pos.distance(otherPos) < config.distanceBetweenNodes)
            return false;
    }

    return true;
}

function isStarted() {
    return simState.start;
}

function getAlgorithm() {
    return simState.algorithm;
}

function drawLines(element, isPort) {
    const pos = element.pos;

    for (let i = 0; i < mapElements.pathNodes.length; i++) {
        const otherPos = mapElements.pathNodes[i].pos;

        if (pos.distance(otherPos) < config.distanceMaxTravelGap) {
            drawLine(pos, otherPos);
        }
    }

    if (isPort) return;
    for (let i = 0; i < mapElements.dronePorts.length; i++) {
        const otherPos = mapElements.dronePorts[i].pos;

        if (pos.distance(otherPos) < config.distanceMaxTravelGap) {
            drawLine(pos, otherPos);
        }
    }
}


function drawLine(pos1, pos2) {
    const length = pos1.distance(pos2);
    const angle = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
    $("<div class='path-line'></div>")
        .css({width: `${length}px`, left: pos1.x, top: pos1.y, transform: `rotate(${angle}rad)`})
        .appendTo(".map");
}