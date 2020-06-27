"use strict";

export class SyncMeter {
    constructor(phaser, x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;

        this.outline = phaser.add.graphics();
        const thickness = 4;
        const alpha = 1;
        this.outline.lineStyle(thickness, color, alpha);
        this.outline.strokeCircle(this.x, this.y, radius);

        this.fill = phaser.add.graphics();
    }

    updateFill(percentage) {
        this.fill.clear();
        this.fill.fillStyle(this.color, 1);
        this.fill.fillCircle(this.x, this.y, percentage * this.radius);
    }
}