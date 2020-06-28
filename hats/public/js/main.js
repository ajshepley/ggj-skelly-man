"use strict";

import * as Util from './util.js';
import * as Input from './input.js';
import * as Animation from './animation.js';
import * as AnimationQueue from './animationQueue.js';
import { SyncMeter } from './SyncMeter.js';
import { BossMeter } from './BossMeter.js';
import { tutorialScene } from './scenes/tutorial.js';
import { PHASER_GAME_CONFIG } from './boot.js';

// ----------------------------------------------------
// Configs and constants
// ----------------------------------------------------

// Config and globals for non-phaser game logic, e.g. sync timings, difficulty, etc.
const GAME_LOGIC_CONFIG = {
  // Can the user grow the dance ring by pressing the same direction multiple times in a row?
  ALLOW_SAME_DIRECTION_ATTACKS: false,

  // How many millis until the boss bar is full, from 0?
  BOSS_ATTACK_BAR_GROWTH_TIME_MILLIS: 10_000,

  // Lockout time before another input is accepted for a player.
  // Also used to determine how close P2 and P1 are to each other's inputs.
  PLAYER_ACTION_DURATION_MILLIS: 250,

  // How far away can two player inputs be before we disregard them?
  // For now, this can be the same as the player action duration. We can increase difficulty by lowering this value.
  PLAYER_ATTACK_WINDOW_MILLIS: 250,

  // When the players get hit, how long before they are allowed to do inputs and attack?
  PLAYER_HITSTUN_TIME_MILLIS: 1100,

  // Only change/render the current circle and enemy boss meter fill every N frames.
  // This can be tied to the BPM or rhythm of a song.
  RENDER_CIRCLE_EVERY_N_FRAMES: 10,
  RENDER_BOSS_BAR_EVERY_N_FRAMES: 30,

  // The damage ring will grow by this percent each time the players sync a move.
  PERCENT_RING_GROWTH_PER_SYNCED_DANCE_MOVE: 20,

  // How long does a full ring take to shrink to 0? Used for constant ring shrinkage.
  FULL_RING_SHRINK_TIME_MILLIS: 20_000,

  // When the players max out a ring, how much damage should they do to the boss health?
  DAMAGE_PER_FULL_RING: 20
};

const BOSS_CONFIG = {
  bossMeterWidth: 400,
};

// ----------------------------------------------------
// Global States
// ----------------------------------------------------

const ANIMATION_QUEUE = AnimationQueue.create();

const BATTLE_STATE = {
  playerAttackSyncMeter: null,
  bossAttackTimerMeter: null,

  // Progress percent towards the ring being filled. Out of 1.
  playerAttackProgressPercent: 0,
  bossAttackProgressPercent: 0,

  lastSuccessfulPlayerAttackTimestamp: 0,
  lastSuccessfulPlayer1AttackDirection: null,

  reset: function () {
    this.playerAttackSyncMeter = null;
    this.bossAttackTimerMeter = null;
    this.playerAttackProgress = 0;
    this.bossAttackProgressPercent = 0;
    this.lastSuccessfulPlayerAttackTimestamp = 0;
    this.lastSuccessfulPlayer1AttackDirection = null;
  }
};

