"use strict";

import { game } from '../boot.js';
import * as Util from '../util.js';

// Needs to match the types in gameConfig.json
export let tutorialScene = new Phaser.Scene('interstitial');

let PHASER_GAME_CONFIG = null;
let GAME_CONFIG = null;
let CURRENT_LEVEL_CONFIG = null;
let LEVEL_INDEX = 0;

const SCENE_OBJECTS = {
  interstitialImage: null,
  TUTORIAL_MUSIC: null
}

function reset() {
  PHASER_GAME_CONFIG = null;
}

// See: https://phaser.io/docs/2.3.0/Phaser.State.html#init
tutorialScene.init = function (data) {
  PHASER_GAME_CONFIG = data.PHASER_GAME_CONFIG;
  GAME_CONFIG = data.config;
  LEVEL_INDEX = data.levelIndex;
  CURRENT_LEVEL_CONFIG = GAME_CONFIG.stages[LEVEL_INDEX];
}

tutorialScene.preload = function () {
  SCENE_OBJECTS.interstitialImage = this.load.image(CURRENT_LEVEL_CONFIG.imageKey, CURRENT_LEVEL_CONFIG.imagePath);

  this.load.audio('tutorial_music', 'assets/Daniel_Birch_-_06_-_In_Pursuit_Of_Silence.mp3');
}

tutorialScene.create = function () {
  Util.debugLog(`Phaser game config width: ${PHASER_GAME_CONFIG.width}, scene type: ${CURRENT_LEVEL_CONFIG.type}`);

  this.add.image(PHASER_GAME_CONFIG.width / 2, PHASER_GAME_CONFIG.height / 2, CURRENT_LEVEL_CONFIG.type);
  game.input.mouse.capture = true;

  SCENE_OBJECTS.TUTORIAL_MUSIC = this.sound.add('tutorial_music', {volume: 0.5});
  SCENE_OBJECTS.TUTORIAL_MUSIC.play();
}

tutorialScene.update = function () {
  // Go to next scene on click
  if (game.input.activePointer.isDown) {
    const levelNameToLoad = GAME_CONFIG.stages[LEVEL_INDEX + 1].type;
    Util.debugLog(`Loading level ${LEVEL_INDEX + 1} of type ${levelNameToLoad}.`);

    SCENE_OBJECTS.TUTORIAL_MUSIC.stop();
    this.scene.start(levelNameToLoad, { PHASER_GAME_CONFIG: PHASER_GAME_CONFIG, levelIndex: LEVEL_INDEX + 1, config: GAME_CONFIG });
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
