import Vector2 from "./math/Vector.js";

// config
var config = {
    distanceBetweenPorts: 200,
    distanceBetweenNodes: 30
}

var simState = {start: false, algorithm: null};
var placeTarget = "drone-port";

var mapElements = {
    dronePorts: [],
    pathNodes: []
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
                createDronePort(new Vector2(e.pageX - 16, e.pageY - 16));
            else if (placeTarget === "path-node") {
                createPathNode(new Vector2(e.pageX - 8, e.pageY - 8));
            }
        }
    });

    $(document).mousemove(function (e) {
        $("#x").text("X: " + e.pageX);
        $("#y").text("Y: " + e.pageY);
    });
});

function createDronePort(pos) {
    if (!canCreateDronePort(pos)) return;

    $("#drone-port").clone(false, false).css("position", "absolute").css("left", pos.x).css("top", pos.y).css("z-index", 10).appendTo(".map");
    mapElements.dronePorts.push({ pos: pos });
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

    $("#path-node").clone(false, false).css("position", "absolute").css("left", pos.x).css("top", pos.y).css("z-index", 10).appendTo(".map");
    mapElements.pathNodes.push({ pos: pos });
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