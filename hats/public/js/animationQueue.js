"use strict";

import * as Util from './util.js';

export function create() {
  return {
    animations: [],
    manualAnimations: [],

    // Must be a lambda or anonymous function.
    addAnimation: function(animationFunction) {
      // why j, why? https://stackoverflow.com/questions/5999998/check-if-a-variable-is-of-function-type
      if (typeof animationFunction === "function" || {}.toString.call(animationFunction) === '[object Function]') {
        this.animations.push(animationFunction);
      } else {
        Util.debugLog(`Animation object [${animationFunction}] is not a function or lambda.`);
      }
    },

    // Object must implement the functions 'step(time, currentFrameNumber)' and 'isDone()'.
    addManualAnimation: function(manualAnimationObject) {
      if (typeof manualAnimationObject.step !== 'function') {
        Util.debugLog(`Manual animation object [${manualAnimationObject}] does not implement step(), and cannot be enqueued.`);
        return;
      }

      if (typeof manualAnimationObject.isDone !== 'function') {
        Util.debugLog(`Manual animation object [${manualAnimationObject}] does not implement isDone(), and cannot be enqueued.`);
        return;
      }

      this.manualAnimations.push(manualAnimationObject);
    },

    playAllAnimationsAndRemove: function() {
      while(this.animations.length > 0) {
        try {
          this.animations.shift().call();
        } catch (error) {
          Util.debugLog("Error playing animation.");
          console.log(error);
        }
      }
    },

    // Manual animations are js objects that are doing an animation on each frame using internal logic,
    // e.g. meters, drawn text, etc.
    // Must implement the functions 'step(time, currentFrameNumber)' and 'isDone()'.
    playManualAnimationsAndRemoveIfDone: function (time, currentFrameNumber) {
      this.manualAnimations.forEach(element => {
        element.step(time, currentFrameNumber);
      });

      this.manualAnimations = this.manualAnimations.filter(element => !element.isDone());
    },

    reset: function() {
      this.animations = [];
      this.manualAnimations = [];
    }
  };
}
