window.onload = function() {

    var game, player, cursors, bullets, fireButton, forks, score, scoreText, lives, livesText, starfield, enemyLives, enemyText;
    var SCORE_PREFIX = 'Score: ';
    var LIVES_PREFIX = 'Lives: ';
    var ENEMY_PREFIX = 'Enemy: ';
    var gameDiv = document.getElementById('game');

    function preload() {
        game.load.image('star', 'assets/star.png');
        game.load.image('bullet', 'assets/bullet.png');
        game.load.image('spoon', 'assets/spoon.png');
        game.load.image('fork', 'assets/fork.png');
        game.load.image('starfield', 'assets/starfield.png');
    }

    function createPlayer() {
        player = game.add.sprite((game.world.width - 48) / 2, game.world.height - 150, 'spoon');
        game.physics.arcade.enable(player);
        player.body.bounce.x = 0.5;
        player.body.bounce.y = 0.5;
        player.body.gravity.y = 0;
        player.body.collideWorldBounds = true;
        player.anchor = new Phaser.Point(0.5, 0.5);
        player.body.drag = new Phaser.Point(100, 100); // TODO drag seems to be not at same angle as spoon
    }

    function createBullets() {
        bullets = game.add.weapon(30, 'bullet');
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        bullets.bulletSpeed = 400;
        bullets.fireRate = 200;
        bullets.bulletAngleOffset = 90;
        bullets.fireAngle = Phaser.ANGLE_UP;
        bullets.trackSprite(player, 0, 0, true);
        bullets.trackRotation = false;
        bullets.onFire.add(function() {
            score -= 1;
            scoreText.text = SCORE_PREFIX + score;
        });
    }

    function createForks() {
        forks = game.add.group();
        forks.enableBody = true;
        forks.physicsBodyType = Phaser.Physics.ARCADE;
        for (var y = 0; y < 5; y++) {
            for (var x = 0; x < 5; x++) {
                var fork = forks.create(x * 100, y * -400 + 50, 'fork');
                fork.angle = Math.random() * 360; // TODO func
                fork.anchor = new Phaser.Point(0.5, 0.5);
                // fork.body.collideWorldBounds = true;
                fork.body.bounce.x = 1;
                fork.body.bounce.y = 1;
                fork.body.angularVelocity = 360;
                // fork.body.velocity.x = Math.random() * 100 - 200;
                fork.body.velocity.y = Math.random() * 50 + 25;
                enemyLives++;
            }
        }
        forks.x = 100;
        forks.y = 50;
    }

    function createInput() {
        cursors = game.input.keyboard.createCursorKeys();
        fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    }

    function createTexts() {
        var labelStyle = { font: '24px Arial', fill: '#fff' };
        score = 0;
        scoreText = game.add.text(10, 10, SCORE_PREFIX + score, labelStyle);

        lives = 3;
        livesText = game.add.text(game.world.width - 150, 10, LIVES_PREFIX, labelStyle);
        for (var i = 0; i < lives; i++) {
            livesText.text += "💛";
        }

        enemyText = game.add.text(game.world.width - 150, game.world.height - 40, ENEMY_PREFIX + enemyLives, labelStyle);
    }

    function create() {
        enemyLives = 0;
        starfield = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'starfield');
        game.physics.startSystem(Phaser.Physics.ARCADE);
        createPlayer();
        createBullets();
        createForks();
        createInput();
        createTexts();
    }

    function bulletHitsEnemey(bullet, enemy) {
        bullet.kill();
        enemy.destroy();
        enemyLives--;
        enemyText.text = ENEMY_PREFIX + enemyLives;

        score += 100;
        scoreText.text = SCORE_PREFIX + score;
    }

    function playerHitsEnemy(player, enemy) {
        enemy.destroy();
        enemyLives--;
        enemyText.text = ENEMY_PREFIX + enemyLives;
        lives--;
        score -= 200;
        scoreText.text = SCORE_PREFIX + score;
        if (lives > 0) {
            // TODO "blink"
            livesText.text = LIVES_PREFIX;
            for (var i = 0; i < lives; i++) {
                livesText.text += "💛";
            }
        } else {
            // TODO
            console.log('Game Over');
        }
    }

    function update() {
        starfield.tilePosition.y += 2;
        // TODO inertia and drag (rotation?)
        player.body.acceleration.x = 0;
        player.body.acceleration.y = 0;

        if (cursors.left.isDown) {
            player.body.angularVelocity = -180;
        } else if (cursors.right.isDown) {
            player.body.angularVelocity = 180;
        } else {
            player.body.angularVelocity = 0;
        }

        var angle = player.angle * Math.PI / 180;
        bullets.fireAngle = Phaser.ANGLE_UP + player.angle;
        if (cursors.up.isDown) {
            player.body.acceleration.x = 250 * Math.sin(angle);
            player.body.acceleration.y = -250 * Math.cos(angle);
        } else if (cursors.down.isDown) {
            player.body.acceleration.x = -250 * Math.sin(angle);
            player.body.acceleration.y = 250 * Math.cos(angle);
        } else {
            player.body.acceleration.y = 0;
        }

        if (fireButton.isDown) {
            bullets.fire();
        }

        // TODO this is dumb
        forks.forEach(function(fork) {
            if (fork.body.y > 0 && !fork.body.collideWorldBounds) {
                fork.body.collideWorldBounds = true;
                fork.body.velocity.x = Math.random() * 400 - 200;
            }
        });

        // TODO why doesn't game.physics.arcade.overlap(forks, bullets, bulletHitsEnemey, null, this) work??!?!
        bullets.forEach(function(bullet) {
            forks.forEach(function(fork) {
                if (game.physics.arcade.intersects(fork.body, bullet.body)) {
                    bulletHitsEnemey(bullet, fork);
                }
            });
        });
        game.physics.arcade.overlap(player, forks, playerHitsEnemy, null, this);
    }

    // TODO based on CSS
    game = new Phaser.Game(850, 600, Phaser.AUTO, gameDiv, {
        preload: preload,
        create: create,
        update: update
    });
};

