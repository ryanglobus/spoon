var SPOON_APP = SPOON_APP || {};

SPOON_APP.Level = function(app) {
    this.app = app;
    this.endLevelCallbacks = [];
};

SPOON_APP.Level.prototype.update = function() {};

SPOON_APP.Level.prototype.isFinished = function() {
    return true;
};

SPOON_APP.ForksLevel = function(app) {
    SPOON_APP.Level.call(this, app);
    this.forks = app.game.add.group();
    this.forks.enableBody = true;
    this.forks.physicsBodyType = Phaser.Physics.ARCADE;
    for (var y = 0; y < 10; y++) {
        for (var x = 0; x < 5; x++) {
            var fork = this.forks.create(x * 100, y * -400 + 50, 'fork');
            fork.angle = Math.random() * 360; // TODO func
            fork.anchor = new Phaser.Point(0.5, 0.5);
            // fork.body.collideWorldBounds = true;
            fork.body.bounce.x = 1;
            fork.body.bounce.y = 1;
            fork.body.angularVelocity = 360;
            // fork.body.velocity.x = Math.random() * 100 - 200;
            fork.body.velocity.y = Math.random() * 50 + 25;
        }
    }
    this.forks.x = 100;
    this.forks.y = 50;
    this.app.updateEnemyLives(this.forks.length);
};

SPOON_APP.ForksLevel.prototype = new SPOON_APP.Level();

SPOON_APP.ForksLevel.prototype.update = function() {
    // TODO this is dumb
    this.forks.forEach(function(fork) {
        if (fork.body.y > 0 && !fork.body.collideWorldBounds) {
            fork.body.collideWorldBounds = true;
            fork.body.velocity.x = Math.random() * 400 - 200;
        }
    });

    // TODO why doesn't game.physics.arcade.overlap(forks, bullets, bulletHitsEnemey, null, this) work??!?!
    this.app.bullets.forEach(function(bullet) {
        this.forks.forEach(function(fork) {
            if (this.app.game.physics.arcade.intersects(fork.body, bullet.body)) {
                bullet.kill();
                fork.destroy();
                this.app.updateEnemyLives(this.forks.length);
                this.app.addScore(100);
            }
        }, this);
    }, this);

    this.forks.forEach(function(fork) {
        if (this.app.game.physics.arcade.intersects(fork.body, this.app.player.body)) {
            fork.destroy();
            this.app.updateEnemyLives(this.forks.length);
            this.app.addScore(-200);
            this.app.removeLife();
        }
    }, this);
    // TODO why doesn't this work either?!?!
    // this.app.game.physics.arcade.overlap(this.app.player, this.forks, this.playerHitsEnemy, null, this);
};

SPOON_APP.ForksLevel.prototype.isFinished = function() {
    return this.forks.length == 0;
};

SPOON_APP.SCORE_PREFIX = 'Score: ';
SPOON_APP.LIVES_PREFIX = 'Lives: ';
SPOON_APP.ENEMY_PREFIX = 'Enemy: ';

SPOON_APP.preload = function() {
    this.game.load.image('star', 'assets/star.png');
    this.game.load.image('bullet', 'assets/bullet.png');
    this.game.load.image('spoon', 'assets/spoon.png');
    this.game.load.image('fork', 'assets/fork.png');
    this.game.load.image('starfield', 'assets/starfield.png');
};

SPOON_APP.createPlayer = function() {
    this.player = this.game.add.sprite((this.game.world.width - 48) / 2, this.game.world.height - 150, 'spoon');
    this.game.physics.arcade.enable(this.player);
    this.player.body.bounce.x = 0.5;
    this.player.body.bounce.y = 0.5;
    this.player.body.gravity.y = 0;
    this.player.body.collideWorldBounds = true;
    this.player.anchor = new Phaser.Point(0.5, 0.5);
    this.player.body.drag = new Phaser.Point(100, 100); // TODO drag seems to be not at same angle as spoon
};

