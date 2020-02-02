var config = {
    type: Phaser.AUTO,
    width: 1400,
    height: 700,
    physics: {
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

var game = new Phaser.Game(config);

var map;
var player;
let enemies = [];
var cursors;
var groundLayer;
var text;
var score = 0;
let isKeyDown = {
    a: false,
    s: false,
    d: false
};
var playerAttack = '';

const ENABLE_DEBUG_LOGGING = true;

const TILE_SIZE = 70; // 70 pixels
const MAP_WIDTH_IN_TILES = 150;
const MAP_HEIGHT_IN_TILES = 10;
const FLOOR_SIZE_IN_TILES = 3;
const WALK_TILE_BUFFER_IN_TILES = 1;
const BACKGROUND_SIZE_IN_TILEs = MAP_HEIGHT_IN_TILES - (FLOOR_SIZE_IN_TILES + WALK_TILE_BUFFER_IN_TILES);

function preload() {
    // map made with Tiled in JSON format
    this.load.tilemapTiledJSON('map', 'assets/map.json');
    // tiles in spritesheet 
    this.load.spritesheet('tiles', 'assets/tiles.png', { frameWidth: 70, frameHeight: 70 });
    // player animations
    this.load.atlas('player', 'assets/skelly_spritesheet.png', 'assets/skelly_sprites.json');
    //enemy animations
    this.load.atlas('enemyBase', 'assets/patient0_spritesheet.png', 'assets/patient0_sprites.json');
    //enemy animations
    this.load.atlas('enemyLungs', 'assets/patient1_spritesheet.png', 'assets/patient1_sprites.json');
    //enemy animations
    this.load.atlas('enemyEyes', 'assets/patient2_spritesheet.png', 'assets/patient2_sprites.json');
    //enemy animations
    this.load.atlas('enemyGuts', 'assets/patient3_spritesheet.png', 'assets/patient3_sprites.json');
}

function create() {
    // load the map 
    map = this.make.tilemap({ key: 'map' });

    // tiles for the ground layer
    var groundTiles = map.addTilesetImage('tiles');
    // create the ground layer
    groundLayer = map.createDynamicLayer('World', groundTiles, 0, 0);
    // the player will collide with this layer
    groundLayer.setCollisionByExclusion([-1]);

    // set the boundaries of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    // create the player sprite    
    player = this.physics.add.sprite(PLAYER_SPRITE_SIZE.X, PLAYER_SPRITE_SIZE.Y, 'player');
    player.x = PLAYER_SPAWN_LOCATION.X;
    player.y = PLAYER_SPAWN_LOCATION.Y;
    player.body.setSize(player.width - 195, player.height);
    player.setCollideWorldBounds(true); // don't go out of the map

    // player will collide with the level tiles 
    this.physics.add.collider(groundLayer, player);

    // player walk animation
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('player', { prefix: 'walk', start: 1, end: 3, zeroPad: 2 }),
        frameRate: 9,
        repeat: -1
    });
    // idle with only one frame, so repeat is not neaded
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNames('player', { prefix: 'idle', start: 1, end: 2, zeroPad: 2 }),
        frameRate: 6,
    });
    // idle with only one frame, so repeat is not neaded
    this.anims.create({
        key: 'midjab',
        frames: this.anims.generateFrameNames('player', { prefix: 'midjab', start: 1, end: 2, zeroPad: 2 }),
        frameRate: 6,
    });
    // idle with only one frame, so repeat is not neaded
    this.anims.create({
        key: 'kick',
        frames: this.anims.generateFrameNames('player', { prefix: 'kick', start: 1, end: 2, zeroPad: 2 }),
        frameRate: 6,
    });
    // idle with only one frame, so repeat is not neaded
    this.anims.create({
        key: 'uppercut',
        frames: this.anims.generateFrameNames('player', { prefix: 'uppercut', start: 1, end: 3, zeroPad: 2 }),
        frameRate: 9,
    });

    loadEnemyAnimations(this);
    spawnEnemy(this, 0);

    cursors = this.input.keyboard.createCursorKeys();

    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // make the camera follow the player
    this.cameras.main.startFollow(player);

    // set background color, so the sky is not black    
    this.cameras.main.setBackgroundColor('#ccccff');

    // this text will show the score
    text = this.add.text(20, 570, '0', {
        fontSize: '20px',
        fill: '#ffffff'
    });
    // fix the text to the camera
    text.setScrollFactor(0);

    // Keyboard input listeners
    this.input.keyboard.on('keydown_A', function (event) {
        isKeyDown.a = true;
    });
    this.input.keyboard.on('keydown_S', function (event) {
        isKeyDown.s = true;
    });
    this.input.keyboard.on('keydown_D', function (event) {
        isKeyDown.d = true;
    });
}

