var gameOptions = {
    gameWidth: 20 * 32, // 640,     // width of the game, in pixels
    gameHeight: 20 * 32, // 480,    // height of the game, in pixels
    bgColor: 0x444444,  // background color
    // playerGravity: 900, // player gravity
    playerSpeed: 32,   // player horizontal speed
    playerJump: 400,     // player force
    defaultVelocity: 1,
}

var game;
const MAP_ID = "game-map";
const TANK_ID = "tank";
const TILES_ID = "tiles";
const LEFT = Phaser.Keyboard.LEFT;
const UP = Phaser.Keyboard.UP;
const RIGHT = Phaser.Keyboard.RIGHT;
const DOWN = Phaser.Keyboard.DOWN;
const SPACEBAR = Phaser.Keyboard.SPACEBAR;


window.onload = function () {
    game = new Phaser.Game(gameOptions.gameWidth, gameOptions.gameHeight);
    game.state.add("PreloadGame", preloadGame);
    game.state.add("PlayGame", playGame);
    game.state.start("PreloadGame");
}

var preloadGame = function (game) { }

preloadGame.prototype = {
    preload: function () {
        game.stage.backgroundColor = gameOptions.bgColor;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.stage.disableVisibilityChange = true;

        // loading level tilemap
        game.load.tilemap(MAP_ID, "assets/map20x20.json", null,
            Phaser.Tilemap.TILED_JSON);
        game.load.image(TILES_ID, "assets/terrain.png");
        game.load.image(TANK_ID, "assets/tank32x32.png");
    },
    create: function () {
        game.state.start("PlayGame");
    }
}

var playGame = function (game) {}

playGame.prototype = {
    create: function () {
        // starting ARCADE physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // creatin of "level" tilemap
        this.map = game.add.tilemap(MAP_ID);

        // adding tiles (actually one tile) to tilemap
        this.map.addTilesetImage("Terrain", TILES_ID);

        // tile 1 (the black tile) has the collision enabled
        this.map.setCollision(1);

        // which layer should we render? That's right, "layer01"
        this.layer = this.map.createLayer("layer01");
        this.layer.resizeWorld();

        // adding the hero sprite
        this.tank = game.add.sprite(game.width / 2, game.height/2, TANK_ID);

        // setting hero anchor point
        this.tank.anchor.set(0.5, 0.5);

        game.physics.enable(this.tank, Phaser.Physics.ARCADE);

        // setting tank gravity
        this.tank.body.gravity.y = 0; // gameOptions.playerGravity;
        this.tank.body.gravity.x = 0; // gameOptions.playerGravity;

        // setting hero horizontal speed
        this.tank.body.velocity.x = 0; // gameOptions.playerSpeed;
        this.tank.body.velocity.y = 0; // gameOptions.playerSpeed;
        this.tank.body.collideWorldBounds = true;
        this.tank.gear = 0;

        // the hero can jump
        this.canJump = false;

        // the hero is not on the wall
        this.onWall = false;

        this.upKey = game.input.keyboard.addKey(UP);
        this.downKey = game.input.keyboard.addKey(DOWN);
        this.leftKey = game.input.keyboard.addKey(LEFT);
        this.rightKey = game.input.keyboard.addKey(RIGHT);
        this.spacebarKey = game.input.keyboard.addKey(SPACEBAR);
        game.input.keyboard.addKeyCapture([LEFT, RIGHT, UP, DOWN, SPACEBAR]);

        this.cursors = game.input.keyboard.createCursorKeys();
        for (let k in this.cursors) {
            this.cursors[k].wasPressed = false;
        }

        const v = 1;
        this.directions = Object();
        this.directions[LEFT]  = {dx: -v, dy:  0, angle: 180,  rot:-90};
        this.directions[UP]    = {dx:  0, dy: -v, angle: -90,  rot: 0};
        this.directions[RIGHT] = {dx: +v, dy:  0, angle:   0,  rot: 90};
        this.directions[DOWN]  = {dx:  0, dy: +v, angle:  90,  rot:180};
        this.directions[SPACEBAR]  = {dx:  0, dy: 0};
        this.tank.direction = UP;
    },
    update: function () {
        let t = this.tank;
        let newDirection = null;
        let cursors = this.cursors;
        if (cursors.up.isDown) {
            cursors.up.wasPressed = true;
        } else if (cursors.up.wasPressed) {
            cursors.up.wasPressed = false;
            newDirection = Phaser.Keyboard.UP;
        }
        if (cursors.down.isDown) {
            cursors.down.wasPressed = true;
        } else if (cursors.down.wasPressed) {
            cursors.down.wasPressed = false;
            newDirection = Phaser.Keyboard.DOWN;
        }
        if (cursors.left.isDown) {
            cursors.left.wasPressed = true;
        } else if (cursors.left.wasPressed) {
            cursors.left.wasPressed = false;
            newDirection = Phaser.Keyboard.LEFT;
        }
        if (cursors.right.isDown) {
            cursors.right.wasPressed = true;
        } else if (cursors.right.wasPressed) {
            cursors.right.wasPressed = false;
            newDirection = Phaser.Keyboard.RIGHT;
        }
        if (this.spacebarKey.isDown) {
            t.gear = 0;
        }
        if (newDirection != null) {
            if (t.direction != newDirection) {
                t.gear = 1;
                t.body.angle = this.directions[newDirection].angle;
                t.body.rotation = this.directions[newDirection].angle + 90;
                t.direction = newDirection;
            } else {
                t.gear++;
            }
        }
        t.x += t.gear * this.directions[t.direction].dx;
        t.y += t.gear * this.directions[t.direction].dy;
    },
    render: function() {
        game.debug.spriteInfo(this.tank, 32, 32);
    },
}