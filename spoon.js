window.onload = function() {

    var game, player, cursors, bullets, fireButton, forks;
    var gameDiv = document.getElementById('game');

    function preload() {
        game.load.image('star', 'assets/star.png');
        game.load.image('bullet', 'assets/bullet.png');
        game.load.image('spoon', 'assets/spoon.png');
        game.load.image('fork', 'assets/fork.png');
    }

    function createPlayer() {
        player = game.add.sprite((game.world.width - 48) / 2, game.world.height - 150, 'spoon');
        game.physics.arcade.enable(player);
        player.body.bounce.y = 0.2;
        player.body.gravity.y = 0;
        player.body.collideWorldBounds = true;
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
        bullets.trackSprite(player, player.width / 2, 0, true);
        bullets.trackRotation = false;
    }

    function createForks() {
        forks = game.add.group();
        forks.enableBody = true;
        forks.physicsBodyType = Phaser.Physics.ARCADE;
        for (var x = 0; x < 5; x++) {
            var fork = forks.create(x * 100, 50, 'fork');
            fork.body.moves = false;
        }
        forks.x = 100;
        forks.y = 50;
    }

    function createInput() {
        cursors = game.input.keyboard.createCursorKeys();
        fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    }

    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        createPlayer();
        createBullets();
        createForks();
        createInput();
    }

    function bulletHitsEnemey(bullet, enemy) {
        bullet.kill();
        enemy.destroy();
    }

    function update() {
        // TODO inertia and drag (rotation?)
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        if (cursors.left.isDown) {
            player.body.velocity.x = -250;
        } else if (cursors.right.isDown) {
            player.body.velocity.x = 250;
        }

        if (cursors.up.isDown) {
            player.body.velocity.y = -250;
        } else if (cursors.down.isDown) {
            player.body.velocity.y = 250;
        }

        if (fireButton.isDown) {
            bullets.fire();
        }

        // TODO why doesn't game.physics.arcade.overlap(forks, bullets, bulletHitsEnemey, null, this) work??!?!
        bullets.forEach(function(bullet) {
            forks.forEach(function(fork) {
                if (game.physics.arcade.intersects(fork.body, bullet.body)) {
                    console.log(fork);
                    bulletHitsEnemey(bullet, fork);
                }
            });
        });
    }

    // TODO based on CSS
    game = new Phaser.Game(850, 600, Phaser.AUTO, gameDiv, {
        preload: preload,
        create: create,
        update: update
    });
};

