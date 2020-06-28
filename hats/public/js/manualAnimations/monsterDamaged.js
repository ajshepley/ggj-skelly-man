"use strict";

export function monsterDamagedAnimation() {
  return {
    startFrame: currentFrameNumber,
    animationLength: 60,
    flashStrength: 1.0,
    step: function (time, currentFrameNumber) {
      if (currentFrameNumber === this.startFrame) {
        SPRITES.BOSS.play('monster_damaged', true);
      }

      if ((currentFrameNumber - this.startFrame) > this.animationLength) {
        SPRITES.BOSS.play('monster_idle', true);
      }
    },
    isDone: function (time, currentFrameNumber) {
      return (currentFrameNumber - this.startFrame) > this.animationLength;
    }
  };
}
