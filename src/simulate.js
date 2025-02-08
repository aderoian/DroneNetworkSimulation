import {Drone} from "./drone";

export class Simulation {

    #mapElements;
    #graph;
    #drones;

    #numDrones;
    #simSpeed;

    #pathGenerator;

    #running = false;

    constructor(mapElements, graph, alg) {
        this.#mapElements = mapElements;
        this.#graph = graph;
        this.#drones = [];

        this.#numDrones = $("#drones").value;
        this.#simSpeed = $("#speed").value;

        switch (alg) {
            case "a*":
                this.#pathGenerator = new AStarPathGenerator(graph);
                break;
            case "dijkstra":
                this.#pathGenerator = new DijkstraPathGenerator(graph);
                break;
            case "bfs":
                this.#pathGenerator = new BFSPathGenerator(graph);
                break;
            case "dfs":
                this.#pathGenerator = new DFSPathGenerator(graph);
                break;
            default:
                throw new Error("Invalid algorithm");
        }
    }

    async start() {
        if (this.#running) return;

        this.#running = true;
        this.#drones = this.#createDrones();

        while (this.#running) {
            this.#drones.forEach(drone => drone.update());

            // creates a tps of 20 / second
            await new Promise(resolve => setTimeout(resolve, 1000 / 20));
        }
    }

    #createDrones() {
        const drones = [];
        let i = 0;
        for (let [pos, element] of this.#mapElements.dronePorts) {
            if (i >= this.#numDrones) break;

            const path = this.#generatePath(pos);
            const drone = new Drone(pos, path);
            drones.push(drone);
            i++;
        }

        return drones;
    }

    #generatePath(startPos) {
        const locations = Array.from(this.#mapElements.dronePorts.keys());
        locations.splice(locations.indexOf(startPos), 1);

        // randomize the end position
        const endPos = locations[Math.floor(Math.random() * locations.length)];
        return this.#pathGenerator.generatePath(startPos, endPos);
    }

    stop() {
        if (!this.#running) return;
    }

    reset() {
        if (this.#running) this.stop();
        this.#drones.forEach(drone => drone.destroy());
        this.#drones.clear();
    }

    get running() {
        return this.#running;
    }
}

class PathGenerator {

    #graph;

    constructor(graph) {
        this.#graph = graph;
    }

    generatePath(startPos, endPos) {
        throw new Error("Not implemented");
    }
}

class AStarPathGenerator extends PathGenerator{
    constructor(graph) {
        super(graph);
    }
}

class DijkstraPathGenerator extends PathGenerator{
    constructor(graph) {
        super(graph);
    }
}

class BFSPathGenerator extends PathGenerator{
    constructor(graph) {
        super(graph);
    }
}

class DFSPathGenerator extends PathGenerator{
    constructor(graph) {
        super(graph);
    }
}