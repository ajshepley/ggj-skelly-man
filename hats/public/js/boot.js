"use strict";

import { mainScene } from './main.js';
import { tutorialScene } from './scenes/tutorial.js';
import * as ConfigInfo from './configInfo.js';
import * as Util from './util.js';

// We could split this up and have the static values in gameConfig.json, but it's not worth the complexity.
export const PHASER_GAME_CONFIG = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  title: 'Rhythm Game',
  scene: [
    {
      key: 'boot',
      create: create,
      preload: preload
    },
    tutorialScene,
    mainScene
  ],
  physics: {
      default: 'arcade',
      arcade: { debug: false }
  },
};

export const game = new Phaser.Game(PHASER_GAME_CONFIG);

function preload() {
  this.load.json(ConfigInfo.GAME_CONFIG_ASSET_KEY, ConfigInfo.GAME_CONFIG_ASSET_PATH);
}

function create() {
  const config = this.cache.json.get(ConfigInfo.GAME_CONFIG_ASSET_KEY);
  if (!config || !config.stages) {
    Util.debugLog(`Failed to load config ${ConfigInfo.GAME_CONFIG_ASSET_KEY} at ${ConfigInfo.GAME_CONFIG_ASSET_PATH}. Bailing out.`);
    return;
  }

  const phaserConfigObject = { PHASER_GAME_CONFIG: PHASER_GAME_CONFIG, levelIndex: 0, config: config };

  const levelNameToLoad = config.stages[0].type;
  Util.debugLog(`Loading level ${0} of type ${levelNameToLoad}.`);
  this.scene.start(levelNameToLoad, phaserConfigObject);
}

