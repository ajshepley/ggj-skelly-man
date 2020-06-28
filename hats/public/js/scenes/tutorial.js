"use strict";

import { game } from '../boot.js';
import * as Util from '../util.js';

export let tutorialScene = new Phaser.Scene('tutorialScene');

let PHASER_GAME_CONFIG = null;
let GAME_CONFIG = null;
let CURRENT_LEVEL_CONFIG = null;
let LEVEL_INDEX = 0;

const SCENE_OBJECTS = {
  interstitialImage: null,
}

function reset() {
  PHASER_GAME_CONFIG = null;
}

tutorialScene.init = function (data) {
  // TODO: Pull the scene config data - monster screen picture before fight, or end game screen - from data.
  // See: https://phaser.io/docs/2.3.0/Phaser.State.html#init

  // SCENE_OBJECTS.interstitialImagePath = data.imagePath;
  PHASER_GAME_CONFIG = data.PHASER_GAME_CONFIG;
  GAME_CONFIG = data.config;
  LEVEL_INDEX = data.levelIndex;
  CURRENT_LEVEL_CONFIG = GAME_CONFIG.stages[LEVEL_INDEX];
}

tutorialScene.preload = function () {
  // this.load.image('interstitial', 'assets/placeholder_tutorial.png');
  SCENE_OBJECTS.interstitialImage = this.load.image(CURRENT_LEVEL_CONFIG.imageKey, CURRENT_LEVEL_CONFIG.imagePath);
}

tutorialScene.create = function () {
  // Placeholder graphics
  Util.debugLog(`Phaser game config width: ${PHASER_GAME_CONFIG.width}, scene object: ${SCENE_OBJECTS.interstitialImage}`);

  this.add.image(PHASER_GAME_CONFIG.width / 2, PHASER_GAME_CONFIG.height / 2, 'interstitial');

  game.input.mouse.capture = true;
}

tutorialScene.update = function () {
  // Go to next scene on click
  if (game.input.activePointer.isDown) {
    // TODO: Add initial config data to start call.
    // See: https://phaser.io/docs/2.3.0/Phaser.State.html#init
    Util.debugLog(`Loading level ${LEVEL_INDEX + 1}.`);
    this.scene.start('mainScene', { PHASER_GAME_CONFIG: PHASER_GAME_CONFIG, levelIndex: LEVEL_INDEX + 1, config: GAME_CONFIG });
  }
}

tutorialScene.shutdown = function () {
  PHASER_GAME_CONFIG = null;
  GAME_CONFIG = null;
  CURRENT_LEVEL_CONFIG = null;
  LEVEL_INDEX = 0;
  SCENE_OBJECTS = {
    interstitialImage: null
  };
}
