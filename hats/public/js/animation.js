"use strict";

export function createCharacterAnimations(phaser, character) {
  phaser.anims.create({
    key: 'idle',
    frames: phaser.anims.generateFrameNames('character', { prefix: 'idle', start: 1, end: 2, zeroPad: 2 }),
    frameRate: 4,
    repeat: -1
  });
  
  phaser.anims.create({
    key: 'left',
    frames: phaser.anims.generateFrameNames('character', { prefix: 'left', start: 1, end: 3, zeroPad: 2 }),
    frameRate: 6,
    repeat: 0
  });
  
  phaser.anims.create({
    key: 'right',
    frames: phaser.anims.generateFrameNames('character', { prefix: 'right', start: 1, end: 3, zeroPad: 2 }),
    frameRate: 6,
    repeat: 0
  });
  
  phaser.anims.create({
    key: 'up',
    frames: phaser.anims.generateFrameNames('character', { prefix: 'up', start: 1, end: 3, zeroPad: 2 }),
    frameRate: 8,
    repeat: 0
  });
  
  phaser.anims.create({
    key: 'down',
    frames: phaser.anims.generateFrameNames('character', { prefix: 'down', start: 1, end: 3, zeroPad: 2 }),
    frameRate: 6,
    repeat: 0
  });
}