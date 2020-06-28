"use strict";

import { game, PHASER_GAME_CONFIG } from '../main.js';

export let tutorialScene = new Phaser.Scene('Tutorial');

const SCENE_OBJECTS = {
  BOX: null,
}

tutorialScene.init = function(data) {
  // TODO: Pull the scene config data - monster screen picture before fight, or end game screen - from data.
  // See: https://phaser.io/docs/2.3.0/Phaser.State.html#init
}

tutorialScene.create = function() {
  // Placeholder graphics
  SCENE_OBJECTS.BOX = this.add.graphics();
  SCENE_OBJECTS.BOX.fillStyle(0xffffff, 1);
  SCENE_OBJECTS.BOX.fillRect(PHASER_GAME_CONFIG.width / 2 - 100, PHASER_GAME_CONFIG.height / 2 - 100, 200, 200);

  game.input.mouse.capture = true;
}

tutorialScene.update = function() {
  // Go to next scene on click
  if (game.input.activePointer.isDown) {
    // TODO: Add initial config data to start call.
    // See: https://phaser.io/docs/2.3.0/Phaser.State.html#init
    this.scene.start('main');
  }
}
