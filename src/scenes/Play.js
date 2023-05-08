export class Play extends Phaser.Scene {
    constructor() {
        super("Play");
    }

    preload() {
        game.load.image("car", "./assets/images/car.png");
        game.load.spritesheet("roadblock", "./assets/images/roadblock.png", 50, 42, 5);
        game.load.image("road", "./assets/images/roadShort.png");
        game.load.image("bullet", "./assets/images/Bullet.png");
        game.load.image("enemyBullet", "./assets/images/enemyBullet.png");
        game.load.image("pad", "./assets/images/Pad.png");
        game.load.image("charge", "./assets/images/particle.png");
        game.load.spritesheet("smoke", "./assets/images/smoke.png", 30, 27);
        soundManager.load("carSound", "./assets/sounds/standardVroomTEMP.mp3");
        soundManager.load('crash', './assets/sounds/explosionTEMP.mp3');
        soundManager.load('fire', './assets/sounds/powTEMP.mp3');
        game.load.image('gun', './assets/images/gun.png');
        game.load.image('skid', './assets/images/skid.png');
        game.load.spritesheet('truck', './assets/images/truckPixel.png', 75, 202);
        game.load.spritesheet("carSheet", "./assets/images/carSpriteSheet.png", 100, 146, 3);
        game.load.spritesheet("mustangishSheet", "./assets/images/mustang-ishSheet.png", 26, 51, 4);
        game.load.spritesheet("padSheet", "./assets/images/PadSpritesheet.png", 32, 32, 5);
        game.load.spritesheet("explosion", "./assets/images/explosion.png", 64, 64, 13);
        
        var graphics = game.add.graphics();
        graphics.beginFill(0xffffff);
        graphics.drawRect(0, 0, 100, 50);
        game.buttonSprite = graphics.generateTexture();
        graphics.destroy();
    }

    create() {
        //TODO: CHANGE
        game.time.advancedTiming = true;
        game.keys = game.input.keyboard.createCursorKeys();
        game.stage.backgroundColor = "#A8651E";
        game.road = game.add.tileSprite(game.width/2, game.height/2, 514, 788, "road");
        game.road.anchor.setTo(0.5);
        game.road.speed = 1;
        game.road.scale.setTo(0.00125 * game.width, game.height/600);
        game.speedDisplay = game.add.text(game.width - ((game.width/800 * 25) * 4), game.height - ((game.width/800 * 25) * 2), "0 mph", {
            fill: "#ffffff",
            font: (game.width/800 * 25) + "px Arial"
        });
        //Skid marks:
        game.destBlockGroup = game.add.group();
        game.skG = game.add.group();
        game.boostGroup = game.add.group();
        game.boostGroup.enableBody = true;
        game.boostGroup.physicsBodyType = Phaser.Physics.ARCADE;
        game.blockGroup = game.add.group();
        game.blockGroup.enableBody = true;
        game.blockGroup.physicsBodyType = Phaser.Physics.ARCADE;
        game.shadow = game.add.sprite(10, 12, 'car');
        game.enemies = game.add.group();
        game.enemies.enableBody = true;
        game.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        var smoke = game.add.emitter(0, 0, 1000);
        smoke.makeParticles('smoke');
        smoke.setAlpha(0.4, 0.7);
        smoke.scale.setTo(1 * game.width/1000);
        smoke.start(false, 1000, 1);
        smoke.on = false;
        smoke.tint = 0xaaaaaa;
        game.player = game.add.sprite(game.width/2, game.height + 100, 'carSheet');
        game.player.smoke = smoke;
        game.player.anchor.setTo(0.5);
        game.player.topS = game.add.sprite(0, 0, 'carSheet');
        game.player.topS.anchor.setTo(0.5);
        game.shadow.tint = 0x000000;
        game.expGroup = game.add.group();
        game.expGroup.enableBody = true;
        game.expGroup.physicsBodyType = Phaser.Physics.ARCADE;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.player.alpha = 1;
        game.shadow.alpha = 0.8;
        game.shadow.anchor.setTo(0.5);
        game.player.scale.setTo(game.width/3000);
        game.shadow.scale.setTo(3.7);
        game.wheelLeft = game.add.sprite(-game.player.width/2, game.player.height/2, 'f');
        game.wheelRight = game.add.sprite(game.player.width/2, game.player.height/2, 'f');
        game.wheelLeft.alpha = 0;
        game.wheelRight.alpha = 0;
        game.player.addChild(game.wheelLeft, true);
        game.player.addChild(game.wheelRight, true);
        var gun = game.add.sprite(0, -game.player.height * 3/4, 'gun');
        gun.anchor.setTo(0.5);
        gun.scale.setTo(3);
        game.player.addChild(game.shadow);
        game.player.addChild(gun, true);
        game.player.addChild(game.player.topS);
        gun.canShoot = true;
        game.friction = 0.05;
        game.player.gun = gun;
        game.dying = false;
        //SOUND
        // game.carSound = game.add.sound('carSound', 0.1);
        // game.carSound.override = false;
        // game.carSound.played = false;
        // game.brakeSound = game.add.sound('brakeSound', 0.1);
        // game.brakeSound.override = false;
        // game.brakeSound.played = false;
        // game.constant = game.add.sound('constant', 0.1, true);
        // game.constant.play();
        game.constant = soundManager.play("carSound", true);
        game.constant.playbackRate.value = game.road.speed * 0.001;
        game.physics.arcade.enable(game.player);
        game.player.weapon = game.add.weapon(10, 'bullet');
        game.player.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        game.player.weapon.bulletSpeed = 500;
        game.player.weapon.fireRate = 600;
        game.player.weapon.trackSprite(gun, 0, -gun.height);
        game.player.weapon.onFire.add(function(bullet){
            var sound = soundManager.play('fire');
            sound.playbackRate.value = Math.random() * (3 - 2) + 2;
            game.camera.shake(0.01, 100);
            bullet.scale.setTo(game.width/1200);
        });
        game.player.health = 100;
        game.player.maxHealth = 100;
        game.fire = game.input.keyboard.addKey(Phaser.KeyCode.CONTROL);
        game.altFire = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
        game.psd = true;
        function startGame(){
            game.psd = false;
            game.keys.down.onDown.add(function(){
                if(game.player.health > 0){
                    game.timeDown = 0;
                    game.time.events.add(100, function(){
                        if(!(game.arc || game.jumping)){
                            game.player.smoke.on = true;
                            game.player.smoke.gravity = game.player.body.velocity.y;
                        }
                    });
                    if(!(game.arc || game.jumping)){
                        game.camera.shake(0.01, 100);
                    }
                }
            });
            game.keys.down.onUp.add(function(){
                if(game.timeDown > 100 && game.timeDown < 500){
                    game.road.speed += game.timeDown/100;
                    game.player.body.velocity.y -= game.timeDown * 10;
                }
                if(game.timeDown > 500){
                    game.road.speed += 5;
                    game.player.body.velocity.y -= 5000;
                }
            });
            //For jumping:
            /*
            game.player.scale.x += 0.001;
            game.player.scale.y += 0.001;
            game.player.x += 0.1;
            game.car.x -= 0.1;
            */
            game.avoidObstacles = function(blocker, enemy){
                //Check for collision between enemy ando bstacles.
                if(blocker.x - blocker.width < enemy.x + enemy.width && blocker.x + blocker.width > enemy.x - enemy.width && !enemy.isDodging && blocker.y <= enemy.y && !enemy.isDown){ //Am I on a collision course with an obstacle, and am I alive?
                    enemy.tween.stop(); //Stop moving side to side
                    enemy.isDodging = true; //I am going to dodge now, don't do anything to mess up my behavior
                    enemy.tween = game.add.tween(enemy); //Create a tween to go left or right
                    var newPos = enemy.findNewPosition(blocker); //Decide where I want to go
                    enemy.tween.to({x:newPos[0], y:newPos[1]}, 5000/game.road.speed, "Linear"); //Set my new destination
                    enemy.tween.start(); //Go there
                    enemy.tween.onComplete.add(function(){ //Once I'm done, I've stopped dodging.
                        enemy.isDodging = false;
                    });
                    enemy.shouldMoveC = 0; //Set counter for number of frames I've moved.
                    enemy.tween.onUpdateCallback(enemy.updatePos, enemy); //Check if I need to go, change "this" references to enemy object.
                }
            }
            game.enemySpawn = game.time.events.loop(3000, function(){
                var random = Math.floor(Math.random() * 2);
                var x = -game.player.width;
                if(random === 1){
                    x = game.width + game.player.width;
                }
                var enemy = game.add.sprite(x, Math.floor(Math.random() * game.height - (game.height - game.player.y) - 50), 'mustangishSheet');
                //TODO: Fix it so when the car rotates when it dies, draw a line from top left of game so we can position shadow.
                enemy.car = game.add.sprite(4, 2, 'mustangishSheet');
                enemy.findNewPosition = function(blocker){ //Where do I go?
                    var newX;
                    if(blocker.x - blocker.width <= 0){ //Either the blocker is on the far right, left, or somewhere in between.
                        newX = game.width - this.width; //If on far left, go far right.
                    } else if (blocker.x + blocker.width >= game.width){ //If on far right, go far left.
                        newX = this.width;
                    } else {
                        if(this.x < blocker.x){ //If somewhere in between, go either left or right of blocker, whichever is shorter.
                            newX = this.width;
                        } else {
                            newX = game.width - this.width;
                        }
                    }
                    var newY = this.y + Math.floor(Math.random() * 200); //Keep going backwards to avoid obstacles.
                    if(newY + this.height >= game.height){
                        newY = newY - (game.height - newY);
                    }
                    return [newX, newY]
                }
                enemy.updatePos = function(){ //Determines if the enemy no longer needs to move out of the way
                    var shouldMove = false; //Should I keep moving?
                    var self = this; //Ref to enemy
                    game.blockGroup.forEach(function(b){
                        if(b.x - b.width < self.x + self.width && b.x + b.width > self.x - self.width){
                            shouldMove = true; //If I'm in the way of any obstacles, I want to keep moving
                        }
                    });
                    if(self.shouldMoveC >= 900){ //Have I continued moving for more than 900 frames? Prevents issues where there are obstacles everywhere, and car can't dodge.
                    //If the car sees no way out, it stops dodging, embraces its destiny with the wall.
                        shouldMove = false; //I want to stop moving
                        self.shouldMoveC = 0; //reset count
                    }
                    if(!shouldMove){ //Do I want to stop moving?
                        self.tween.stop(); //If true, stop moving
                        self.isDodging = false; //I've given up on life
                    } else {
                        self.shouldMoveC += 1;
                    }
                }
                enemy.car.tint = 0x000000;
                enemy.car.alpha = 0.8;
                enemy.topS = game.add.sprite(0, 0, 'mustangishSheet');
                enemy.isMoving = true;
                enemy.isDodging = false;
                enemy.addChild(enemy.car);
                enemy.addChild(enemy.topS);
                enemy.tween = game.add.tween(enemy);
                enemy.angle = 0;
                enemy.tween.to({x:game.width/2, y:Math.floor(Math.random() * game.height - (game.height - game.player.y)) - 20}, 5000/game.road.speed, "Linear");
                enemy.prevX = enemy.x;
                enemy.tween.start();
                enemy.weapon = game.add.weapon(100, 'enemyBullet');
                enemy.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
                enemy.weapon.bulletSpeed = 200;
                enemy.weapon.fireRate = 500;
                enemy.weapon.fireAngle = 90;
                enemy.weapon.onFire.add(function(bullet){
                    bullet.body.allowRotation = true;
                    enemy.body.velocity.x -= bullet.body.velocity.x/5;
                    enemy.body.velocity.y -= bullet.body.velocity.y/5;
                    bullet.scale.setTo(game.width/1200);
                    if(enemy.prevX !== enemy.x){
                        bullet.body.velocity.x += (enemy.x - enemy.prevX);
                    }
                    if(enemy.prevY !== enemy.y){
                        bullet.body.velocity.y += (enemy.y - enemy.prevY);
                    }
                });
                enemy.finished = false;
                enemy.weapon.trackSprite(enemy.car, enemy.car.width/2, enemy.car.height/2);
                enemy.tween.onComplete.add(function(){
                    enemy.finished = true;
                });
                enemy.index = game.time.events.events.length;
                enemy.fire = game.time.events.loop(1000, function(){
                    if(game.player.health > 0){
                        enemy.weapon.fire();
                        game.add.sound('fire', 0.7).play();
                    }
                });
                enemy.health = 100;
                enemy.scale.setTo(0.00125 * game.width);
                enemy.die = function(){
                    //TODO: Re-enable collision of enemy cars.
                    enemy.e = game.add.sprite(0, 0, 'explosion');
                    enemy.e.anchor.setTo(0.5);
                    enemy.e.scale.setTo(2 * game.width/800);
                    enemy.e.angle = Math.floor(Math.random() * 360);
                    enemy.rotate = (Math.random() * 2) - 1;
                    enemy.e.anim = enemy.e.animations.add('explode');
                    var sound = soundManager.play('crash');
                    sound.playbackRate.value = Math.random() * 2;
                    var dec = false;
                    var int = setInterval(function(){
                        if(enemy.e.anim.frame >= 7){
                            dec = true;
                        }
                        if(!dec){
                            enemy.e.scale.x += 0.01 * game.width/800;
                            enemy.e.scale.y += 0.01 * game.width/800;
                        } else {
                            enemy.e.scale.x -= 0.01 * game.width/800;
                            enemy.e.scale.y -= 0.01 * game.width/800;
                        }
                        // enemy.angle += enemy.rotate;
                        enemy.e.angle += enemy.rotate;
                        
                    }, 1);
                    enemy.e.anim.onComplete.add(function(){
                        clearInterval(int);
                        enemy.e.destroy();
                    }, this);
                    enemy.e.animations.play('explode', 12, false);
                    enemy.e.car = enemy;
                    if(!enemy.playerFire){
                        enemy.topS.frame = 2;
                    }
                    game.expGroup.add(enemy.e);
                }
                game.enemies.add(enemy);
            });
            var randomTime = Math.floor(Math.random() * (3000 -1000 - (game.road.speed * 100)) + 1000);
            if(randomTime < 1000){
                randomTime = 1000 + Math.floor(Math.random() * 1000) - 500;
            }
            game.time.events.add(randomTime, createItem);
            function createItem(){
                if(Math.random() > 0.2 && (game.road.speed * 10) + 10 < 60){
                    for(var i = 0; i < Math.floor(Math.random() * 5) + 1; i++){
                        var randomX = Math.floor(Math.random() * game.width/2) - game.width/4;
                        randomX += game.player.x;
                        if(randomX < 0){
                            randomX = 0;
                        }
                        if(randomX > game.width){
                            randomX = game.width - 50;
                        }
                        var sprite = game.add.sprite(randomX, -100, 'roadblock');
                        sprite.hp = 100;
                        sprite.scale.setTo(0.00125 * game.width);
                        game.blockGroup.add(sprite);
                    }
                }
                var randomTime = Math.floor(Math.random() * (3000 -1000 - (game.road.speed * 100)) + 1000);
                if(randomTime < 1000){
                    randomTime = 1000 + Math.floor(Math.random() * 1000) - 500;
                }
                if(game.player.health > 0){
                    game.time.events.add(randomTime, createItem);
                }
            }
            game.jumping = false;
            game.midair = false;
            game.arc = false;
            game.player.weapon.bulletRotateToVelocity = true;
            game.spawnPad = game.time.events.loop(9000, function(){
                var randX = Math.floor(Math.random() * game.width);
                var padShadow = game.add.sprite(randX + 12, -500, 'padSheet');
                var pad = game.add.sprite(randX, -500, 'padSheet');
                padShadow.tint = 0x000000;
                padShadow.alpha = 0.8;
                var anim = pad.animations.add('go');
                pad.animations.play('go', 12, true);
                pad.scale.setTo(0.00125 * game.width);
                padShadow.scale.setTo(game.width/800);
                game.boostGroup.add(padShadow);
                game.boostGroup.add(pad);
            });
            //TO ADD(?):
            // b.body.velocity.x += p.body.velocity.x * game.friction;
                // b.body.velocity.y += p.body.velocity.y * game.friction;
                // p.body.velocity.x += vel.x * game.friction;
                // p.body.velocity.y += vel.y * game.friction;
                // if(b.y > p.y - p.height/2 && b.y < p.y + p.height/2){ //Overlap in y?
                //     if(b.y < p.y + p.height/2){ //Blocker in front of player (mostly)?
                //         b.y -= (p.y - p.height/2) - (b.y - b.height/2);
                //     }   
                // }
            game.death = function(p, b){
                var sound = soundManager.play('crash');
                sound.playbackRate.value = Math.random() * 2;
                var vel = b.body.velocity;
                setTimeout(function(){
                    game.psd = false;
                    game.physics.arcade.isPaused = false;
                }, 100);
                game.psd = true; //Pause game motion momentarily to make hits "feel" better.
                game.physics.arcade.isPaused = true;
                game.player.health -= 100; //Reduce player health
                if(game.player.health <= 0){ //Does the player die?
                    var button = game.add.button(game.width/2, game.height + 50, game.buttonSprite, function(){
                        game.state.start('play');
                    });
                    var text = game.add.text(0, 0, "Try it again", {
                        fill: "#ffffff",
                        font: "20px Arial"
                    });
                    button.tint = 0xff0000;
                    button.anchor.setTo(0.5);
                    text.anchor.setTo(0.5);
                    button.addChild(text);
                    var tween = game.add.tween(button);
                    tween.to({y: game.height/2}, 1000);
                    tween.start();
                    game.camera.shake(0.05, 1000); //Shake camera
                    if(!(game.jumping || game.arc) && !game.dying){ //If the player is not in mid-air or has already been hit by a bullet
                        if(!game.played){ //If the sound of the car crashing hadn't already been played
                            game.add.sound('crash', 0.5).play();
                        }
                        game.dying = true; //The player is dying
                        //SOUND
                        // game.carSound.pause();
                        // game.brakeSound.pause();
                        // game.constant.pause();
                        game.played = true;
                        game.canInput = false;
                        game.player.topS.frame = 2; //Show damage on the car
                        game.player.body.velocity.y -= 10 + Math.floor(game.road.speed * 10) * 400; //Road stops, launch player
                        game.player.body.collideWorldBounds = false;
                        game.enemies.children.forEach(function(child){
                            if(!child.isDown){
                                child.tween.stop();
                                child.finished = false;
                                child.body.velocity.y -= game.road.speed * 400; //Launch enemies
                            }
                        });
                        if(!game.player.hit){
                            var exp = game.add.sprite(-10, -15, 'explosion'); //Generate explosion
                            exp.anchor.setTo(0.5);
                            exp.scale.setTo(10);
                            exp.anim = exp.animations.add('explode');
                            exp.animations.play('explode', 15, false);
                            var dec = false;
                            var int = setInterval(function(){
                                if(exp.anim.frame >= 7){
                                    dec = true;
                                }
                                if(!dec){
                                    exp.scale.x += 0.01 * game.width/800;
                                    exp.scale.y += 0.01 * game.width/800;
                                } else {
                                    exp.scale.x -= 0.01 * game.width/800;
                                    exp.scale.y -= 0.01 * game.width/800;
                                }
                            }, 1);
                            exp.anim.onComplete.add(function(){ //Remove explosion on completion of animation
                                clearInterval(int);
                                exp.destroy();
                                game.enemySpawn.loop = false;
                                game.spawnPad.loop = false;
                                game.spawnPad.pendingDelete = true;
                                game.enemySpawn.pendingDelete = true;
                                game.canInput = false;
                                game.player.smoke.on = false;
                            }, this);
                            game.player.hit = true;
                            exp.car = game.player; //Set Explosion to track player car
                            game.expGroup.add(exp);
                        }
                        b.body.velocity.y -= game.road.speed * 100;
                        game.enemies.forEach(function(e){
                            e.weapon.bullets.children.forEach(function(bull){
                                if(!bull.done){
                                    bull.body.velocity.y -= game.road.speed * 400; //Speed up bullets
                                    bull.done = true;
                                }
                            });
                        });
                        game.road.speed = 0; //Stop road
                    }
                }
                if(b.key === "enemyBullet"){ //Destroy bullet on hit
                    b.kill();
                }
            };
            game.canInput = false;
            game.player.tween = game.add.tween(game.player);
            game.player.tween.to({y: game.height - 50}, 1000);
            game.player.tween.onComplete.add(function(){
                game.canInput = true;
                game.player.body.collideWorldBounds = true;
                game.player.tween = null;
            });
            game.player.tween.start();
        }

        if(false){
            //TODO: Fix
            game.shadowT = game.add.sprite(game.width, game.height/2, 'truck');
            var truck = game.add.sprite(game.width, game.height/2, 'truck');
            game.shadowT.alpha = 0.8;
            game.shadowT.tint = 0x000000;
            game.shadowT.truck = truck;
            truck.opacity = 0;
            truck.scale.setTo(game.width/1000);
            game.shadowT.scale.setTo(game.width/1000);
            truck.anchor.setTo(0.5);
            game.shadowT.anchor.setTo(0.5);
            truck.x += truck.width/2;
            var truckTweenX = game.add.tween(truck);
            truckTweenX.to({x: game.road.x + game.road.width + truck.width/2}, 3000);
            var truckTweenY = game.add.tween(truck);
            truckTweenY.to({y: game.height - truck.height/2 - 100}, 2000);
            truckTweenX.chain(truckTweenY);
            truck.animations.add('destroy');
            truckTweenY.onComplete.add(function(){
                var exp = game.add.sprite(0, 0, 'explosion');
                exp.anchor.setTo(0.5);
                exp.scale.setTo(3 * game.width/800);
                exp.anim = exp.animations.add('explode');
                var dec = false;
                game.blockGroup.add(game.shadowT);
                game.blockGroup.add(truck);
                var int = setInterval(function(){
                    if(exp.anim.frame >= 7){
                        dec = true;
                    }
                    if(!dec){
                        exp.scale.x += 0.01 * game.width/800;
                        exp.scale.y += 0.01 * game.width/800;
                    } else {
                        exp.scale.x -= 0.01 * game.width/800;
                        exp.scale.y -= 0.01 * game.width/800;
                    }
                }, 1);
                exp.anim.onComplete.add(function(){
                    clearInterval(int);
                    exp.destroy();
                }, this);
                exp.car = truck;
                game.expGroup.add(exp);
                truck.animations.frame = 1;
                game.shadowT.animations.frame = 1;
                game.camera.shake(0.05, 500);
                exp.animations.play('explode', 12, false);
                startGame();
            });
            truckTweenX.start();
            localStorage.setItem("start", true);
        } else {
            startGame();
        }
    }

    update () {
        game.constant.playbackRate.value = game.road.speed;
        if(game.shadowT){
            game.shadowT.x = game.shadowT.truck.x + 5;
            game.shadowT.y = game.shadowT.truck.y + 5;
        }
        game.player.body.velocity.setTo(0.9 * game.player.body.velocity.x, 0.9 * game.player.body.velocity.y);
        game.player.t = game.add.tween(game.player);
        function skidTimeInt(time, sprite){
            var loop = game.time.events.loop(1, function(){
                loop.cT += 1;
                if(loop.cT >= time){
                    loop.pendingDelete = true;
                }
                skid(sprite);
            });
            loop.cT = 0;
        }
        function skid(sprite){
            if(!(game.jumping || game.arc) && game.player.health > 0){
                //TODO: Get wheel left and wheelRight sprites, track those positions
                var skLeft = game.add.sprite(game.wheelLeft.world.x, game.wheelLeft.world.y, 'skid');
                skLeft.rotation = game.player.rotation;
                skLeft.tint = 0x000000;
                var skRight = game.add.sprite(game.wheelRight.world.x, game.wheelRight.world.y, 'skid');
                skRight.anchor.setTo(0.5);
                skRight.tint = 0x000000;
                skLeft.scale.x = (0.4) * 0.00125 * game.width;
                skRight.scale.x = 0.4 * 0.00125 * game.width;
                skLeft.scale.y = game.road.speed/5;
                skRight.scale.y = game.road.speed/5;
                skLeft.rotation = sprite.rotation;
                skRight.rotation = sprite.rotation;
                game.skG.add(skLeft);
                game.skG.add(skRight);
            }
        }
        if(game.canInput){
            if(game.keys.up.isDown && game.keys.down.isDown && !(game.arc || game.jumping) && game.player.health > 0){
              game.timeDown += 1;
              game.camera.shake(0.01, 100);
              game.player.smoke.on = true;
              game.player.smoke.gravity = 0;
              game.road.speed -= 0.008;
              if(game.road.speed < 0.5){
                    game.road.speed = 0.5;
                }
            } else if(game.keys.up.isDown){
                game.player.body.velocity.y -= (20 * game.height/600);
                //SOUND
                // if(!game.carSound.isPlaying && !game.carSound.played){
                //     game.carSound.volume = 0.5 * game.road.speed;
                //     if(game.carSound.volume > 1){
                //         game.carSound.volume = 1;
                //     }
                //     game.carSound.play();
                //     game.brakeSound.fadeOut(100);
                //     game.carSound.played = true;
                //     game.brakeSound.played = false;
                // }
                game.player.smoke.on = false;
            } else if (game.keys.down.isDown){
                game.player.body.velocity.y += (20 * game.height/600);
                skid(game.player);
                //SOUND
                // if(!game.brakeSound.isPlaying && !game.brakeSound.played){
                //     game.brakeSound.volume = 0.2 * game.road.speed;
                //     if(game.brakeSound.volume > 1){
                //         game.brakeSound.volume = 1;
                //     }
                //     game.brakeSound.play();
                //     game.carSound.fadeOut(100);
                //     game.brakeSound.played = true;
                //     game.carSound.played = false;
                // }
            } else {
                game.player.smoke.on = false;
            }
        }
        if((game.keys.left.isDown) && game.canInput){
            game.player.body.velocity.x -= (20 * game.height/600);
            skid(game.player);
            if(!(game.jumping || game.arc)){
                game.player.t.to({angle: -30}, 400, "Linear");
            }
        } else if((game.keys.right.isDown) && game.canInput){
            game.player.body.velocity.x += (20 * game.height/600);
            skid(game.player);
            if(!(game.jumping || game.arc)){
                game.player.t.to({angle: 30}, 400, "Linear");
            }
        } else if(!game.input.activePointer.isDown && game.canInput) {
            game.player.t.to({angle: 0}, 400, "Linear");
        }
        if(game.canInput){
            if(game.input.activePointer.isDown){
                skid(game.player);
                if(game.player.x < game.input.activePointer.x - game.player.width/4){
                    game.player.body.velocity.x += (20 * game.height/600);
                    if(!(game.jumping || game.arc)){
                        game.player.t.to({angle: 30}, 400, "Linear");
                    }
                } else if (game.player.x > game.input.activePointer.x + game.player.width/4){
                    game.player.body.velocity.x -= (20 * game.height/600);
                    if(!(game.jumping || game.arc)){
                        game.player.t.to({angle: -30}, 400, "Linear");
                    }
                } else {
                    game.player.t.to({angle: 0}, 400, "Linear");
                }
                if(game.player.y < game.input.activePointer.y - game.player.height/4){
                    game.player.body.velocity.y += (20 * game.height/600);
                    if(!(game.arc || game.jumping) && game.player.health > 0){
                        game.player.smoke.on = true;
                        game.player.smoke.gravity = game.player.body.velocity.y;
                    }
                } else if (game.player.y > game.input.activePointer.y + game.player.height/4){
                    game.player.body.velocity.y -= (20 * game.height/600);
                } else {
                    game.player.smoke.on = false;
                }
            }
        }
        if(!game.psd){
        game.expGroup.forEach(function(e){
            e.x = e.car.x + e.car.width/2;
            e.y = e.car.y + e.car.height/2;
        });
        if(game.player.health > 0){
            game.road.speed += 0.002;
        }
        if(!game.player.hit){
            game.speedDisplay.text = 10 + Math.floor(game.road.speed * 10) + " mph";
        }
        if (game.player.y + game.player.height/2 >= game.height - 1 && (game.keys.down.isDown || game.input.activePointer.isDown) && game.player.health > 0){
            game.road.speed -= 0.008;
            if(game.road.speed < 0.5){
                game.road.speed = 0.5;
            }
        }
        game.boostGroup.forEach(function(pad){
            pad.y += game.road.speed;
            if(pad.y - pad.height > game.height){
                pad.destroy();
            }
        });
        if(game.player.health <= 0){
            skid(game.player);
        }
        game.enemies.children.forEach(function(enemy){
            enemy.body.velocity.setTo(0.95 * enemy.body.velocity.x, 0.95 * enemy.body.velocity.y);
            enemy.weapon.fireAngle = Math.floor(Math.random() * 30) - 15 + (game.physics.arcade.angleBetween(enemy, game.player) / (Math.PI/180));
            game.physics.arcade.collide(enemy.weapon.bullets, game.blockGroup, function(b, blocker){
                b.kill();
                game.time.events.add(100, function(){
                    blocker.hp -= 25;
                    if(blocker.hp <= 0){
                        blocker.animations.frame = Math.floor(Math.random() * 3) + 2;
                        blocker.currFrame = blocker.animations.frame;
                        game.blockGroup.remove(blocker);
                        blocker.body.velocity.setTo(0);
                        game.destBlockGroup.add(blocker);
                    }
                });
            });
            if(enemy.isMoving){
                var enemyTween = game.add.tween(enemy);
                if(enemy.finished && !enemy.isDodging){
                    var newVelX = Math.floor(Math.random() * 50) - 25;
                    var newVelY = Math.floor(Math.random() * 50) - 25;
                    if(enemy.x - enemy.body.velocity.x < 0){
                        newVelX = 0;
                    } else if (enemy.x + enemy.width + enemy.body.velocity.x > game.width){
                        newVelX = 0;
                    }
                    if(enemy.y - enemy.body.velocity.y < 0){
                        newVelY = 0;
                    } else if (enemy.y + enemy.height + enemy.body.velocity.y > game.height){
                        newVelY = game.height - enemy.height;
                    }
                    enemy.body.velocity.setTo(newVelX + enemy.body.velocity.x, newVelY + enemy.body.velocity.y);
                    game.time.events.add(1000, function(){
                        enemy.finished = true;
                    });
                    enemy.finished = false;
                }
                if(enemy.x > enemy.prevX){
                    enemyTween.to({angle: 10}, 400, "Linear");
                } else if (enemy.x < enemy.prevX){
                    enemyTween.to({angle: -10}, 400, "Linear");
                } else {
                    enemyTween.to({angle: 0}, 400, "Linear");
                }
                enemyTween.start();
            }
            if(enemy.isRoading){
                enemy.y += game.road.speed;
            }
            if(enemy.y > game.height){
                enemy.car.destroy();
                enemy.fire.pendingDelete = true;
                enemy.destroy();
            }
            if(!(game.jumping || game.arc)){
                game.physics.arcade.collide(enemy.weapon.bullets, game.player, game.death);
            }
            // if(enemy.prevX !== enemy.x){
            //     skid(enemy);
            // } else if (enemy.prevY > enemy.y){
            //     skid(enemy);
            // }
            enemy.prevX = enemy.x;
            enemy.prevY = enemy.y;
        });
        game.road.tilePosition.y += game.road.speed /  (game.height/600);
        if(!(game.jumping || game.arc)){
            game.physics.arcade.overlap(game.blockGroup, game.player.weapon.bullets, function(blocker, b){
                if(b.hp){
                    b.hp -= 1;
                    if(b.hp <= 0){
                        b.kill();
                    } else {
                        blocker.hp -= 1000;
                    }
                } else {
                    b.kill();
                }
                blocker.body.velocity.x = b.body.velocity.x * (game.friction * 12);
                blocker.body.velocity.y = b.body.velocity.y * (game.friction * 12);
                blocker.animations.frame = 1;
                game.time.events.add(100, function(){
                    blocker.animations.frame = 0;
                    blocker.hp -= 25;
                    if(blocker.hp <= 0){
                        var rand = Math.floor(Math.random() * 3) + 2;
                        blocker.animations.frame = rand;
                        blocker.currFrame = blocker.animations.frame;
                        game.blockGroup.remove(blocker);
                        blocker.body.velocity.setTo(0);
                        game.destBlockGroup.add(blocker);
                    }
                });
                setTimeout(function(){
                    game.psd = false;
                    game.physics.arcade.isPaused = false;
                }, 100);
                game.psd = true;
                game.physics.arcade.isPaused = true;
            });
            game.physics.arcade.collide(game.blockGroup, game.player, game.death);
            game.physics.arcade.collide(game.enemies, game.player, game.death);
            game.physics.arcade.overlap(game.expGroup, game.player, function(p, e){
                if((e.anim.frame === 6 || e.anim.frame === 7 || e.anim.frame === 8) && e.car !== game.player){
                    p.body.velocity.x += 500/(p.x - e.x);
                    p.body.velocity.y += 500/(p.y - e.y);
                }
            });
            game.physics.arcade.overlap(game.blockGroup, game.expGroup, function(b, e){
                if((e.anim.frame === 6 || e.anim.frame === 7 || e.anim.frame === 8) && e.car !== b){ //For truck
                    if(e.car === game.player){
                        b.body.velocity.x += 10000/(b.x - e.x);
                        b.body.velocity.y += 10000/(b.y - e.y);
                    } else {
                        b.body.velocity.x += 500/(b.x - e.x);
                        b.body.velocity.y += 500/(b.y - e.y);
                    }
                }
            });
            game.physics.arcade.overlap(game.player, game.boostGroup, function(){
                if(game.player.health > 0){
                    game.jumping = true;
                    game.road.speed += 0.5;
                    //SOUND
                    // game.carSound.play();
                }
            });
        }
        game.physics.arcade.overlap(game.player.weapon.bullets, game.enemies, function(b, enemy){
            if(b.hp){
                b.hp -=1;
                if(b.hp <= 0){
                    b.kill();
                } else {
                    enemy.hp -= 1000;
                }
            } else {
                b.kill();
            }
            enemy.body.velocity.x += b.body.velocity.x * game.friction * 10;
            enemy.body.velocity.y += b.body.velocity.y * game.friction * 10;
            enemy.rotation += (b.rotation/20);
            enemy.health -= 50;
            enemy.topS.frame = 3;
            enemy.playerFire = true;
            if(enemy.health <= 0 && !enemy.isDown){
                enemy.die();
                enemy.isRoading = true;
                enemy.finished = false;
                enemy.tween.stop();
                enemy.isMoving = false;
                enemy.fire.pendingDelete = true;
                enemy.isDown = true;
                game.time.events.add(50, function(){
                    enemy.topS.frame = 2;
                    enemy.playerFire = false;
                });
            } else if(!enemy.isDown) {
                game.time.events.add(50, function(){
                    enemy.topS.frame = 1;
                    enemy.playerFire = false;
                });
            } else if(enemy.isDown){
                game.time.events.add(50, function(){
                    enemy.topS.frame = 2;
                    enemy.playerFire = false;
                });
            }
            setTimeout(function(){
                game.psd = false;
                game.physics.arcade.isPaused = false;
            }, 100);
            game.psd = true;
            game.physics.arcade.isPaused = true;
        });
        game.physics.arcade.overlap(game.enemies, game.expGroup, function(en, e){
            if((e.anim.frame === 6 || e.anim.frame === 7 || e.anim.frame === 8) && e.car !== en){
                if(e.anim.frame === 6 || e.anim.frame === 7 || e.anim.frame === 8){
                    if(e.car === game.player){
                        en.body.velocity.x += 10000/(en.x - e.x);
                        en.body.velocity.y += 10000/(en.y - e.y);
                    } else {
                        en.body.velocity.x += 500/(en.x - e.x);
                        en.body.velocity.y += 500/(en.y - e.y);
                    }
                }
            }
        })
        game.physics.arcade.overlap(game.enemies, game.enemies, function(e1, e2){
            if(!e1.isDown){
                e1.vel = e1.body.velocity;
            }
            if(!e2.isDown){
                e2.vel = e2.body.velocity;
            }
            if(!e1.vel){
                e1.vel = e1.body.velocity;
            }
            if(!e2.vel){
                e2.vel = e2.body.velocity;
            }
            e1.body.velocity.y += e2.vel.y;
            e1.body.velocity.y -= e1.vel.y;
            e1.body.velocity.x -= e1.vel.x;
            e1.body.velocity.x += e2.vel.x;
            if(!e1.isDown){
                e1.die();
            }
            e2.body.velocity.x += e1.vel.x;
            e2.body.velocity.x -= e2.vel.x;
            e2.body.velocity.y -= e2.vel.y;
            e2.body.velocity.y += e1.vel.y;
            if(!e2.isDown){
                e2.die();
            }
            e1.isRoading = true;
            e1.finished = false;
            e1.tween.stop();
            e1.isMoving = false;
            e2.isRoading = true;
            e2.finished = false;
            e2.tween.stop();
            e2.isMoving = false;
            e1.isDown = true;
            e2.isDown = true;
            if(e1.health > 50 && !e1.isDown){
                e1.health = 1;
            } else {
                e1.fire.pendingDelete = true;
            }
            if(e2.health > 50 && !e2.isDown){
                e2.health = 1;
            } else {
                e2.fire.pendingDelete = true;
            }
        });
        game.physics.arcade.overlap(game.enemies, game.blockGroup, function(e, b){
            e.isRoading = true;
            e.finished = false;
            e.tween.stop();
            b.body.velocity.x += e.body.velocity.x * game.road.speed * game.friction;
            b.body.velocity.y += e.body.velocity.y * game.road.speed * game.friction;
            e.isMoving = false;
            if(!e.isDown){
                e.die();
            }
            if(e.health > 50 && !e.isDown){
                e.isDown = true;
                e.health = 1;
            } else {
                e.isDown = true;
                e.fire.pendingDelete = true;
            }
        });
        if(game.jumping){
            game.player.gun.alpha = 0;
            game.player.removeChild(game.player.gun);
            game.player.addChild(game.player.gun);
            game.player.gun.canShoot = false;
            if(game.player.scale.x > 1.6 * game.width/3000 && game.midair === false){
                game.midair = true;
                setTimeout(function(){
                    game.arc = true;
                    game.jumping = false;
                    game.midair = false;
                }, 500);
            } else {
                // game.constant.volume += 0.01;
                //SOUND
                game.midair = false;
                game.player.scale.x += 0.02 * (game.width/3000);
                game.player.scale.y += 0.02 * (game.width/3000);
                game.shadow.x += 2;
                game.player.x -= 2;
                game.player.t.to({angle: 0}, 400, "Linear");
            }
        } else if (game.arc){
            game.player.scale.x -= 0.02 * (game.width/3000);
            game.player.scale.y -= 0.02 * (game.width/3000);
            game.shadow.x -= 2;
            game.player.x += 2;
            // game.constant.volume -= 0.01;
            //SOUND
            if(game.player.scale.x <= game.width/3000){
                game.arc = false;
                game.player.gun.alpha = 1;
                skidTimeInt(50, game.player);
                game.camera.shake(0.02, 500);
                game.player.smoke.on = true;
                game.player.scale.setTo(game.width/3000);
                game.shadow.x = 10;
                game.shadow.y = 12;
                game.canInput = true;
                game.player.gun.canShoot = true;
                game.player.removeChild(game.player.gun);
                game.player.addChildAt(game.player.gun, 0);
            }
        }
        game.skG.forEach(function(i){
            i.y += game.road.speed;
            if(i.y > game.height + i.height){
                i.destroy();
            }
        });
        game.destBlockGroup.forEach(function(i){
            i.y += game.road.speed;
            i.animations.frame = i.currFrame;
            if(i.y > game.height + i.height){
                i.destroy();
            }
        });
        if((game.fire.isDown || game.altFire.isDown || game.input.activePointer.isDown) && !(game.arc || game.jumping) && game.player.health > 0){
            game.player.weapon.fireAngle = game.player.angle - 90;
            game.player.weapon.fire();
        }
        game.blockGroup.forEach(function(i){
            i.y += game.road.speed;
            i.body.velocity.setTo(0.95 * i.body.velocity.x, 0.95 * i.body.velocity.y);
            game.enemies.forEach(function(e){
                game.physics.arcade.overlap(game.expGroup, e.weapon.bullets, function(ex, b){
                    if((ex.anim.frame === 6 || ex.anim.frame === 7 || ex.anim.frame === 8)){
                        b.body.velocity.x += 90/(b.x - ex.x);
                        b.body.velocity.y += 90/(b.y - ex.y);
                    }
                });
                game.avoidObstacles(i, e);
                if(e.y > game.height + e.height){
                    e.destroy();
                }
            });
            if(i.y > game.height + i.height){
                i.destroy();
            }
        });
        game.road.prevSpeed = game.road.speed;
        }
        if(!game.player.tween){
            game.player.t.start();
        }
        game.player.smoke.position.setTo(game.player.x, game.player.y + game.player.height/2 - 20);
        //Counteract player movement:
        game.player.smoke.children.forEach(function(part){
            if(!part.spawned){
                part.animations.frame = Math.floor(Math.random() * 4);
                part.spawned = true;
            }
            part.x -= (game.player.x - game.player.prevX) * 0.6;
            part.y -= (game.player.y - game.player.prevY) * 0.6;
        });
        game.player.prevX = game.player.x;
        game.player.prevY = game.player.y;
    }
};