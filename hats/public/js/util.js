"use strict";

const ENABLE_DEBUG_LOGGING = false;

export function debugLog(message) {
  if (ENABLE_DEBUG_LOGGING) {
    console.log(message);
  }
}

export function randomHexColor() {
  let FFFFFF = 16777215;
  let DDDDDD = 14540253;
  return '0x' + Math.floor((FFFFFF - DDDDDD) * Math.random() + DDDDDD).toString(16);
}
