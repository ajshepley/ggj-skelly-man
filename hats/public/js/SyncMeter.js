"use strict";

export class SyncMeter {
  constructor(phaser, x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;

    this.outline = phaser.add.graphics();
    this.drawSyncMeterOutline();
    this.fill = phaser.add.graphics();
  }

  updateFill(percentage) {
    this.fill.clear();

    const baseFillAlpha = 0.5;
    const fillAlpha = Math.max(baseFillAlpha, baseFillAlpha * percentage + baseFillAlpha - 0.02);
    this.fill.fillStyle(this.color, fillAlpha);
    this.fill.fillCircle(this.x, this.y, percentage * this.radius);
  }

  drawSyncMeterOutline() {
    const thickness = 8;
    const alpha = 1;
    this.outline.lineStyle(thickness, this.color, alpha);
    this.outline.strokeCircle(this.x, this.y, this.radius);
  }

  clearSyncMeter() {
    this.outline.clear();
    this.fill.clear();
  }
}