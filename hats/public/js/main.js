"use strict";

import * as Util from './util.js';
import * as Input from './input.js';
import { SyncMeter } from './SyncMeter.js';
import { BossMeter } from './BossMeter.js';


// ----------------------------------------------------
// Configs, constants and global states.
// ----------------------------------------------------

const PHASER_GAME_CONFIG = {
  type: Phaser.AUTO,
  width: 1600,
  height: 900,
  physics: {
    // Unneeded?
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: {
    key: 'main',
    preload: preload,
    create: create,
    update: update
  }
};

// Config and globals for non-phaser game logic, e.g. sync timings, difficulty, etc.
const GAME_LOGIC_CONFIG = {
  // Lockout time before another input is accepted for a player.
  // Also used to determine how close P2 and P1 are to each other's inputs.
  PLAYER_ACTION_DURATION_MILLIS: 300
};

const BOSS_CONFIG = {
  bossMeterWidth: 400,

};

const game = new Phaser.Game(PHASER_GAME_CONFIG);

const BATTLE_STATE = {
  playerAttackSyncMeter: null,
  bossAttackTimerMeter: null
};

const PLAYERS_STATE = {
  health: 100,

  PLAYERS_INPUT_STATES: {
    P1_LAST_KEY_DOWN: null,
    P2_LAST_KEY_DOWN: null,
    P1_KEY_DOWN_TIMESTAMP: null,
    P2_KEY_DOWN_TIMESTAMP: null
  },

  takeDamage: function (amount) {
    // TODO
  },

  reset: function () {
    // TODO:
  }
};

const BOSS_STATE = {
  bossHealth: 100,

  reset: function () {
    // TODO
  }
};

// ----------------------------------------------------
// Phaser logic functions, game loop and tick.
// ----------------------------------------------------

function preload() {
  // this.loadImage, loadAtlas, loadAudio
}

function create() {
  Util.debugLog("test");

  BATTLE_STATE.playerAttackSyncMeter = new SyncMeter(this, PHASER_GAME_CONFIG.width * 0.5, PHASER_GAME_CONFIG.height * 0.67, 80, 0x00ff00);

  BATTLE_STATE.bossAttackTimerMeter = new BossMeter(this, PHASER_GAME_CONFIG.width * 0.5 - BOSS_CONFIG.bossMeterWidth * 0.5,
    PHASER_GAME_CONFIG.height * 0.1, BOSS_CONFIG.bossMeterWidth, 50, 0xff0000);

  // add and play music, input, cursor keys, etc.

  Input.initInput(this, PLAYERS_STATE.PLAYERS_INPUT_STATES);
}

function update(time, delta) {
  let nextFrame = Math.floor(time / (1_000 / 60));

  processInputs(time);

  if (nextFrame < 100) {
    BATTLE_STATE.playerAttackSyncMeter.updateFill(nextFrame / 100);
    BATTLE_STATE.bossAttackTimerMeter.updateFill(1 - nextFrame / 100);
  }

  // set texts, etc.
}

function processInputs(time) {

}


