import {Vector2, CellPos} from "./math/Vector.js";

// config
var config = {
    distanceBetweenPorts: 200,
    distanceBetweenNodes: 30,
    distanceMaxTravelGap: 100
}

var simState = {start: false, algorithm: null};
var placeTarget = "drone-port";

var mapElements = {
    dronePorts: new Map(),
    pathNodes: new Map(),
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
                createDronePort(new CellPos(e.pageX, e.pageY).toPixelCenter());
            else if (placeTarget === "path-node")
                createPathNode(new CellPos(e.pageX, e.pageY).toPixelCenter());
        }
    }).on("contextmenu", function (e) {
        if (isStarted()) {
            e.preventDefault();

            const pos = new CellPos(e.pageX, e.pageY).toPixelCenter();
            removeDronePort(pos);
            removePathNode(pos);
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

    $("#drone-port").clone(false, false).attr("id", "drone-port-" + pos.hashCode()).css("position", "absolute").css("left", pos.x - 16).css("top", pos.y - 16).css("z-index", 10).appendTo(".map");
    console.log("Port created at " + pos);
    mapElements.dronePorts.set(pos.hashCode(), { pos: pos });
    drawLines({pos: pos}, true);
}

function canCreateDronePort(pos) {
    for (let dronePort of mapElements.dronePorts.values()) {
        const otherPos = dronePort.pos;
        if (pos.distance(otherPos) < config.distanceBetweenPorts)
            return false;
    }
    for (let pathNode of mapElements.pathNodes.values()) {
        const otherPos = pathNode.pos;
        if (pos.distance(otherPos) < config.distanceBetweenNodes)
            return false;
    }
    return true;
}

function removeDronePort(pos) {
    const posHash = pos.hashCode();
    if (!mapElements.dronePorts.has(posHash)) return;

    $("#drone-port-" + posHash).remove();
    mapElements.dronePorts.delete(posHash);
    removeLine(pos);
}

function createPathNode(pos) {
    if (!canCreatePathNode(pos)) return;

    $("#path-node").clone(false, false).attr("id", "path-node-" + pos.hashCode()).css("position", "absolute").css("left", pos.x - 8).css("top", pos.y - 8).css("z-index", 10).appendTo(".map");
    mapElements.pathNodes.set(pos.hashCode(), { pos: pos });
    drawLines({pos: pos}, false);
}

function canCreatePathNode(pos) {
    for (let pathNode of mapElements.pathNodes.values()) {
        const otherPos = pathNode.pos;
        if (pos.distance(otherPos) < config.distanceBetweenNodes)
            return false;
    }
    for (let dronePort of mapElements.dronePorts.values()) {
        const otherPos = dronePort.pos;
        if (pos.distance(otherPos) < config.distanceBetweenNodes)
            return false;
    }

    return true;
}

function removePathNode(pos) {
    const posHash = pos.hashCode();
    if (!mapElements.pathNodes.has(posHash)) return;

    $("#path-node-" + posHash).remove();
    mapElements.pathNodes.delete(posHash);
    removeLine(pos);
}

function isStarted() {
    return simState.start;
}

function getAlgorithm() {
    return simState.algorithm;
}

function drawLines(element, isPort) {
    const pos = element.pos;
    for (let pathNode of mapElements.pathNodes.values()) {
        const otherPos = pathNode.pos;
        if (pos.distance(otherPos) < config.distanceMaxTravelGap)
            drawLine(pos, otherPos);
    }

    if (isPort) return;
    for (let dronePort of mapElements.dronePorts.values()) {
        const otherPos = dronePort.pos;
        if (pos.distance(otherPos) < config.distanceMaxTravelGap)
            drawLine(pos, otherPos);
    }
}


function drawLine(pos1, pos2) {
    mapElements.lines.push({ pos1: pos1, pos2: pos2 });

    const length = pos1.distance(pos2);
    const angle = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
    $(`<div class='path-line' id='path-line-${pos1.hashCode()}-${pos2.hashCode()}'></div>`)
        .css({width: `${length}px`, left: pos1.x, top: pos1.y, transform: `rotate(${angle}rad)`})
        .appendTo(".map");
}

function removeLine(pos) {
    for (let i = 0; i < mapElements.lines.length; i++) {
        const line = mapElements.lines[i];
        if (line.pos1.equals(pos) || line.pos2.equals(pos)) {
            $(`#path-line-${line.pos1.hashCode()}-${line.pos2.hashCode()}`).remove();
            mapElements.lines.splice(i, 1);
            i--;
        }
    }
}