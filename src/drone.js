export class Drone {

    static #idCounter = 0;

    #id;
    #pos;

    // Queue of points
    #path;
    #speed = 5;
    #flying = false;

    #element;

    constructor(pos, path) {
        this.#id = ++Drone.#idCounter;
        this.#pos = pos;
        this.#path = path;

        //todo: drone element
        this.#element = document.createElement("div");
        this.#element.classList.add("drone");
        this.#element
            .css("position", "absolute")
            .css("left", pos.x)
            .css("top", pos.y)
            .css("z-index", 10).appendTo(".map")
            .css("height", "20px")
            .css("width", "20px")
            .css("background-color", "red")
            .css("border-radius", "50%")
            .css("display", "none");
    }

    get id() {
        return this.#id;
    }

    get pos() {
        return this.#pos;
    }

    fly() {
        if (this.#flying) return;

        this.#flying = true;
        this.#element.css("display", "block");
    }

    land() {
        if (!this.#flying) return;

        this.#flying = false;
        this.#element.css("display", "none");
    }

    destroy() {
        this.#element.remove();
    }

    get flying() {
        return this.#flying;
    }

    update() {
        if (!this.#flying) return;

        let simSpeed = $("$speed").value;
        let droneSpeed = this.#speed * simSpeed;

        let nextPos = this.#path.peek();
        let direction = nextPos.subtract(this.#pos).normalize();
        let movement = direction.multiply(droneSpeed);
        if (this.#pos.distance(nextPos) <= movement.magnitude) {
            this.#path.dequeue();

            if (this.#path.isEmpty()) {
                this.land();
            } else {
                this.#pos = nextPos;
            }
        } else {
            this.#pos = this.#pos.add(movement);
        }

        this.#pos = this.#pos.add(movement);

        this.#element.css("left", this.#pos.x + "px").css("top", this.#pos.y + "px");
    }
}