const PLAYERS_STATE = {
  health: 100,

  // See: input.js
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
    this.health = 100;
    this.resetP1Inputs();
    this.resetP2Inputs();
  },

  resetP1Inputs: function () {
    this.PLAYERS_INPUT_STATES.p1LastKeyDown = null;
    this.PLAYERS_INPUT_STATES.p1KeyDownTimestamp = 0;
    this.PLAYERS_INPUT_STATES.p1AnimationPlayed = false;
  },

  resetP2Inputs: function () {
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

const SPRITES = {
  PLAYER_ONE: null,
  PLAYER_TWO: null
}

const PLAYER_ONE_INPUT_ANIMATION_MAP = {
  left: "left_left",
  right: "left_right",
  up: "left_up",
  down: "left_down"
}

const PLAYER_TWO_INPUT_ANIMATION_MAP = {
  left: "right_left",
  right: "right_right",
  up: "right_up",
  down: "right_down"
}

// ----------------------------------------------------
// Phaser logic functions, game loop and tick.
// ----------------------------------------------------

export let mainScene = new Phaser.Scene('mainScene');

// Init is called first, by `this.scene.start('main', data);`
mainScene.init = function(data) {
  // TODO: Pull the scene config data - which enemy are we fighting/level/player data? from data.
  // See: https://phaser.io/docs/2.3.0/Phaser.State.html#init
}

// Called when the state shuts down, e.g. when transitioning to another state.
mainScene.shutdown = function() {
  BATTLE_STATE.reset();
  BOSS_STATE.reset();
  PLAYERS_STATE.reset();
  ANIMATION_QUEUE.reset();
}

mainScene.preload = function() {
  // this.loadImage, loadAtlas, loadAudio
  this.load.atlas('left_character', 'assets/left_character.png', 'assets/left_character.json');
  this.load.atlas('right_character', 'assets/right_character.png', 'assets/right_character.json');

  this.load.image('background', 'assets/background.png');
  this.load.image('monster', 'assets/monster.png');
  this.load.image('balcony', 'assets/balcony.png');
  this.load.image('auras', 'assets/auras.png');
}

mainScene.create = function() {
  addImages(this);

  BATTLE_STATE.playerAttackSyncMeter = new SyncMeter(
    this,
    PHASER_GAME_CONFIG.width * 0.5,
    PHASER_GAME_CONFIG.height * 0.67,
    80,
    0x00ff00
  );

  BATTLE_STATE.bossAttackTimerMeter = new BossMeter(
    this,
    PHASER_GAME_CONFIG.width * 0.5 - BOSS_CONFIG.bossMeterWidth * 0.5,
    PHASER_GAME_CONFIG.height * 0.1,
    BOSS_CONFIG.bossMeterWidth,
    50,
    0xff0000
  );

  Input.initInput(this, PLAYERS_STATE.PLAYERS_INPUT_STATES);
}

function addImages(phaserScene) {
  // Background
  phaserScene.add.image(PHASER_GAME_CONFIG.width / 2, PHASER_GAME_CONFIG.height / 2, 'background');
  // Monster
  phaserScene.add.image(PHASER_GAME_CONFIG.width / 2, PHASER_GAME_CONFIG.height / 2, 'monster');
  // Balcony
  phaserScene.add.image(PHASER_GAME_CONFIG.width / 2, PHASER_GAME_CONFIG.height / 2, 'balcony');

  // Characters
  createCharacter(phaserScene, "PLAYER_ONE", PHASER_GAME_CONFIG.width * 0.24, "left_");
  createCharacter(phaserScene, "PLAYER_TWO", PHASER_GAME_CONFIG.width * 0.76, "right_");

  // Auras
  phaserScene.add.image(PHASER_GAME_CONFIG.width / 2, PHASER_GAME_CONFIG.height / 2, 'auras');
}

function createCharacter(phaser, sprite, position, prefix) {
  SPRITES[sprite] = phaser.add.sprite(position, PHASER_GAME_CONFIG.height * 0.67, `${prefix}character`);

  Animation.createCharacterAnimations(phaser, prefix);
  SPRITES[sprite].play(`${prefix}idle`, true);
}

mainScene.update = function(time, delta) {
  let currentFrameNumber = Math.floor(time / (1_000 / 60));

  // Engine/logic update.
  updateGame(time, delta, currentFrameNumber);

  // Render updates.
  // TODO: These meters could be initialized with these render constants, and played by the manual animation queue instead.
  if (currentFrameNumber % GAME_LOGIC_CONFIG.RENDER_CIRCLE_EVERY_N_FRAMES === 0) {
    Util.debugLog(`Player attack progress: ${BATTLE_STATE.playerAttackProgressPercent}`);
    BATTLE_STATE.playerAttackSyncMeter.updateFill(BATTLE_STATE.playerAttackProgressPercent);
  }

  if (currentFrameNumber % GAME_LOGIC_CONFIG.RENDER_BOSS_BAR_EVERY_N_FRAMES === 0) {
    Util.debugLog(`Boss attack progress: ${BATTLE_STATE.bossAttackProgressPercent}`);
    BATTLE_STATE.bossAttackTimerMeter.updateFill(BATTLE_STATE.bossAttackProgressPercent);
  }

  ANIMATION_QUEUE.playAllAnimationsAndRemove();
  ANIMATION_QUEUE.playManualAnimationsAndRemoveIfDone(time, currentFrameNumber);

  // set texts, etc.
}

// ----------------------------------------------------
// Game logic for boss and any special player logic.
//
// Do not call `thing.play()` and other animation methods here - enqueue them in the ANIMATION_QUEUE if possible.
// ----------------------------------------------------

// TODO: Abstract segments to their own methods.
function processInputs(time) {
  const inputStates = PLAYERS_STATE.PLAYERS_INPUT_STATES;
  const canAttack = time - BATTLE_STATE.lastSuccessfulPlayerAttackTimestamp > GAME_LOGIC_CONFIG.PLAYER_ACTION_DURATION_MILLIS;

  if (inputStates.p1LastKeyDown && !inputStates.p1AnimationPlayed) {
    // TODO: Make player1 strike pose and hold it.
    // You may want to set something like PLAYERS_STATE.needToAnimatedP1DanceMove = true, then use that in the update() method to do the animation,
    // to keep the animation render out of this game logic method.

    ANIMATION_QUEUE.addAnimation(() => SPRITES.PLAYER_ONE.play(PLAYER_ONE_INPUT_ANIMATION_MAP[inputStates.p1LastKeyDown], true));

    inputStates.p1AnimationPlayed = true
  }

  if (inputStates.p2LastKeyDown && !inputStates.p2AnimationPlayed) {
    ANIMATION_QUEUE.addAnimation(() => SPRITES.PLAYER_TWO.play(PLAYER_TWO_INPUT_ANIMATION_MAP[inputStates.p2LastKeyDown], true));

    inputStates.p2AnimationPlayed = true;
  }

  const danceDirectionHasChanged =
    BATTLE_STATE.lastSuccessfulPlayer1AttackDirection !== inputStates.p1LastKeyDown ||
    GAME_LOGIC_CONFIG.ALLOW_SAME_DIRECTION_ATTACKS;

  // Check for a matching input first, before clearing. Allow users to get attacks in as late as possible.
  if (inputStates.p1LastKeyDown && inputStates.p2LastKeyDown && canAttack && danceDirectionHasChanged) {

    let isSameInput = Input.arePlayerInputsTheSame(inputStates.p1LastKeyDown, inputStates.p2LastKeyDown);

    if (isSameInput) {
      // In short, damage done to the enemy is scaled based on how close the inputs were together.
      const timeBetweenAttackInputs = Math.abs(inputStates.p1KeyDownTimestamp - inputStates.p2KeyDownTimestamp);
      const syncPercentage = (GAME_LOGIC_CONFIG.PLAYER_ATTACK_WINDOW_MILLIS - timeBetweenAttackInputs) / GAME_LOGIC_CONFIG.PLAYER_ATTACK_WINDOW_MILLIS;

      Util.debugLog(`Same input detected. Time between attacks: ${timeBetweenAttackInputs}. Sync percent: ${syncPercentage}.`);

      // TODO: Any animations for when the players are in sync, e.g. "NICE" text, sparkles/glow, transition frames back to idle, etc.
      growDamageRing(inputStates.p1LastKeyDown, syncPercentage);

      BATTLE_STATE.lastSuccessfulPlayerAttackTimestamp = time;
      BATTLE_STATE.lastSuccessfulPlayer1AttackDirection = inputStates.p1LastKeyDown;
    } else {
      // TODO: Whiff or move cancellation logic.
    }
  }

  // Clear inputs if the last input was more than TIMEOUT seconds ago.
  if (inputStates.p1KeyDownTimestamp && time - inputStates.p1KeyDownTimestamp > GAME_LOGIC_CONFIG.PLAYER_ACTION_DURATION_MILLIS) {
    Util.debugLog(`Clearing p1 inputs. Last input was at ${inputStates.p1KeyDownTimestamp} and time is ${time}`);
    PLAYERS_STATE.resetP1Inputs();
  }

  if (inputStates.p2KeyDownTimestamp && time - inputStates.p2KeyDownTimestamp > GAME_LOGIC_CONFIG.PLAYER_ACTION_DURATION_MILLIS) {
    Util.debugLog(`Clearing p2 inputs. Last input was at ${inputStates.p1KeyDownTimestamp} and time is ${time}`);
    PLAYERS_STATE.resetP2Inputs();
  }
}

// Direction of attack and how close the players were to being in sync (1.0 === players pressed at same millisecond)
function growDamageRing(attackMoveDirection, playerSyncPercentage) {
  const ringIncreaseAmount = (playerSyncPercentage * GAME_LOGIC_CONFIG.PERCENT_RING_GROWTH_PER_SYNCED_DANCE_MOVE) / 100;
  BATTLE_STATE.playerAttackProgressPercent = Math.min(BATTLE_STATE.playerAttackProgressPercent + ringIncreaseAmount, 1);
  Util.debugLog(`Growing attack ring with direction: ${attackMoveDirection} and player sync of ${playerSyncPercentage} percent. Increase amount: ${ringIncreaseAmount}.`);
}

function decreaseDamageRingOnTick() {
  const ringDecreaseAmountPerFrame = 100 / ((GAME_LOGIC_CONFIG.FULL_RING_SHRINK_TIME_MILLIS / 1000) * 60);
  const normalizedDecreaseAmount = ringDecreaseAmountPerFrame / 100;
  BATTLE_STATE.playerAttackProgressPercent = Math.max(BATTLE_STATE.playerAttackProgressPercent - normalizedDecreaseAmount, 0);
}

function growBossAttackMeter() {
  const meterGrowthAmount = 100 / ((GAME_LOGIC_CONFIG.BOSS_ATTACK_BAR_GROWTH_TIME_MILLIS / 1000) * 60);
  const normalizedIncreaseAmount = meterGrowthAmount / 100;
  BATTLE_STATE.bossAttackProgressPercent = Math.min(BATTLE_STATE.bossAttackProgressPercent + normalizedIncreaseAmount, 1);
}

// Main game logic update method.
function updateGame(time, delta, currentFrameNumber) {
  processInputs(time);

  growBossAttackMeter();

  if (BATTLE_STATE.playerAttackProgressPercent >= 1) {
    // TODO: Do damage to boss, do any boss reeling animation, pause boss attack meter?

    BATTLE_STATE.playerAttackProgressPercent = 0;
  }

  if (BATTLE_STATE.bossAttackProgressPercent >= 1) {
    // TODO: Do damage to players, do any player reeling animations

    BATTLE_STATE.bossAttackProgressPercent = 0;
  }

  // Check boss first, be lenient on players.
  if (BOSS_STATE.bossHealth === 0) {
    // TODO: Player beat boss, play boss death, pause inputs, victory music, then load next tutorial scene
    // this.scene.start(levelData.nextLevelSceneName, currentGameAndLevelData());
  }

  if (PLAYERS_STATE.health === 0) {
    // TODO: Players have lost. Transition to game over screen.
    // Can scenes do a transition animation? Fadeout / RPG-style checkerboard?
    // this.scene.start(levelData.gameOverSceneName, currentGameData());
  }

  decreaseDamageRingOnTick();
}

