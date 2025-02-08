import {Vector2, CellPos} from "./math/Vector.js";
import {Stack} from "./util/Stack.js";
import {Simulation} from "./simulate";

// config
let config = {
    distanceBetweenPorts: 200,
    distanceBetweenNodes: 30,
    distanceMaxTravelGap: 100
}

let algorithms = ["a*", "dijkstra", "bfs", "dfs"];
let simState = {start: false, algorithm: null};
let placeTarget = "drone-port";
let lastClicked = null; // for node-connector

let mapElements = {
    dronePorts: new Map(),
    pathNodes: new Map(),
    lines: []
}

let graph = new Map();
let simulation;

let undoStack = new Stack();

$(document).ready(function () {
    $("#start").click(function () {
        simState.start = true;
        simState.algorithm = algorithms[$("#algorithm").val() - 1];
        simulation = new Simulation(mapElements, simState.algorithm);
        $(".menu").css("display", "none");
    });

    $("#drone-port-select").css("background-color", "rgba(255, 255, 255, 0.25)")
        .click(function (e) {
            placeTarget = "drone-port";
            $("#drone-port-select").css("background-color", "rgba(255, 255, 255, 0.25)");
            $("#path-node-select").css("background-color", "");
            $("#node-connector-select").css("background-color", "");
        });

    $("#path-node-select").click(function (e) {
        placeTarget = "path-node";
        $("#path-node-select").css("background-color", "rgba(255, 255, 255, 0.25)");
        $("#drone-port-select").css("background-color", "");
        $("#node-connector-select").css("background-color", "");
    });

    $("#node-connector-select").click(function (e) {
        placeTarget = "node-connector";
        $("#node-connector-select").css("background-color", "rgba(255, 255, 255, 0.25)");
        $("#drone-port-select").css("background-color", "");
        $("#path-node-select").css("background-color", "");
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

    $("#status").click(function (e) {
        if (isStarted()) {
            simState.start = false;
            simulation.stop();
        } else {
            simState.start = true;
            simulation.start();
        }
    });

    $(document).mousemove(function (e) {
        $("#x").text("X: " + e.pageX);
        $("#y").text("Y: " + e.pageY);
    });

    $(document).keydown(function (e) {
        if (e.key === "z" && e.ctrlKey) {
            if (!undoStack.isEmpty()) {
                undoStack.pop()();
            }
        }
    });
});

function onMapNodeClick(pos) {
    if (isStarted() && placeTarget === "node-connector") {
        if (lastClicked === null) {
            lastClicked = pos;
        } else {
            if (!lineExists(lastClicked, pos))
                drawLine(lastClicked, pos);
            else
                removeLine(lastClicked, pos);

            lastClicked = null;
        }
    }
}

function createDronePort(pos, canUndo = true) {
    if (!canCreateDronePort(pos)) return;

    $("#drone-port").clone(false, false)
        .attr("id", "drone-port-" + pos.hashCode())
        .css("position", "absolute")
        .css("left", pos.x - 16)
        .css("top", pos.y - 16)
        .css("z-index", 10).appendTo(".map")
        .click(() => onMapNodeClick(pos));
    console.log("Port created at " + pos);
    mapElements.dronePorts.set(pos.hashCode(), {pos: pos});
    if (canUndo) undoStack.push(() => removeDronePort(pos, false));
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

function removeDronePort(pos, canUndo = true) {
    const posHash = pos.hashCode();
    if (!mapElements.dronePorts.has(posHash)) return;

    $("#drone-port-" + posHash).remove();
    mapElements.dronePorts.delete(posHash);
    if (canUndo) undoStack.push(() => createDronePort(pos, false));
    removeLinesOfNode(pos);
}

function createPathNode(pos, canUndo = true) {
    if (!canCreatePathNode(pos)) return;

    $("#path-node").clone(false, false)
        .attr("id", "path-node-" + pos.hashCode())
        .css("position", "absolute")
        .css("left", pos.x - 8)
        .css("top", pos.y - 8)
        .css("z-index", 10).appendTo(".map")
        .click(() => onMapNodeClick(pos));
    mapElements.pathNodes.set(pos.hashCode(), { pos: pos });
    if (canUndo) undoStack.push(() => removePathNode(pos, false));
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

function removePathNode(pos, canUndo = true) {
    const posHash = pos.hashCode();
    if (!mapElements.pathNodes.has(posHash)) return;

    $("#path-node-" + posHash).remove();
    mapElements.pathNodes.delete(posHash);
    if (canUndo) undoStack.push(() => createPathNode(pos, false));
    removeLinesOfNode(pos);
}

function isStarted() {
    return simState.start;
}

function getAlgorithm() {
    return simState.algorithm;
}

function lineExists(pos1, pos2) {
    return (graph[pos1.hashCode()] !== undefined && graph[pos1.hashCode()][pos2.hashCode()] !== undefined);
}


function drawLine(pos1, pos2, canUndo = true) {
    mapElements.lines.push({ pos1: pos1, pos2: pos2 });
    const pos1Hash = pos1.hashCode();
    const pos2Hash = pos2.hashCode();
    const weight = pos1.distance(pos2);

    if (graph[pos1Hash] === undefined) graph[pos1Hash] = [];
    if (graph[pos2Hash] === undefined) graph[pos2Hash] = [];
    graph[pos1Hash][pos2Hash] = weight;
    graph[pos2Hash][pos1Hash] = weight;
    if (canUndo) undoStack.push(() => removeLine(pos1, pos2, false));

    const angle = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
    const color = (weight > config.distanceMaxTravelGap) ? "red" : "black";
    $(`<div class='path-line' id='path-line-${pos1.hashCode()}-${pos2.hashCode()}'></div>`)
        .css({width: `${weight}px`, left: pos1.x, top: pos1.y, transform: `rotate(${angle}rad)`})
        .css("background-color", color)
        .appendTo(".map");
}

function removeLinesOfNode(pos, canUndo = true) {
    const undos = [];
    for (let i = 0; i < mapElements.lines.length; i++) {
        const line = mapElements.lines[i];
        if (line.pos1.equals(pos) || line.pos2.equals(pos)) {
            const pos1Hash = line.pos1.hashCode();
            const pos2Hash = line.pos2.hashCode();

            $(`#path-line-${line.pos1.hashCode()}-${line.pos2.hashCode()}`).remove();
            mapElements.lines.splice(i, 1);
            undos.push(() => drawLine(line.pos1, line.pos2, false));
            delete graph[pos1Hash][pos2Hash];
            delete graph[pos2Hash][pos1Hash];
            i--;
        }
    }

    if (canUndo) undoStack.push(() => undos.forEach(undo => undo()));
}

function removeLine(pos1, pos2, canUndo = true) {
    const pos1Hash = pos1.hashCode();
    const pos2Hash = pos2.hashCode();

    if (graph[pos1Hash] === undefined || graph[pos1Hash][pos2Hash] === undefined) return;

    $(`#path-line-${pos1.hashCode()}-${pos2.hashCode()}`).remove();
    mapElements.lines.splice(mapElements.lines.findIndex(line => line.pos1.equals(pos1) && line.pos2.equals(pos2)), 1);
    if (canUndo) undoStack.push(() => drawLine(pos1, pos2, false));
    delete graph[pos1Hash][pos2Hash];
    delete graph[pos2Hash][pos1Hash];
}