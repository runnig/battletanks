var gameOptions = {
    playerSize: 32,
    gameWidth: 32 * 10,  // in pixels
    gameHeight: 32 * 10, // in pixels
    bgColor: 0x447744,   // background color - green
    playerSpeed: 32,     // player horizontal speed
}

var game;
const MAP_ID = "game-map";
const TANK_ID = "tank";
const SKULL_ID = "skull";
const TILES_ID = "tiles";
const LAYER_ID = "walls";
const EXPLOSION_ID = "explosion";


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
        game.load.spritesheet(EXPLOSION_ID, 'assets/explosion.png', 30, 30);
    },
    create: function () {
        game.state.start("PlayGame");
    }
}

var playGame = function (game) {}

explode = function(tank, skull) {
    skull.kill();
    tank.kill();
    expl = game.add.sprite(80, 80, EXPLOSION_ID);
    expl.anchor.set(0.5, 0.5);
    expl.animations.add("explode", null, 30, false);
    expl.x = tank.x;
    expl.y = tank.y;
    expl.animations.play("explode", 15, false, true);
}

playGame.prototype = {
    create: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.map = game.add.tilemap(MAP_ID);
        this.map.addTilesetImage("metal_tileset", TILES_ID);

        this.wallsLayer = this.map.createLayer(LAYER_ID);
        this.map.setCollisionBetween(1, 100, true, LAYER_ID);
        this.wallsLayer.resizeWorld();

        this.skullsGroup = game.add.group();
        this.skullsGroup.enableBody = true;
        this.map.createFromObjects("skulls", 22, SKULL_ID,
          0, true, false, this.skullsGroup);

        this.tank = game.add.sprite(
            game.width/2-gameOptions.playerSize, game.height/2, TANK_ID);
        this.tank.anchor.set(0.5, 0.5); // setting hero anchor point
        this.skull = game.add.sprite();

        game.physics.enable(this.tank, Phaser.Physics.ARCADE);

        this.tank.body.gravity.x = 0;
        this.tank.body.gravity.y = 0;

        this.tank.body.velocity.x = 0;
        this.tank.body.velocity.y = 0;
        this.tank.body.collideWorldBounds = true;
        this.tank.gear = 0;

        this.spacebarKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.swipe = new Swipe(game);
        this.swipe.diagonalDisabled = true;
        const v = 32;
        this.directions = Object();
        this.directions[this.swipe.DIRECTION_DOWN]  = {dx:  0, dy: +v, angle:  90};
        this.directions[this.swipe.DIRECTION_UP]    = {dx:  0, dy: -v, angle: -90};
        this.directions[this.swipe.DIRECTION_LEFT]  = {dx: -v, dy:  0, angle: 180};
        this.directions[this.swipe.DIRECTION_RIGHT] = {dx: +v, dy:  0, angle:   0};
        this.tank.direction = this.swipe.DIRECTION_UP;

        game.camera.follow(this.tank);
    },
    update: function () {
        let t = this.tank;
        let swipe = this.swipe.check();
        const newDirection = (swipe != null)? swipe.direction : null;
        if (this.spacebarKey.isDown) {
            t.gear = 0;
            t.body.velocity.x = 0;
            t.body.velocity.y = 0;
        } else if (newDirection in this.directions) {
            if (t.direction != newDirection) {
                t.gear = 1;
                t.direction = newDirection;
            } else {
                t.gear++;
            }
            const dir = this.directions[t.direction];
            t.body.velocity.x = t.gear * dir.dx;
            t.body.velocity.y = t.gear * dir.dy;
            t.body.angle = dir.angle;
            t.body.rotation = dir.angle + 90;
        }
        game.physics.arcade.collide(this.tank, this.wallsLayer);
        game.physics.arcade.overlap(this.tank, this.skullsGroup, explode, null, this);
    },
    render: function() {
        game.debug.spriteInfo(this.tank, 32, 32);
    },
}