// TODO: Move these constants to the top? Wherever they work for David.
const PLAYER_SPRITE_SIZE = {
    X: 216,
    Y: 216
};

const ENEMY_SPRITE_SIZE = {
    X: 162,
    Y: 235
}

const ENEMY_SPAWN_COUNT_LIMIT = 5;
const ENEMY_SPAWN_TIME_MILLIS = 3_000;
const PLAYER_MOVE_SPEED = 200;
const ENEMIES_HAVE_ENEMY_COLLISION = true;

const PLAYER_SPAWN_LOCATION = {
    X: 200,
    Y: 375
};

const ENEMY_TEST_SPAWN_LOCATION = {
    X: 1200,
    Y: 375
};

const ENEMY_STATES = [
    "0_noOrgans",
    "1_heartAndLungs",
    "2_eyes",
    "3_intestines"
];

const ENEMY_DAMAGE_PER_HIT = 10;

// The variable is constant but its members can change. Yavascript.
const PLAYER_STATE = {
    health: 100,
    takeDamage: function(amount) {
        if (amount === undefined) {
            var amount = ENEMY_DAMAGE_PER_HIT;
        }
        health -= amount;

        if (health <= 0) {
            this.killPlayer;
        }
    },
    killPlayer: function() {
        // TODO: Fill in, call global function, reset game, game over, etc.
    }
};

function loadEnemyAnimations(context) {
    context.anims.create({
        key: 'patient0_idle',
        frames: context.anims.generateFrameNames('enemyBase', { prefix: 'pidle', start: 1, end: 2, zeroPad: 2 }),
        frameRate: 6,
    });

    context.anims.create({
        key: 'patient0_walk',
        frames: context.anims.generateFrameNames('enemyBase', { prefix: 'pwalk', start: 1, end: 3, zeroPad: 2 }),
        frameRate: 9,
    });

    context.anims.create({
        key: 'patient0_attack',
        frames: context.anims.generateFrameNames('enemyBase', { prefix: 'pattack', start: 1, end: 5, zeroPad: 2 }),
        frameRate: 15,
    });

    context.anims.create({
        key: 'patient1_idle',
        frames: context.anims.generateFrameNames('enemyLungs', { prefix: 'pidle', start: 1, end: 2, zeroPad: 2 }),
        frameRate: 6,
    });

    context.anims.create({
        key: 'patient1_walk',
        frames: context.anims.generateFrameNames('enemyLungs', { prefix: 'pwalk', start: 1, end: 3, zeroPad: 2 }),
        frameRate: 9,
    });

    context.anims.create({
        key: 'patient1_attack',
        frames: context.anims.generateFrameNames('enemyLungs', { prefix: 'pattack', start: 1, end: 5, zeroPad: 2 }),
        frameRate: 15,
    });

    context.anims.create({
        key: 'patient2_idle',
        frames: context.anims.generateFrameNames('enemyEyes', { prefix: 'pidle', start: 1, end: 2, zeroPad: 2 }),
        frameRate: 6,
    });

    context.anims.create({
        key: 'patient2_walk',
        frames: context.anims.generateFrameNames('enemyEyes', { prefix: 'pwalk', start: 1, end: 3, zeroPad: 2 }),
        frameRate: 9,
    });

    context.anims.create({
        key: 'patient2_attack',
        frames: context.anims.generateFrameNames('enemyEyes', { prefix: 'pattack', start: 1, end: 5, zeroPad: 2 }),
        frameRate: 15,
    });

    context.anims.create({
        key: 'patient3_idle',
        frames: context.anims.generateFrameNames('enemyGuts', { prefix: 'pidle', start: 1, end: 2, zeroPad: 2 }),
        frameRate: 6,
    });

    context.anims.create({
        key: 'patient3_walk',
        frames: context.anims.generateFrameNames('enemyGuts', { prefix: 'pwalk', start: 1, end: 3, zeroPad: 2 }),
        frameRate: 9,
    });

    context.anims.create({
        key: 'patient3_attack',
        frames: context.anims.generateFrameNames('enemyGuts', { prefix: 'pattack', start: 1, end: 5, zeroPad: 2 }),
        frameRate: 15,
    });
}

