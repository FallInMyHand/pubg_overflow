define(['app/utils/events'], function(EventEmitter) {
    class Map {
        constructor(platform, eventBus) {
            this.points = [[]];
            this.events = new EventEmitter('MapModel');
            this.state -1;
        }

        moveTo(point) {
            if (this.points[this.points.length - 1].length === 0) {
                this.points[this.points.length - 1].push(point);

                this.events.trigger('move', { point });
            } else {
                let last = this.points[this.points.length - 1][this.points[this.points.length - 1].length - 1];
                if (last.x !== point.x || last.y !== point.y || last.z !== point.z) {
                    this.points[this.points.length - 1].push(point);

                    this.events.trigger('move', { point });
                }
            }
        }

        setState(v) {
            this.state = v;

            if (this.state === 0) {
                this.reset();
            }
        }

        reset() {
            this.points = [[]];
        }
    }

    return Map;
});