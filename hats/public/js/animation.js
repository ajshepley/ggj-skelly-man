"use strict";

export function createCharacterAnimations(phaser, prefix) {
  phaser.anims.create({
    key: `${prefix}idle`,
    frames: phaser.anims.generateFrameNames(`${prefix}character`, { prefix: 'idle', start: 1, end: 2, zeroPad: 2 }),
    frameRate: 4,
    repeat: -1
  });
  
  phaser.anims.create({
    key: `${prefix}left`,
    frames: phaser.anims.generateFrameNames(`${prefix}character`, { prefix: 'left', start: 1, end: 3, zeroPad: 2 }),
    frameRate: 6,
    repeat: 0
  });
  
  phaser.anims.create({
    key: `${prefix}right`,
    frames: phaser.anims.generateFrameNames(`${prefix}character`, { prefix: 'right', start: 1, end: 3, zeroPad: 2 }),
    frameRate: 6,
    repeat: 0
  });
  
  phaser.anims.create({
    key: `${prefix}up`,
    frames: phaser.anims.generateFrameNames(`${prefix}character`, { prefix: 'up', start: 1, end: 3, zeroPad: 2 }),
    frameRate: 6,
    repeat: 0
  });
  
  phaser.anims.create({
    key: `${prefix}down`,
    frames: phaser.anims.generateFrameNames(`${prefix}character`, { prefix: 'down', start: 1, end: 3, zeroPad: 2 }),
    frameRate: 6,
    repeat: 0
  });
}