let lastEnemySpawnTime = 0;
function spawnEnemy(context, time) {
    let enemyCount = enemies.length;
    if (enemyCount >= ENEMY_SPAWN_COUNT_LIMIT) {
        return;
    }

    debugLog(`Spawning enemy #${enemyCount + 1}`);

    lastEnemySpawnTime = time;

    let enemy = context.physics.add.sprite(ENEMY_SPRITE_SIZE.X, ENEMY_SPRITE_SIZE.Y, 'enemyBase');
    enemy.body.setSize(enemy.width, enemy.height);
    enemy.setCollideWorldBounds(true);
    context.physics.add.collider(groundLayer, enemy);
    context.physics.add.collider(player, enemy);
    enemy.x = ENEMY_TEST_SPAWN_LOCATION.X;
    enemy.y = ENEMY_TEST_SPAWN_LOCATION.Y;
    enemy.tint = randomHexColor();

    if (ENEMIES_HAVE_ENEMY_COLLISION) {
        enemies.forEach(existingEnemy => context.physics.add.collider(existingEnemy, enemy));
    }

    enemyObject = {
        sprite: enemy,
        velocity: randomEnemyXVelocity(),
        stateIndex: 0,
        takeDamage: function(amount) {
            if (amount === undefined) {
                var amount = 1;
            }
            this.stateIndex += amount;
            // Clamp to max enemy state size.
            this.stateIndex = Math.min(ENEMY_STATES.length, this.stateIndex);
        },
        getState: function() {
            // This should be unnecessary, but JS, so we'll be careful.
            if (this.stateIndex < ENEMY_STATES.length) {
                return ENEMY_STATES[this.stateIndex];
            } else {
                return ENEMY_STATES[ENEMY_STATES.length - 1];
            }
        }
    };

    enemies.push(enemyObject);
}

var currentFrame = 1;
var isPlayerAttacking = false;
var timePlayerStartedAttack = 0;

function update(time, delta) {
    let nextFrame = Math.floor(time / (1_000 / 60));
    if (currentFrame < nextFrame) {
        currentFrame = nextFrame;
    }

    if (time - lastEnemySpawnTime > ENEMY_SPAWN_TIME_MILLIS) {
        spawnEnemy(this, time);
    }

    enemies.forEach(enemy => {
        enemy.sprite.anims.play('patient3_walk', true);
        enemy.sprite.body.setVelocityX(enemy.velocity);
    });

    if (canPlayerMove()) {
        inputHandler(time);
    }

    if (isPlayerAttacking) {
        player.body.setVelocityX(0);

        if (playerAttack === 'midjab') {
            player.anims.play('midjab', true);
        }
        else if (playerAttack === 'kick') {
            player.anims.play('kick', true);
        }
        else if (playerAttack === 'uppercut') {
            player.anims.play('uppercut', true);
        }

        if (time - timePlayerStartedAttack > 1_000 / 3) {
            isPlayerAttacking = false;
        }
    }
}

function inputHandler(time) {
    if (isKeyDown.a || isKeyDown.s || isKeyDown.d) {
        if (isKeyDown.a) {
            playerAttack = 'midjab';
            isKeyDown.a = false;
        }
        else if (isKeyDown.s) {
            playerAttack = 'kick';
            isKeyDown.s = false;
        }
        else if (isKeyDown.d) {
            playerAttack = 'uppercut';
            isKeyDown.d = false;
        }
        isPlayerAttacking = true;
        timePlayerStartedAttack = time;
    }
    else if (cursors.left.isDown) {
        player.body.setVelocityX(-PLAYER_MOVE_SPEED);
        player.anims.play('walk', true); // walk left
        player.setOrigin(1, player.originY); // left-aligned sprites, so we set the origin to the far right when flipping.
        player.flipX = true; // flip the sprite to the left
    }
    else if (cursors.right.isDown) {
        player.body.setVelocityX(PLAYER_MOVE_SPEED);
        player.anims.play('walk', true);
        player.setOrigin(0.5, player.originY); // Reset the origin to the middle when the left-aligned sprite faces right.
        player.flipX = false; // use the original sprite looking to the right
    }
    else {
        player.body.setVelocityX(0);
        player.anims.play('idle', true);
    }
}

function canPlayerMove() {
    return !isPlayerAttacking;
}

function randomHexColor() {
    let FFFFFF = 16777215;
    let DDDDDD = 14540253;
    return '0x' + Math.floor((FFFFFF - DDDDDD) * Math.random() + DDDDDD).toString(16);
}

function randomEnemyXVelocity() {
    return -50 * Math.random() - 50;
}

function debugLog(message) {
    if (ENABLE_DEBUG_LOGGING) {
        console.log(message);
    }
}
