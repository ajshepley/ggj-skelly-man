"use strict";

import * as Util from './util.js';
import * as Input from './input.js';
import { SyncMeter } from './SyncMeter.js';
import { BossMeter } from './BossMeter.js';
import { tutorialScene } from './scenes/tutorial.js';

// ----------------------------------------------------
// Configs and constants
// ----------------------------------------------------

export const PHASER_GAME_CONFIG = {
  type: Phaser.AUTO,
  width: 1600,
  height: 900,
  title: 'Rhythm Game',
  scene: [
    tutorialScene,
    {
      key: 'main',
      preload: preload,
      create: create,
      update: update
    }
  ]
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

// ----------------------------------------------------
// Global States
// ----------------------------------------------------

export const game = new Phaser.Game(PHASER_GAME_CONFIG);

const BATTLE_STATE = {
  playerAttackSyncMeter: null,
  bossAttackTimerMeter: null
};

const PLAYERS_STATE = {
  health: 100,
  lastSuccessfulAttackTimestamp: 0,

  PLAYERS_INPUT_STATES: {
    p1LastKeyDown: null,
    p2LastKeyDown: null,
    p1KeyDownTimestamp: 0,
    p2KeyDownTimestamp: 0,
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
  BATTLE_STATE.playerAttackSyncMeter = new SyncMeter(
    this,
    PHASER_GAME_CONFIG.width * 0.5,
    PHASER_GAME_CONFIG.height * 0.67,
    80,
    0x00ff00);
    
  BATTLE_STATE.bossAttackTimerMeter = new BossMeter(
    this,
    PHASER_GAME_CONFIG.width * 0.5 - BOSS_CONFIG.bossMeterWidth * 0.5,
    PHASER_GAME_CONFIG.height * 0.1,
    BOSS_CONFIG.bossMeterWidth,
    50,
    0xff0000);

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
  const inputStates = PLAYERS_STATE.PLAYERS_INPUT_STATES;

  // Check for a matching input first, before clearing. Allow users to get attacks in as late as possible.
  if (inputStates.p1LastKeyDown) {

  }

  // Check timeouts and clear.
}