SPOON_APP.createBullets = function() {
    this.bullets = this.game.add.weapon(30, 'bullet');
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    this.bullets.bulletSpeed = 400;
    this.bullets.fireRate = 200;
    this.bullets.bulletAngleOffset = 90;
    this.bullets.fireAngle = Phaser.ANGLE_UP;
    this.bullets.trackSprite(this.player, 0, 0, true);
    this.bullets.trackRotation = false;
    this.bullets.onFire.add(function() {
        // TODO use func
        this.score -= 1;
        this.scoreText.text = this.SCORE_PREFIX + this.score;
    }, this);
};

SPOON_APP.createInput = function() {
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.fireButton = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
};

SPOON_APP.createTexts = function() {
    // TODO use funcs
    var labelStyle = { font: '24px Arial', fill: '#fff' };
    this.score = 0;
    this.scoreText = this.game.add.text(10, 10, this.SCORE_PREFIX + this.score, labelStyle);

    this.lives = 3;
    this.livesText = this.game.add.text(this.game.world.width - 150, 10, this.LIVES_PREFIX, labelStyle);
    for (var i = 0; i < this.lives; i++) {
        this.livesText.text += "💛";
    }

    this.enemyText = this.game.add.text(this.game.world.width - 150, this.game.world.height - 40, this.ENEMY_PREFIX + this.enemyLives, labelStyle);
};

SPOON_APP.create = function() {
    this.enemyLives = 0;
    this.starfield = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'starfield');
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.createPlayer();
    this.createBullets();
    this.createInput();
    this.createTexts();

    this.level = new SPOON_APP.ForksLevel(this);
};

SPOON_APP.updateEnemyLives = function(enemyLives) {
    this.enemyText.text = this.ENEMY_PREFIX + enemyLives;
};

SPOON_APP.addScore = function(scoreDelta) {
    this.score += scoreDelta;
    this.scoreText.text = this.SCORE_PREFIX + this.score;
};

SPOON_APP.removeLife = function() {
    if (this.lives <= 0) {
        return;
    }
    if (this.lives > 0) {
        // TODO "blink"
        this.lives--;
        this.livesText.text = this.LIVES_PREFIX;
        for (var i = 0; i < this.lives; i++) {
            this.livesText.text += "💛";
        }
    }
    if (this.lives == 0) {
        var labelStyle = { font: '36px Arial', fill: '#fff' };
        this.game.add.text(this.game.world.width / 2 - 125, this.game.world.height / 2 - 50, 'GAME OVER', labelStyle);
        console.log('Game Over');
        this.gaveOver = true;
    }
};

SPOON_APP.update = function() {
    this.starfield.tilePosition.y += 2;
    // TODO inertia and drag (rotation?)
    this.player.body.acceleration.x = 0;
    this.player.body.acceleration.y = 0;

    if (this.cursors.left.isDown) {
        this.player.body.angularVelocity = -180;
    } else if (this.cursors.right.isDown) {
        this.player.body.angularVelocity = 180;
    } else {
        this.player.body.angularVelocity = 0;
    }

    var angle = this.player.angle * Math.PI / 180;
    this.bullets.fireAngle = Phaser.ANGLE_UP + this.player.angle;
    if (this.cursors.up.isDown) {
        this.player.body.acceleration.x = 250 * Math.sin(angle);
        this.player.body.acceleration.y = -250 * Math.cos(angle);
    } else if (this.cursors.down.isDown) {
        this.player.body.acceleration.x = -250 * Math.sin(angle);
        this.player.body.acceleration.y = 250 * Math.cos(angle);
    } else {
        this.player.body.acceleration.y = 0;
    }

    if (this.fireButton.isDown) {
        this.bullets.fire();
    }

    this.level.update();

    if (this.level.isFinished()) {
        if (!this.gaveOver) {
            var labelStyle = { font: '36px Arial', fill: '#fff' };
            this.game.add.text(this.game.world.width / 2 - 110, this.game.world.height / 2 - 50, 'YOU WIN', labelStyle);
            console.log('You win!');
            this.gaveOver = true;
        }
    }
};

SPOON_APP.main = function() {
    var gameDiv = document.getElementById('game');
    // TODO based on CSS
    this.game = new Phaser.Game(850, 600, Phaser.AUTO, gameDiv, {
        // TODO below is awk
        preload: function() {SPOON_APP.preload()},
        create: function() {SPOON_APP.create()},
        update: function() {SPOON_APP.update()}
    });

};

window.onload = function() {
    SPOON_APP.main();
};
