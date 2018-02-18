var gameOptions = {
    playerSize: 32,
    gameWidth: 32 * 32,  // in pixels
    gameHeight: 32 * 32, // in pixels
    bgColor: 0x447744,   // background color - green
    // playerGravity: 900, // player gravity
    playerSpeed: 32,     // player horizontal speed
}

var game;
const MAP_ID = "game-map";
const TANK_ID = "tank";
const SKULL_ID = "skull";
const TILES_ID = "tiles";
const LAYER_ID = "walls";
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
        game.load.tilemap(MAP_ID, "assets/level01.json", null,
            Phaser.Tilemap.TILED_JSON);
        game.load.image(TILES_ID, "assets/metal_tileset.png");
        game.load.image(TANK_ID, "assets/tank32x32.png");
        game.load.image(SKULL_ID, "assets/skull.png");
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
        this.map.addTilesetImage("metal_tileset", TILES_ID);

        this.wallsLayer = this.map.createLayer(LAYER_ID);
        this.map.setCollisionBetween(1, 100, true, LAYER_ID);
        this.wallsLayer.resizeWorld();

        this.skullsGroup = game.add.group();
        this.skullsGroup.enableBody = true;
        this.map.createFromObjects('skulls', 22, SKULL_ID,
          0, true, false, this.skullsGroup);

        // adding the hero sprite
        this.tank = game.add.sprite(
            game.width/2 - gameOptions.playerSize,
            game.height/2,
            TANK_ID);
        this.tank.anchor.set(0.5, 0.5); // setting hero anchor point
        this.skull = game.add.sprite()

        game.physics.enable(this.tank, Phaser.Physics.ARCADE);

        this.tank.body.gravity.y = 0;
        this.tank.body.gravity.x = 0;

        this.tank.body.velocity.x = 0;
        this.tank.body.velocity.y = 0;
        this.tank.body.collideWorldBounds = true;
        this.tank.gear = 0;

        this.spacebarKey = game.input.keyboard.addKey(SPACEBAR);
        this.swipe = new Swipe(game);
        const v = 64;
        this.directions = Object();
        this.directions[LEFT]  = {dx: -v, dy:  0, angle: 180,  rot:-90};
        this.directions[UP]    = {dx:  0, dy: -v, angle: -90,  rot: 0};
        this.directions[RIGHT] = {dx: +v, dy:  0, angle:   0,  rot: 90};
        this.directions[DOWN]  = {dx:  0, dy: +v, angle:  90,  rot:180};
        this.directions[SPACEBAR]  = {dx:  0, dy: 0};
        this.directions[this.swipe.DIRECTION_DOWN] = this.directions[DOWN];
        this.directions[this.swipe.DIRECTION_UP] = this.directions[UP];
        this.directions[this.swipe.DIRECTION_LEFT] = this.directions[LEFT];
        this.directions[this.swipe.DIRECTION_RIGHT] = this.directions[RIGHT];
        this.tank.direction = this.swipe.DIRECTION_UP;
        this.tank.speed = v;
    },
    update: function () {
        let t = this.tank;
        let d = this.swipe.check();
        const newDirection = (d != null)? d.direction : null;
        if (this.spacebarKey.isDown) {
            t.gear = 0;
        }
        if (newDirection != null) {
            if (t.direction != newDirection) {
                t.gear = 0;
                t.body.angle = this.directions[newDirection].angle;
                t.body.rotation = this.directions[newDirection].angle + 90;
                t.direction = newDirection;
            } else {
                t.gear++;
            }
        }
        const newX = t.x + t.gear * this.directions[t.direction].dx;
        const newY = t.y + t.gear * this.directions[t.direction].dy;
        game.physics.arcade.moveToXY(t, newX, newY, t.speed * t.gear);
        game.physics.arcade.collide(t, this.wallsLayer);
    },
    render: function() {
        game.debug.spriteInfo(this.tank, 32, 32);
    },
}