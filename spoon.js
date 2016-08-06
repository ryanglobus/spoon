var SPOON_APP = SPOON_APP || {};

SPOON_APP.SCORE_PREFIX = 'Score: ';
SPOON_APP.LIVES_PREFIX = 'Lives: ';
SPOON_APP.ENEMY_PREFIX = 'Enemy: ';

SPOON_APP.preload = function() {
    this.game.load.image('star', 'assets/star.png');
    this.game.load.image('bullet', 'assets/bullet.png');
    this.game.load.image('spoon', 'assets/spoon.png');
    this.game.load.image('fork', 'assets/fork.png');
    this.game.load.image('starfield', 'assets/starfield.png');
}

SPOON_APP.createPlayer = function() {
    this.player = this.game.add.sprite((this.game.world.width - 48) / 2, this.game.world.height - 150, 'spoon');
    this.game.physics.arcade.enable(this.player);
    this.player.body.bounce.x = 0.5;
    this.player.body.bounce.y = 0.5;
    this.player.body.gravity.y = 0;
    this.player.body.collideWorldBounds = true;
    this.player.anchor = new Phaser.Point(0.5, 0.5);
    this.player.body.drag = new Phaser.Point(100, 100); // TODO drag seems to be not at same angle as spoon
}

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
        this.score -= 1;
        this.scoreText.text = this.SCORE_PREFIX + this.score;
    }, this);
}

SPOON_APP.createForks = function() {
    this.forks = this.game.add.group();
    this.forks.enableBody = true;
    this.forks.physicsBodyType = Phaser.Physics.ARCADE;
    for (var y = 0; y < 5; y++) {
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
            this.enemyLives++;
        }
    }
    this.forks.x = 100;
    this.forks.y = 50;
}

SPOON_APP.createInput = function() {
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.fireButton = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
}

SPOON_APP.createTexts = function() {
    var labelStyle = { font: '24px Arial', fill: '#fff' };
    this.score = 0;
    this.scoreText = this.game.add.text(10, 10, this.SCORE_PREFIX + this.score, labelStyle);

    this.lives = 3;
    this.livesText = this.game.add.text(this.game.world.width - 150, 10, this.LIVES_PREFIX, labelStyle);
    for (var i = 0; i < this.lives; i++) {
        this.livesText.text += "💛";
    }

    this.enemyText = this.game.add.text(this.game.world.width - 150, this.game.world.height - 40, this.ENEMY_PREFIX + this.enemyLives, labelStyle);
}

SPOON_APP.create = function() {
    this.enemyLives = 0;
    this.starfield = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'starfield');
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.createPlayer();
    this.createBullets();
    this.createForks();
    this.createInput();
    this.createTexts();
}

SPOON_APP.bulletHitsEnemey = function(bullet, enemy) {
    bullet.kill();
    enemy.destroy();
    this.enemyLives--;
    this.enemyText.text = this.ENEMY_PREFIX + this.enemyLives;

    this.score += 100;
    this.scoreText.text = this.SCORE_PREFIX + this.score;
}

SPOON_APP.playerHitsEnemy = function(player, enemy) {
    enemy.destroy();
    this.enemyLives--;
    this.enemyText.text = this.ENEMY_PREFIX + this.enemyLives;
    this.lives--;
    this.score -= 200;
    this.scoreText.text = this.SCORE_PREFIX + this.score;
    if (this.lives > 0) {
        // TODO "blink"
        this.livesText.text = this.LIVES_PREFIX;
        for (var i = 0; i < this.lives; i++) {
            this.livesText.text += "💛";
        }
    } else {
        // TODO
        console.log('Game Over');
    }
}

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

    // TODO this is dumb
    this.forks.forEach(function(fork) {
        if (fork.body.y > 0 && !fork.body.collideWorldBounds) {
            fork.body.collideWorldBounds = true;
            fork.body.velocity.x = Math.random() * 400 - 200;
        }
    });

    // TODO why doesn't game.physics.arcade.overlap(forks, bullets, bulletHitsEnemey, null, this) work??!?!
    this.bullets.forEach(function(bullet) {
        this.forks.forEach(function(fork) {
            if (this.game.physics.arcade.intersects(fork.body, bullet.body)) {
                this.bulletHitsEnemey(bullet, fork);
            }
        }, this);
    }, this);
    this.game.physics.arcade.overlap(this.player, this.forks, this.playerHitsEnemy, null, this);
}

SPOON_APP.main = function() {
    // var player, cursors, bullets, fireButton, forks, score, scoreText, lives, livesText, starfield, enemyLives, enemyText;

    var gameDiv = document.getElementById('game');
    // TODO based on CSS
    this.game = new Phaser.Game(850, 600, Phaser.AUTO, gameDiv, {
        preload: function() {SPOON_APP.preload()},
        create: function() {SPOON_APP.create()},
        update: function() {SPOON_APP.update()}
    });

};

window.onload = function() {
    SPOON_APP.main();
}
