"use strict";

// This file exists more to explain our loaded constants.
// Please keep in sync with gameConfig.json and the respective usages.
// Config and globals for non-phaser game logic, e.g. sync timings, difficulty, etc.

// The following constants are loaded in a json file, accessed like config.allowSameDirectionAttacks and so on.

export const GAME_CONFIG_ASSET_KEY = 'gameConfig';
export const GAME_CONFIG_ASSET_PATH = './assets/gameConfig.json';

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

