"use strict";

// This file exists more to explain our loaded constants.
// Please keep in sync with gameConfig.json and the respective usages.
// Config and globals for non-phaser game logic, e.g. sync timings, difficulty, etc.

// The following constants are loaded in a json file, accessed like config.allowSameDirectionAttacks and so on.

export const GAME_CONFIG_ASSET_KEY = 'gameConfig';
export const GAME_CONFIG_ASSET_PATH = './assets/gameConfig.json';

const GAME_LOGIC_CONFIG = {
  // Can the user grow the dance ring by pressing the same direction multiple times in a row?
  allowSameDirectionAttacks: false,

  // How many millis until the boss bar is full, from 0?
  bossAttackBarGrowthTimeMillis: 10000,

  // Lockout time before another input is accepted for a player.
  // Also used to determine how close P2 and P1 are to each other's inputs.
  playerActionDurationMillis: 250,

  // How far away can two player inputs be before we disregard them?
  // For now, this can be the same as the player action duration. We can increase difficulty by lowering this value.
  playerAttackWindowMillis: 250,

  // When the players get hit, how long before they are allowed to do inputs and attack?
  playerHitstunTimeMillis: 1100,

  // Only change/render the current circle and enemy boss meter fill every N frames.
  // This can be tied to the BPM or rhythm of a song.
  renderCircleEveryNFrames: 10,
  renderBossBarEveryNFrames: 30,

  // The damage ring will grow by this percent each time the players sync a move.
  percentRingGrowthPerSyncedDanceMove: 20,

  // How long does a full ring take to shrink to 0? Used for constant ring shrinkage.
  fullRingShrinkTimeMillis: 20000,

  // When the players max out a ring, how much damage should they do to the boss health?
  damagePerFullRing: 20
};

const BOSS_CONFIG = {
  bossMeterWidth: 400,
};

