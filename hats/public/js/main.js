"use strict";

import * as Util from './util.js';
import * as Input from './input.js';
import { SyncMeter } from './SyncMeter.js';
import { BossMeter } from './BossMeter.js';


// ----------------------------------------------------
// Configs, constants and global states.
// ----------------------------------------------------

const GAME_CONFIG = {
  type: Phaser.AUTO,
  width: 1600,
  height: 900,
  physics: {
    // Unneeded?
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: {
    key: 'main',
    preload: preload,
    create: create,
    update: update
  }
};

const BOSS_CONFIG = {
  bossMeterWidth: 400,

}

const game = new Phaser.Game(GAME_CONFIG);

const BATTLE_STATE = {
  playerAttackSyncMeter: null,
  bossAttackTimerMeter: null
}

const PLAYERS_STATE = {
  health: 100,

  PLAYERS_INPUT_STATES: {
    P1_LAST_KEY_DOWN: null,
    P2_LAST_KEY_DOWN: null,
    P1_KEY_DOWN_TIMESTAMP: null,
    P2_KEY_DOWN_TIMESTAMP: null
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
}


// ----------------------------------------------------
// Phaser logic functions, game loop and tick.
// ----------------------------------------------------

function preload() {
  // background images
  // this.load.image('background1', 'assets/background1.png');

  // player animations
  // this.load.atlas('player', 'assets/skelly_spritesheet.png', 'assets/skelly_sprites.json');

  // audio
  // this.load.audio('punch1', 'assets/punch1.mp3');
}

function create() {
  Util.debugLog("test");

  BATTLE_STATE.playerAttackSyncMeter = new SyncMeter(this, GAME_CONFIG.width * 0.5, GAME_CONFIG.height * 0.67, 80, 0x00ff00);

  BATTLE_STATE.bossAttackTimerMeter = new BossMeter(this, GAME_CONFIG.width * 0.5 - BOSS_CONFIG.bossMeterWidth * 0.5,
    GAME_CONFIG.height * 0.1, BOSS_CONFIG.bossMeterWidth, 50, 0xff0000);

  // add music
  // music = this.sound.add('music');

  // add background
  // this.add.image(1050, 350, 'background1');

  // tiles for the ground layer
  // var groundTiles = map.addTilesetImage('tiles');
  // create the ground layer
  // groundLayer = map.createDynamicLayer('World', groundTiles, 0, 0);

  // idle with only one frame, so repeat is not needed
  //   this.anims.create({
  //     key: 'idle',
  //     frames: this.anims.generateFrameNames('player', { prefix: 'idle', start: 1, end: 2, zeroPad: 2 }),
  //     frameRate: 6,
  // });

  // input
  // cursors = this.input.keyboard.createCursorKeys();

  // set bounds so the camera won't go outside the game world
  // this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  // make the camera follow the player
  // this.cameras.main.startFollow(player);

  // set background color, so the sky is not black
  // this.cameras.main.setBackgroundColor('#ccccff');

  // this text will show the score
  // text = this.add.text(20, 570, '0', {
  //     fontSize: '20px',
  //     fill: '#ffffff'
  // });
  // fix the text to the camera
  // text.setScrollFactor(0);

  // this.input.keyboard.on('keydown_A', function (event) {
  //   isKeyDown.a = true;
  // });

  // this.input.on('pointerdown', function (pointer) {
  //   music.play();
  // });

  Input.initInput(this, PLAYERS_STATE.PLAYERS_INPUT_STATES);
}

// function loadEnemyAnimations(context) {
//   context.anims.create({
//       key: 'patient0_idle',
//       frames: context.anims.generateFrameNames('enemyBase', { prefix: 'pidle', start: 1, end: 2, zeroPad: 2 }),
//       frameRate: 6,
//   });
// }

function update(time, delta) {
  let nextFrame = Math.floor(time / (1_000 / 60));

  inputHandler(time);

  if (nextFrame < 100) {
    BATTLE_STATE.playerAttackSyncMeter.updateFill(nextFrame / 100);
    BATTLE_STATE.bossAttackTimerMeter.updateFill(1 - nextFrame / 100);
  }

  // text.setText(`Dr. Skelly's Bone Health: ${health}`);
  //   skellymenText.setText(`Skelly Men Saved: ${skellymenSaved} out of ${SKELLIES_SAVED_TO_WIN}`);
}

function inputHandler(time) {

  // if (isKeyDown.a || isKeyDown.s || isKeyDown.d) {
  //     if (isKeyDown.a) {
  //         playerAttack = PLAYER_DAMAGE_TYPES.MID_JAB;
  //         isKeyDown.a = false;
  //     }
  //     else if (isKeyDown.s) {
  //         playerAttack = PLAYER_DAMAGE_TYPES.UPPERCUT;
  //         isKeyDown.s = false;
  //     }
  //     else if (isKeyDown.d) {
  //         playerAttack = PLAYER_DAMAGE_TYPES.KICK;
  //         isKeyDown.d = false;
  //     }
  //     isPlayerAttacking = true;
  //     timePlayerStartedAttack = time;
  // }
  // else if (cursors.left.isDown) {
  //     player.body.setVelocityX(-PLAYER_MOVE_SPEED);
  //     player.anims.play('walk', true); // walk left
  //     player.setOrigin(1, player.originY); // left-aligned sprites, so we set the origin to the far right when flipping.
  //     player.flipX = true; // flip the sprite to the left
  // }
  // else if (cursors.right.isDown) {
  //     player.body.setVelocityX(PLAYER_MOVE_SPEED);
  //     player.anims.play('walk', true);
  //     player.setOrigin(0.5, player.originY); // Reset the origin to the middle when the left-aligned sprite faces right.
  //     player.flipX = false; // use the original sprite looking to the right
  // }
  // else {
  //     player.body.setVelocityX(0);
  //     player.anims.play('idle', true);
  // }
}


