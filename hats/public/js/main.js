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
  PLAYER_ACTION_DURATION_MILLIS: 300,

  // How far away can two player inputs be before we disregard them?
  // For now, this can be the same as the player action duration. We can increase difficulty by lowering this value.
  PLAYER_ATTACK_WINDOW_MILLIS: 300
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
    p1AnimationPlayed: false,
    p2AnimationPlayed: false
  },

  takeDamage: function (amount) {
    // TODO
  },

  reset: function () {
    // TODO:

    this.health = 100;
    this.lastSuccessfulAttackTimestamp = 0;
    this.resetP1Inputs();
    this.resetP2Inputs();
  },

  resetP1Inputs: function() {
    this.PLAYERS_INPUT_STATES.p1LastKeyDown = null;
    this.PLAYERS_INPUT_STATES.p1KeyDownTimestamp = 0;
    this.PLAYERS_INPUT_STATES.p1AnimationPlayed = false;
  },

  resetP2Inputs: function() {
    this.PLAYERS_INPUT_STATES.p2LastKeyDown = null;
    this.PLAYERS_INPUT_STATES.p2KeyDownTimestamp = 0;
    this.PLAYERS_INPUT_STATES.p2AnimationPlayed = false;
  }
};

const BOSS_STATE = {
  bossHealth: 100,

  reset: function () {
    // TODO
    this.bossHealth = 100;
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

// TODO: Abstract segments to their own methods.
function processInputs(time) {
  const inputStates = PLAYERS_STATE.PLAYERS_INPUT_STATES;
  const canAttack = time - PLAYERS_STATE.lastSuccessfulAttackTimestamp > GAME_LOGIC_CONFIG.PLAYER_ACTION_DURATION_MILLIS;

  // TODO: Make players strike pose and hold it.
  if (inputStates.p1LastKeyDown && !inputStates.p1AnimationPlayed) {

  }

  if (inputStates.p2LastKeyDown && !inputStates.p2AnimationPlayed) {

  }

  // Check for a matching input first, before clearing. Allow users to get attacks in as late as possible.
  if (inputStates.p1LastKeyDown && inputStates.p2LastKeyDown && canAttack) {

    let isSameInput = inputStates.p1LastKeyDown === inputStates.p2LastKeyDown;

    if (isSameInput) {
      // In short, damage done to the enemy is scaled based on how close the inputs were together.
      const timeBetweenAttackInputs = Math.abs(inputStates.p1KeyDownTimestamp - inputStates.p2KeyDownTimestamp);
      const damageReduction = Math.abs(GAME_LOGIC_CONFIG.PLAYER_ATTACK_WINDOW_MILLIS - timeBetweenAttackInputs);

      Util.debugLog(`Same input detected. Time between attacks: ${timeBetweenAttackInputs}. Damage reduction: ${damageReduction}.`);

      damageBoss(inputStates.p1LastKeyDown, damageReduction);

      PLAYERS_STATE.lastSuccessfulAttackTimestamp = time;
    } else {
      // TODO: Whiff or move cancellation logic.
    }
  }

  // Clear inputs if the last input was more than TIMEOUT seconds ago.
  if (inputStates.p1KeyDownTimestamp && time - inputStates.p1KeyDownTimestamp > GAME_LOGIC_CONFIG.PLAYER_ACTION_DURATION_MILLIS) {
    Util.debugLog(`Clearing p1 inputs. Last input was at ${inputStates.p1KeyDownTimestamp} and time is ${time}`);
    inputStates.resetP1Inputs();
  }

  if (inputStates.p2KeyDownTimestamp && time - inputStates.p2KeyDownTimestamp > GAME_LOGIC_CONFIG.PLAYER_ACTION_DURATION_MILLIS) {
    inputStates.resetP2Inputs();
  }
}

// ----------------------------------------------------
// Game logic for boss and any special player logic.
// ----------------------------------------------------

function damageBoss(attackMoveDirection, damageReductionMillis) {
  // TODO: damage boss based on how well the players did, queue or cue animations, do attack based on the move direction or damage.

  Util.debugLog(`Damaging enemy boss with direction: ${attackMoveDirection} and timing difference of ${damageReductionMillis} millis.`);
}
