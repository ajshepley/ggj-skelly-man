"use strict";

import { mainScene } from './main.js';
import { tutorialScene } from './scenes/tutorial.js';

export const PHASER_GAME_CONFIG = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  title: 'Rhythm Game',
  scene: [
    {
      key: 'boot',
      create: create
    },
    tutorialScene,
    mainScene
  ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  }
};

export const game = new Phaser.Game(PHASER_GAME_CONFIG);

function create() {
  this.scene.start('tutorialScene');
}
