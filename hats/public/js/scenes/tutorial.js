"use strict";

import { game } from '../boot.js';
import * as Util from '../util.js';

export let tutorialScene = new Phaser.Scene('tutorialScene');

let PHASER_GAME_CONFIG = null;

const SCENE_OBJECTS = {
  BOX: null,
  interstitialImage: null,
}

tutorialScene.init = function (data) {
  // TODO: Pull the scene config data - monster screen picture before fight, or end game screen - from data.
  // See: https://phaser.io/docs/2.3.0/Phaser.State.html#init

  // SCENE_OBJECTS.interstitialImagePath = data.imagePath;
  PHASER_GAME_CONFIG = data.PHASER_GAME_CONFIG;
}

tutorialScene.preload = function () {
  // this.load.image('interstitial', 'assets/placeholder_tutorial.png');
  SCENE_OBJECTS.interstitialImage = this.load.image('interstitial', 'assets/placeholder_tutorial.png');
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
    this.scene.start('mainScene', { PHASER_GAME_CONFIG: PHASER_GAME_CONFIG });
  }
}
