"use strict";

export class BossMeter {
  constructor(phaser, x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;

    this.outline = phaser.add.graphics();
    const thickness = 4;
    const alpha = 1;
    this.outline.lineStyle(thickness, color, alpha);
    this.outline.strokeRect(this.x, this.y, width, height);

    this.fill = phaser.add.graphics();
  }

  updateFill(percentage) {
    this.fill.clear();
    this.fill.fillStyle(this.color, 1);
    this.fill.fillRect(this.x, this.y, this.width * percentage, this.height);
  }
}