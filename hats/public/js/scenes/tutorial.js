import { game, PHASER_GAME_CONFIG } from '../main.js';

export let tutorialScene = new Phaser.Scene('Tutorial');

const SCENE_OBJECTS = {
    BOX: null,
}

tutorialScene.create = function() {
    // Placeholder graphics
    SCENE_OBJECTS.BOX = this.add.graphics();
    SCENE_OBJECTS.BOX.fillStyle(0xffffff, 1);
    SCENE_OBJECTS.BOX.fillRect(PHASER_GAME_CONFIG.width / 2 - 100, PHASER_GAME_CONFIG.height / 2 - 100, 200, 200);

    game.input.mouse.capture = true;
}

tutorialScene.update = function() {
    // Go to next scene on click
    if (game.input.activePointer.isDown) {
        this.scene.start('main');
    }
}
