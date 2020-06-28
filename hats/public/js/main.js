"use strict";

import * as Util from './util.js';
import * as Input from './input.js';
import * as Animation from './animation.js';
import * as AnimationQueue from './animationQueue.js';
import { SyncMeter } from './SyncMeter.js';
import { BossMeter } from './BossMeter.js';
import { monsterDamagedAnimation } from './manualAnimations/monsterDamaged.js';

// ----------------------------------------------------
// Configs and constants - configure in gameConfig.json, configInfo.js and boot.js
// ----------------------------------------------------

let PHASER_GAME_CONFIG = null;
let GAME_CONFIG = null;
let LEVEL_INDEX = 0;

// Config and globals for non-phaser game logic, e.g. sync timings, difficulty, etc.
let GAME_LOGIC_CONFIG = null;
let BOSS_CONFIG = null;

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
  health: 100,
  reset: function () {
    this.health = 100;
  }
};

const SPRITES = {
  PLAYER_ONE: null,
  PLAYER_TWO: null,
  FIREBALL: null,
  BOSS: null
}

const SOUNDS = {
  BATTLE_MUSIC: null
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

// Needs to match the types in gameConfig.json.
export let mainScene = new Phaser.Scene('mainScene');

// Init is called first, by `this.scene.start('main', data);`
mainScene.init = function (data) {
  resetAll();

  // TODO: Pull the scene config data - which enemy are we fighting/level/player data? from data.
  // See: https://phaser.io/docs/2.3.0/Phaser.State.html#init
  PHASER_GAME_CONFIG = data.PHASER_GAME_CONFIG;
  LEVEL_INDEX = data.levelIndex;
  GAME_CONFIG = data.config;
  GAME_LOGIC_CONFIG = GAME_CONFIG.stages[LEVEL_INDEX].gameLogicConfig;
  BOSS_CONFIG = GAME_CONFIG.stages[LEVEL_INDEX].bossConfig;
}

mainScene.preload = function () {
  // this.loadImage, loadAtlas, loadAudio
  this.load.atlas('left_character', 'assets/left_character.png', 'assets/left_character.json');
  this.load.atlas('right_character', 'assets/right_character.png', 'assets/right_character.json');
  this.load.atlas('monster', 'assets/monster.png', 'assets/monster.json');

  this.load.image('background', 'assets/background.png');
  this.load.image('balcony', 'assets/balcony.png');
  this.load.image('auras', 'assets/auras.png');
  this.load.image('fireball', 'assets/fireball.png');
  
  this.load.audio('battle_music', GAME_CONFIG.stages[LEVEL_INDEX].musicPath);
}

mainScene.create = function () {
  addImages(this);

  BATTLE_STATE.playerAttackSyncMeter = new SyncMeter(
    this,
    PHASER_GAME_CONFIG.width * 0.5,
    PHASER_GAME_CONFIG.height * 0.67,
    120,
    0x2FF8FB
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

  SOUNDS.BATTLE_MUSIC = this.sound.add('battle_music');
  SOUNDS.BATTLE_MUSIC.play();
}

function addImages(phaserScene) {
  // Background
  phaserScene.add.image(PHASER_GAME_CONFIG.width / 2, PHASER_GAME_CONFIG.height / 2, 'background');
  // Monster
  SPRITES.BOSS = phaserScene.add.sprite(PHASER_GAME_CONFIG.width / 2, PHASER_GAME_CONFIG.height / 2, 'monster');
  Animation.createBossAnimations(phaserScene, 'monster_');
  SPRITES.BOSS.play('monster_idle', true);
  // Balcony
  phaserScene.add.image(PHASER_GAME_CONFIG.width / 2, PHASER_GAME_CONFIG.height / 2, 'balcony');

  // Characters
  createCharacter(phaserScene, "PLAYER_ONE", PHASER_GAME_CONFIG.width * 0.24, "left_");
  createCharacter(phaserScene, "PLAYER_TWO", PHASER_GAME_CONFIG.width * 0.76, "right_");

  // Fireball
  SPRITES.FIREBALL = phaserScene.physics.add.image(PHASER_GAME_CONFIG.width * 0.5, PHASER_GAME_CONFIG.height * 0.75, 'fireball');
  SPRITES.FIREBALL.visible = false;

  // Auras
  phaserScene.add.image(PHASER_GAME_CONFIG.width / 2, PHASER_GAME_CONFIG.height / 2, 'auras');
}

function createCharacter(phaser, sprite, position, prefix) {
  SPRITES[sprite] = phaser.add.sprite(position, PHASER_GAME_CONFIG.height * 0.67, `${prefix}character`);

  Animation.createCharacterAnimations(phaser, prefix);
  SPRITES[sprite].play(`${prefix}idle`, true);
}

mainScene.update = function (time, delta) {
  let currentFrameNumber = Math.floor(time / (1_000 / 60));

  // Engine/logic update.
  updateGame(time, delta, currentFrameNumber);

  // Render updates.
  // TODO: These meters could be initialized with these render constants, and played by the manual animation queue instead.
  if (currentFrameNumber % GAME_LOGIC_CONFIG.renderCircleEveryNFrames === 0) {
    Util.debugLog(`Player attack progress: ${BATTLE_STATE.playerAttackProgressPercent}`);
    BATTLE_STATE.playerAttackSyncMeter.updateFill(BATTLE_STATE.playerAttackProgressPercent);
  }

  if (currentFrameNumber % GAME_LOGIC_CONFIG.renderBossBarEveryNFrames === 0) {
    Util.debugLog(`Boss attack progress: ${BATTLE_STATE.bossAttackProgressPercent}`);
    BATTLE_STATE.bossAttackTimerMeter.updateFill(BATTLE_STATE.bossAttackProgressPercent);
  }

  ANIMATION_QUEUE.playAllAnimationsAndRemove();
  ANIMATION_QUEUE.playManualAnimationsAndRemoveIfDone(time, currentFrameNumber);

  // set texts, etc.
}

function loadNewStage() {
  SOUNDS.BATTLE_MUSIC.stop();
  const levelNameToLoad = GAME_CONFIG.stages[LEVEL_INDEX + 1].type;
  Util.debugLog(`Loading level ${LEVEL_INDEX + 1} of type ${levelNameToLoad}.`);

  mainScene.scene.start(levelNameToLoad, { PHASER_GAME_CONFIG: PHASER_GAME_CONFIG, levelIndex: LEVEL_INDEX + 1, config: GAME_CONFIG });
}

// Called when the state shuts down, e.g. when transitioning to another state.
mainScene.shutdown = function () {
  resetAll();
}

function resetAll() {
  resetStates();
  ANIMATION_QUEUE.reset();
  resetConfigs();
}

function resetStates() {
  BATTLE_STATE.reset();
  BOSS_STATE.reset();
  PLAYERS_STATE.reset();
}

function resetConfigs() {
  GAME_CONFIG = null;
  PHASER_GAME_CONFIG = null;
  GAME_LOGIC_CONFIG = null;
  BOSS_CONFIG = null;
  LEVEL_INDEX = 0;
}

// ----------------------------------------------------
// Game logic for boss and any special player logic.
//
// Do not call `thing.play()` and other animation methods here - enqueue them in the ANIMATION_QUEUE if possible.
// ----------------------------------------------------

// TODO: Abstract segments to their own methods.
function processInputs(time) {
  const inputStates = PLAYERS_STATE.PLAYERS_INPUT_STATES;
  const canAttack = time - BATTLE_STATE.lastSuccessfulPlayerAttackTimestamp > GAME_LOGIC_CONFIG.playerActionDurationMillis;

  if (inputStates.p1LastKeyDown && !inputStates.p1AnimationPlayed) {
    ANIMATION_QUEUE.addAnimation(() => SPRITES.PLAYER_ONE.play(PLAYER_ONE_INPUT_ANIMATION_MAP[inputStates.p1LastKeyDown], true));
    inputStates.p1AnimationPlayed = true
  }

  if (inputStates.p2LastKeyDown && !inputStates.p2AnimationPlayed) {
    ANIMATION_QUEUE.addAnimation(() => SPRITES.PLAYER_TWO.play(PLAYER_TWO_INPUT_ANIMATION_MAP[inputStates.p2LastKeyDown], true));
    inputStates.p2AnimationPlayed = true;
  }

  const danceDirectionHasChanged =
    BATTLE_STATE.lastSuccessfulPlayer1AttackDirection !== inputStates.p1LastKeyDown ||
    GAME_LOGIC_CONFIG.allowSameDirectionAttacks;

  // Check for a matching input first, before clearing. Allow users to get attacks in as late as possible.
  if (inputStates.p1LastKeyDown && inputStates.p2LastKeyDown && canAttack && danceDirectionHasChanged) {

    let isSameInput = Input.arePlayerInputsTheSame(inputStates.p1LastKeyDown, inputStates.p2LastKeyDown);

    if (isSameInput) {
      // In short, damage done to the enemy is scaled based on how close the inputs were together.
      const timeBetweenAttackInputs = Math.abs(inputStates.p1KeyDownTimestamp - inputStates.p2KeyDownTimestamp);
      const syncPercentage = (GAME_LOGIC_CONFIG.playerAttackWindowMillis - timeBetweenAttackInputs) / GAME_LOGIC_CONFIG.playerAttackWindowMillis;

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
  if (inputStates.p1KeyDownTimestamp && time - inputStates.p1KeyDownTimestamp > GAME_LOGIC_CONFIG.playerActionDurationMillis) {
    Util.debugLog(`Clearing p1 inputs. Last input was at ${inputStates.p1KeyDownTimestamp} and time is ${time}`);
    PLAYERS_STATE.resetP1Inputs();
  }

  if (inputStates.p2KeyDownTimestamp && time - inputStates.p2KeyDownTimestamp > GAME_LOGIC_CONFIG.playerActionDurationMillis) {
    Util.debugLog(`Clearing p2 inputs. Last input was at ${inputStates.p1KeyDownTimestamp} and time is ${time}`);
    PLAYERS_STATE.resetP2Inputs();
  }
}

// Direction of attack and how close the players were to being in sync (1.0 === players pressed at same millisecond)
function growDamageRing(attackMoveDirection, playerSyncPercentage) {
  const ringIncreaseAmount = (playerSyncPercentage * GAME_LOGIC_CONFIG.percentRingGrowthPerSyncedDanceMove) / 100;
  BATTLE_STATE.playerAttackProgressPercent = Math.min(BATTLE_STATE.playerAttackProgressPercent + ringIncreaseAmount, 1);
  Util.debugLog(`Growing attack ring with direction: ${attackMoveDirection} and player sync of ${playerSyncPercentage} percent. Increase amount: ${ringIncreaseAmount}.`);
}

function decreaseDamageRingOnTick() {
  const ringDecreaseAmountPerFrame = 100 / ((GAME_LOGIC_CONFIG.fullRingShrinkTimeMillis / 1000) * 60);
  const normalizedDecreaseAmount = ringDecreaseAmountPerFrame / 100;
  BATTLE_STATE.playerAttackProgressPercent = Math.max(BATTLE_STATE.playerAttackProgressPercent - normalizedDecreaseAmount, 0);
}

function growBossAttackMeter() {
  const meterGrowthAmount = 100 / ((GAME_LOGIC_CONFIG.bossAttackBarGrowthTimeMillis / 1000) * 60);
  const normalizedIncreaseAmount = meterGrowthAmount / 100;
  BATTLE_STATE.bossAttackProgressPercent = Math.min(BATTLE_STATE.bossAttackProgressPercent + normalizedIncreaseAmount, 1);
}

// Main game logic update method.
function updateGame(time, delta, currentFrameNumber) {
  processInputs(time);

  growBossAttackMeter();

  if (BATTLE_STATE.playerAttackProgressPercent >= 1) {
    // White flash animation on boss
    ANIMATION_QUEUE.addManualAnimation(monsterDamagedAnimation(SPRITES, BATTLE_STATE, currentFrameNumber));

    BOSS_STATE.health -= GAME_LOGIC_CONFIG.damagePerFullRing;

    // Interrupt boss's attack, restart player attack circle
    BATTLE_STATE.bossAttackProgressPercent = 0;
    BATTLE_STATE.playerAttackProgressPercent = 0;

    Util.debugLog(`Players attacked for ${GAME_LOGIC_CONFIG.damagePerFullRing} damage! Boss health is now ${BOSS_STATE.health}.`);
  }

  if (BATTLE_STATE.bossAttackProgressPercent >= 1) {
    // TODO: Do damage to players, do any player reeling animations
    PLAYERS_STATE.health -= BOSS_CONFIG.damagePerFullMeter;
    BATTLE_STATE.bossAttackProgressPercent = 0;

    Util.debugLog(`Boss attacked for ${BOSS_CONFIG.damagePerFullMeter} damage! Player health is now ${PLAYERS_STATE.health}.`);
  }

  // Check boss first, be lenient on players.
  if (BOSS_STATE.health <= 0) {
    // TODO: Player beat boss, play boss death, pause inputs, victory music, then load next tutorial scene

    loadNewStage();
  }

  if (PLAYERS_STATE.health <= 0) {
    // TODO: Players have lost. Transition to game over screen.
    // Can scenes do a transition animation? Fadeout / RPG-style checkerboard?
    // this.scene.start(levelData.gameOverSceneName, currentGameData());
  }

  decreaseDamageRingOnTick();
}

