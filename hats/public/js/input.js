"use strict";

import * as Util from './util.js';

export const INPUT_DIRECTIONS = {
  LEFT: "left",
  RIGHT: "right",
  UP: "up",
  DOWN: "down"
};

// By squishing player inputs down to ULRD, we can do 'P1_INPUT === P2_INPUT' checks later.
export const PLAYER_INPUTS = {
  'ArrowUp': INPUT_DIRECTIONS.UP,
  'ArrowDown': INPUT_DIRECTIONS.DOWN,
  'ArrowLeft': INPUT_DIRECTIONS.LEFT,
  'ArrowRight': INPUT_DIRECTIONS.RIGHT,
  'w': INPUT_DIRECTIONS.UP,
  'W': INPUT_DIRECTIONS.UP,
  's': INPUT_DIRECTIONS.DOWN,
  'S': INPUT_DIRECTIONS.DOWN,
  'a': INPUT_DIRECTIONS.LEFT,
  'A': INPUT_DIRECTIONS.LEFT,
  'd': INPUT_DIRECTIONS.RIGHT,
  'D': INPUT_DIRECTIONS.RIGHT
};

const Owner = {
  P1: 'P1',
  P2: 'P2'
};

const KEY_OWNER = {
  'W': Owner.P1,
  'w': Owner.P1,
  'A': Owner.P1,
  'a': Owner.P1,
  'S': Owner.P1,
  's': Owner.P1,
  'D': Owner.P1,
  'd': Owner.P1,
  'ArrowUp': Owner.P2,
  'ArrowDown': Owner.P2,
  'ArrowLeft': Owner.P2,
  'ArrowRight': Owner.P2
};

// See main.js:INPUT_STATE
export function initInput(phaserGame, inputState) {
  Util.debugLog(`Input init. Phaser game: ${phaserGame}, inputState: ${inputState}`);
  phaserGame.input.keyboard.on('keydown', function (event) {
    const key = event.key;
    const playerKey = PLAYER_INPUTS[key];

    Util.debugLog(`Key down: ${key}, which corresponds to: ${playerKey}. Timestamp: ${event.timeStamp}.`);

    if (!playerKey) {
      return;
    }

    // We could shorten this by making P1_KEYS and P2_KEYS submembers of inputState, but it's not worth it.
    if (!inputState.p1LastKeyDown && KEY_OWNER[key] == Owner.P1) {
      // https://www.w3schools.com/jsref/event_timestamp.asp
      inputState.p1LastKeyDown = playerKey;
      inputState.p1KeyDownTimestamp = event.timeStamp;
    } else if (!inputState.p2LastKeyDown && KEY_OWNER[key] == Owner.P2) {
      inputState.p2LastKeyDown = playerKey;
      inputState.p2KeyDownTimestamp = event.timeStamp;
    }
  });
}
