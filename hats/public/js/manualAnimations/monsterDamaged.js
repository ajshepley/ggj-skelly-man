"use strict";
export function monsterDamagedAnimation(SPRITES, BATTLE_STATE, initialFrameNumber) {
  return {
    startFrame: initialFrameNumber,
    animationLength: 60,
    flashStrength: 1.0,

    step: function (time, currentFrameNumber) {
      const elapseFrames = (currentFrameNumber - this.startFrame);

      if (elapseFrames == 0) {
        BATTLE_STATE.playerAttackSyncMeter.clearSyncMeter();
        SPRITES.FIREBALL.visible = true;
      }

      if (elapseFrames < 40) {
        SPRITES.FIREBALL.y = SPRITES.FIREBALL.y - 3;
        SPRITES.FIREBALL.setScale(0.9 * (40 - elapseFrames)/40 + 0.1)
      }

      if (elapseFrames === 40) {
        SPRITES.BOSS.play('monster_damaged', true);
        
        BATTLE_STATE.playerAttackSyncMeter.drawSyncMeterOutline();
        SPRITES.FIREBALL.visible = false;
        // TODO: have config for starting location
        SPRITES.FIREBALL.x = 1920 * 0.5;
        SPRITES.FIREBALL.y = 1080 * 0.75
      }

      if (elapseFrames > this.animationLength) {
        SPRITES.BOSS.play('monster_idle', true);
      }
    },
    isDone: function (time, currentFrameNumber) {
      const elapseFrames = (currentFrameNumber - this.startFrame);
      return elapseFrames > this.animationLength;
    }
  };
}
