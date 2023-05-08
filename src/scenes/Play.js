import { soundManager } from "../lib/Sound.js";

export class Play extends Phaser.Scene {
    constructor() {
        super("Play");
    }

    preload() {
        this.load.image("car", "./assets/images/car.png");
        this.load.spritesheet("roadblock", "./assets/images/roadblock.png", { frameWidth: 50, frameHeight: 42, frameMax: 5} );
        this.load.image("road", "./assets/images/roadShort.png");
        this.load.image("bullet", "./assets/images/Bullet.png");
        this.load.image("enemyBullet", "./assets/images/enemyBullet.png");
        this.load.image("pad", "./assets/images/Pad.png");
        this.load.image("charge", "./assets/images/particle.png");
        this.load.spritesheet("smoke", "./assets/images/smoke.png", { frameWidth: 30, frameHeight: 27});
        soundManager.load("carSound", "./assets/sounds/standardVroomTEMP.mp3");
        soundManager.load('crash', './assets/sounds/explosionTEMP.mp3');
        soundManager.load('fire', './assets/sounds/powTEMP.mp3');
        this.load.image('gun', './assets/images/gun.png');
        this.load.image('skid', './assets/images/skid.png');
        this.load.spritesheet('truck', './assets/images/truckPixel.png', { frameWidth: 75, frameHeight: 202} );
        this.load.spritesheet("carSheet", "./assets/images/carSpriteSheet.png", { frameWidth: 100, frameHeight: 146, frameMax: 3});
        this.load.spritesheet("mustangishSheet", "./assets/images/mustang-ishSheet.png", {frameWidth: 26, frameHeight: 51, frameMax: 4});
        this.load.spritesheet("padSheet", "./assets/images/PadSpritesheet.png", {frameWidth: 32, frameHeight: 32, frameMax: 5});
        this.load.spritesheet("explosion", "./assets/images/explosion.png", {frameWidth: 64, frameWidth: 64, frameMax: 13});
        
        var graphics = this.make.graphics();
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 100, 50);
        this.buttonSprite = graphics.generateTexture(100, 50);
        graphics.destroy();
    }

    create() {
        this.plugins.installScenePlugin(
            'WeaponPlugin',
            WeaponPlugin.WeaponPlugin,
            'weapons',
            this
        );

        //TODO: CHANGE
        this.time.advancedTiming = true;
        this.keys = this.input.keyboard.createCursorKeys();
        game.config.backgroundColor.setFromRGB(Phaser.Display.Color.HexStringToColor("#A8651E"));

        this.road = this.add.tileSprite(game.config.width/2, game.config.height/2, 514, 788, "road");
        this.road.setOrigin(0.5);
        this.road.speed = 1;
        this.road.setScale(0.00125 * game.config.width, game.config.height/600);
        this.road.depth = -5;

        this.speedDisplay = this.add.text(game.config.width - ((game.config.width/800 * 25) * 4), game.config.height - ((game.config.width/800 * 25) * 2), "0 mph", {
            fill: "#ffffff",
            font: (game.config.width/800 * 25) + "px Arial"
        });
        //Skid marks:
        this.destBlockGroup = this.add.group();
        this.skG = this.add.group();

        this.boostGroup = this.add.group();
        this.boostGroup.enableBody = true;
        this.boostGroup.physicsBodyType = Phaser.physics;
        this.blockGroup = this.add.group();
        this.blockGroup.enableBody = true;
        this.blockGroup.physicsBodyType = Phaser.physics;
        this.enemies = this.add.group();
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.physics;

        this.createPlayer();

        this.psd = true;

        if(false){
            //TODO: Fix
            this.shadowT = this.add.sprite(game.config.width, game.config.height/2, 'truck');
            var truck = this.add.sprite(game.config.width, game.config.height/2, 'truck');
            this.shadowT.alpha = 0.8;
            this.shadowT.tint = 0x000000;
            this.shadowT.truck = truck;
            truck.opacity = 0;
            truck.setScale(game.config.width/1000);
            this.shadowT.setScale(game.config.width/1000);
            truck.setOrigin(0.5);
            this.shadowT.setOrigin(0.5);
            truck.x += truck.width/2;
            var truckTweenX = this.add.tween(truck);
            truckTweenX.updateTo({x: this.road.x + this.road.width + truck.width/2}, 3000);
            var truckTweenY = this.add.tween(truck);
            truckTweenY.updateTo({y: game.config.height - truck.height/2 - 100}, 2000);
            truckTweenX.chain(truckTweenY);
            truck.animations.add('destroy');
            truckTweenY.onComplete.add(function(){
                var exp = this.add.sprite(0, 0, 'explosion');
                exp.setOrigin(0.5);
                exp.setScale(3 * game.config.width/800);
                exp.anim = exp.animations.add('explode');
                var dec = false;
                this.blockGroup.add(this.shadowT);
                this.blockGroup.add(truck);
                var int = setInterval(function(){
                    if(exp.anim.frame >= 7){
                        dec = true;
                    }
                    if(!dec){
                        exp.scale.x += 0.01 * game.config.width/800;
                        exp.scale.y += 0.01 * game.config.width/800;
                    } else {
                        exp.scale.x -= 0.01 * game.config.width/800;
                        exp.scale.y -= 0.01 * game.config.width/800;
                    }
                }, 1);
                exp.anim.onComplete.add(function(){
                    clearInterval(int);
                    exp.destroy();
                }, this);
                exp.car = truck;
                this.expGroup.add(exp);
                truck.animations.frame = 1;
                this.shadowT.animations.frame = 1;
                this.cameras.main.shake(0.05, 500);
                exp.animations.play('explode', 12, false);
                startGame();
            });
            truckTweenX.play();
            localStorage.setItem("start", true);
        } else {
            this.startGame();
        }
    }

    createPlayer() {
        let sprite = this.add.sprite(0, 0, 'carSheet');
        sprite.setOrigin(0.5);
        this.player = this.add.container(game.config.width/2, game.config.height + 100, sprite);
        this.player.setSize(sprite.width, sprite.height);
        this.player.setScale(game.config.width/3000);
        this.player.sprite = sprite;

        this.physics.world.enable(this.player);

        var smoke = this.add.particles(0, 0, "smoke", {
            lifespan: 1000,
            maxAliveParticles: 1000,
            frequency: 1,
            alpha: {min: 0.4, max: 0.7},
            frame: {frames: [0, 1, 2, 3], cycle: false},
            scale: game.config.width/1000,
            speed: {min: 0, max: 100},
        });
        // smoke.setDepth(-0.5);
        smoke.start();
        smoke.emitting = false;
        // smoke.start(false, 1000, 1);
        this.player.smoke = smoke;

        this.shadow = this.add.sprite(10, 12, 'car');
        this.shadow.tint = 0x000000;
        this.shadow.alpha = 0.8;
        this.shadow.setOrigin(0.5);
        this.shadow.setScale(3.7);
        this.player.add(this.shadow);

        this.expGroup = this.add.group();
        this.expGroup.enableBody = true;

        this.wheelLeft = this.add.sprite(-this.player.width/2 + this.player.width/8, this.player.height/2 - this.player.height/8, 'f');
        this.wheelRight = this.add.sprite(this.player.width/2 - this.player.width/8, this.player.height/2 - this.player.height/8, 'f');
        this.wheelLeft.alpha = 0;
        this.wheelRight.alpha = 0;
        this.player.add(this.wheelLeft);
        this.player.add(this.wheelRight);

        var gun = this.add.sprite(0, 0, 'gun');
        gun.setOrigin(0.5, 2);
        gun.setScale(3);
        gun.canShoot = true;
        this.player.add(gun);
        this.player.gun = gun;
        
        // Ordering:
        this.player.sendToBack(this.player.gun);
        this.player.sendToBack(this.shadow);

        this.friction = 0.05;
        this.dying = false;

        //SOUND
        // this.carSound = this.add.sound('carSound', 0.1);
        // this.carSound.override = false;
        // this.carSound.played = false;
        // this.brakeSound = this.add.sound('brakeSound', 0.1);
        // this.brakeSound.override = false;
        // this.brakeSound.played = false;
        // this.constant = this.add.sound('constant', 0.1, true);
        // this.constant.play();
        this.constant = soundManager.play("carSound", true);
        this.constant.playbackRate.value = this.road.speed * 0.001;

        this.player.weapon = this.add.weapon(10, 'bullet');
        this.player.weapon.bulletSpeed = 500;
        this.player.weapon.fireRate = 600;
        this.player.weapon.on("fire", function(bullet){
            var sound = soundManager.play('fire');
            sound.playbackRate.value = Math.random() * (3 - 2) + 2;
            this.cameras.main.shake(100, 0.01);
            bullet.setScale(game.config.width/1200);
        }, this);
        
        this.player.health = 100;
        this.player.maxHealth = 100;
        this.fire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
        this.altFire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.player.tween = this.add.tween({
            targets: this.player,
            y: game.config.height - 50,
            duration: 1000 
        });
        this.player.tween.on("complete", function(){
            this.canInput = true;
            this.player.body.setCollideWorldBounds(true);
            this.player.tween = null;
        }, this);
    }

    startGame() {
        this.psd = false;
        this.keys.down.on("down", function(){
            if(this.player.health > 0){
                this.timeDown = 0;
                this.time.addEvent({delay: 100, callback: function(){
                    if(!(this.arc || this.jumping)){
                        this.player.smoke.emitting = true;
                        this.player.smoke.gravityY = this.player.body.velocity.y;
                    }
                }.bind(this)});
                if(!(this.arc || this.jumping)){
                    this.cameras.main.shake(100, 0.01);
                }
            }
        }, this);
        this.keys.down.on("up", function(){
            if(this.timeDown > 100 && this.timeDown < 500){
                this.road.speed += this.timeDown/100;
                this.player.body.velocity.y -= this.timeDown * 10;
            }
            if(this.timeDown > 500){
                this.road.speed += 5;
                this.player.body.velocity.y -= 5000;
            }
        }, this);
        //For jumping:
        /*
        this.player.scale.x += 0.001;
        this.player.scale.y += 0.001;
        this.player.x += 0.1;
        game.car.x -= 0.1;
        */
        this.avoidObstacles = function(blocker, enemy){
            //Check for collision between enemy ando bstacles.
            if(blocker.x - blocker.width < enemy.x + enemy.width && blocker.x + blocker.width > enemy.x - enemy.width && !enemy.isDodging && blocker.y <= enemy.y && !enemy.isDown){ //Am I on a collision course with an obstacle, and am I alive?
                enemy.tween.stop(); //Stop moving side to side
                enemy.isDodging = true; //I am going to dodge now, don't do anything to mess up my behavior
                enemy.tween = this.add.tween({targets: enemy}); //Create a tween to go left or right
                var newPos = enemy.findNewPosition(blocker); //Decide where I want to go
                enemy.tween.updateTo({x:newPos[0], y:newPos[1]}, 5000/this.road.speed, "Linear"); //Set my new destination
                enemy.tween.play(); //Go there
                enemy.tween.onComplete.add(function(){ //Once I'm done, I've stopped dodging.
                    enemy.isDodging = false;
                });
                enemy.shouldMoveC = 0; //Set counter for number of frames I've moved.
                enemy.tween.onUpdateCallback(enemy.updatePos, enemy); //Check if I need to go, change "this" references to enemy object.
            }
        }
        /*this.enemySpawn = this.time.addEvent({delay: 3000, loop: true, callback: function(){
            var random = Math.floor(Math.random() * 2);
            var x = -this.player.width;
            if(random === 1){
                x = game.config.width + this.player.width;
            }
            var enemy = this.physics.add.sprite(x, Math.floor(Math.random() * game.config.height - (game.config.height - this.player.y) - 50), 'mustangishSheet');
            //TODO: Fix it so when the car rotates when it dies, draw a line from top left of game so we can position shadow.
            enemy.car = this.add.sprite(4, 2, 'mustangishSheet');
            enemy.findNewPosition = function(blocker){ //Where do I go?
                var newX;
                if(blocker.x - blocker.width <= 0){ //Either the blocker is on the far right, left, or somewhere in between.
                    newX = game.config.width - this.width; //If on far left, go far right.
                } else if (blocker.x + blocker.width >= game.config.width){ //If on far right, go far left.
                    newX = this.width;
                } else {
                    if(this.x < blocker.x){ //If somewhere in between, go either left or right of blocker, whichever is shorter.
                        newX = this.width;
                    } else {
                        newX = game.config.width - this.width;
                    }
                }
                var newY = this.y + Math.floor(Math.random() * 200); //Keep going backwards to avoid obstacles.
                if(newY + this.height >= game.config.height){
                    newY = newY - (game.config.height - newY);
                }
                return [newX, newY]
            }
            enemy.updatePos = function(){ //Determines if the enemy no longer needs to move out of the way
                var shouldMove = false; //Should I keep moving?
                var self = this; //Ref to enemy
                this.blockGroup.forEach(function(b){
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
            enemy.topS = this.add.sprite(0, 0, 'mustangishSheet');
            enemy.isMoving = true;
            enemy.isDodging = false;
            enemy.addChild(enemy.car);
            enemy.addChild(enemy.topS);
            enemy.tween = this.add.tween({targets: enemy});
            enemy.angle = 0;
            enemy.tween.updateTo({x:game.config.width/2, y:Math.floor(Math.random() * game.config.height - (game.config.height - this.player.y)) - 20}, 5000/this.road.speed, "Linear");
            enemy.prevX = enemy.x;
            enemy.tween.play();
            enemy.weapon = this.add.weapon(100, 'enemyBullet');
            enemy.weapon.bulletSpeed = 200;
            enemy.weapon.fireRate = 500;
            enemy.weapon.fireAngle = 90;
            enemy.weapon.on("fire", function(bullet){
                bullet.body.allowRotation = true;
                enemy.body.velocity.x -= bullet.body.velocity.x/5;
                enemy.body.velocity.y -= bullet.body.velocity.y/5;
                bullet.setScale(game.config.width/1200);
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
            enemy.fire = this.time.addEvent({delay: 1000, loop: true, callback: function(){
                if(this.player.health > 0){
                    enemy.weapon.fire();
                    this.add.sound('fire', 0.7).play();
                }
            }});
            enemy.health = 100;
            enemy.setScale(0.00125 * game.config.width);
            enemy.die = function(){
                //TODO: Re-enable collision of enemy cars.
                enemy.e = this.add.sprite(0, 0, 'explosion');
                enemy.e.setOrigin(0.5);
                enemy.e.setScale(2 * game.config.width/800);
                enemy.e.angle = Math.floor(Math.random() * 360);
                enemy.rotate = (Math.random() * 2) - 1;
                enemy.e.anim = enemy.e.anims.add('explode');
                var sound = soundManager.play('crash');
                sound.playbackRate.value = Math.random() * 2;
                var dec = false;
                var int = setInterval(function(){
                    if(enemy.e.anim.frame >= 7){
                        dec = true;
                    }
                    if(!dec){
                        enemy.e.scale.x += 0.01 * game.config.width/800;
                        enemy.e.scale.y += 0.01 * game.config.width/800;
                    } else {
                        enemy.e.scale.x -= 0.01 * game.config.width/800;
                        enemy.e.scale.y -= 0.01 * game.config.width/800;
                    }
                    // enemy.angle += enemy.rotate;
                    enemy.e.angle += enemy.rotate;
                    
                }, 1);
                enemy.e.anim.onComplete.add(function(){
                    clearInterval(int);
                    enemy.e.destroy();
                }, this);
                enemy.e.anims.play('explode', 12, false);
                enemy.e.car = enemy;
                if(!enemy.playerFire){
                    enemy.topS.frame = 2;
                }
                this.expGroup.add(enemy.e);
            }
            this.enemies.add(enemy);
        }.bind(this)});*/
        var randomTime = Math.floor(Math.random() * (3000 -1000 - (this.road.speed * 100)) + 1000);
        if(randomTime < 1000){
            randomTime = 1000 + Math.floor(Math.random() * 1000) - 500;
        }
        // this.time.addEvent({delay: randomTime, callback: createItem.bind(this)});
        function createItem(){
            if(Math.random() > 0.2 && (this.road.speed * 10) + 10 < 60){
                for(var i = 0; i < Math.floor(Math.random() * 5) + 1; i++){
                    var randomX = Math.floor(Math.random() * game.config.width/2) - game.config.width/4;
                    randomX += this.player.x;
                    if(randomX < 0){
                        randomX = 0;
                    }
                    if(randomX > game.config.width){
                        randomX = game.config.width - 50;
                    }
                    var sprite = this.physics.add.sprite(randomX, -100, 'roadblock');
                    sprite.hp = 100;
                    sprite.setScale(0.00125 * game.config.width);
                    this.blockGroup.add(sprite);
                }
            }
            var randomTime = Math.floor(Math.random() * (3000 -1000 - (this.road.speed * 100)) + 1000);
            if(randomTime < 1000){
                randomTime = 1000 + Math.floor(Math.random() * 1000) - 500;
            }
            if(this.player.health > 0){
                this.time.addEvent({delay: randomTime, callback: createItem.bind(this)});
            }
        }
        this.jumping = false;
        this.midair = false;
        this.arc = false;
        this.player.weapon.bulletRotateToVelocity = true;
        /*this.spawnPad = this.time.addEvent({delay: 9000, loop: true, callback: function(){
            var randX = Math.floor(Math.random() * game.config.width);
            var padShadow = this.add.sprite(randX + 12, -500, 'padSheet');
            var pad = this.add.sprite(randX, -500, 'padSheet');
            padShadow.tint = 0x000000;
            padShadow.alpha = 0.8;
            var anim = pad.anims.add('go');
            pad.anims.play('go', 12, true);
            pad.setScale(0.00125 * game.config.width);
            padShadow.setScale(game.config.width/800);
            this.boostGroup.add(padShadow);
            this.boostGroup.add(pad);
        }.bind(this)});*/
        //TO ADD(?):
        // b.body.velocity.x += p.body.velocity.x * this.friction;
            // b.body.velocity.y += p.body.velocity.y * this.friction;
            // p.body.velocity.x += vel.x * this.friction;
            // p.body.velocity.y += vel.y * this.friction;
            // if(b.y > p.y - p.height/2 && b.y < p.y + p.height/2){ //Overlap in y?
            //     if(b.y < p.y + p.height/2){ //Blocker in front of player (mostly)?
            //         b.y -= (p.y - p.height/2) - (b.y - b.height/2);
            //     }   
            // }
        this.canInput = false;
    }

    death(p, b) {
        var sound = soundManager.play('crash');
        sound.playbackRate.value = Math.random() * 2;
        var vel = b.body.velocity;
        setTimeout(function(){
            this.psd = false;
            this.physics.isPaused = false;
        }, 100);
        this.psd = true; //Pause game motion momentarily to make hits "feel" better.
        this.physics.isPaused = true;
        this.player.health -= 100; //Reduce player health
        if(this.player.health <= 0){ //Does the player die?
            var button = this.add.button(game.config.width/2, game.config.height + 50, game.buttonSprite, function(){
                game.state.start('play');
            });
            var text = this.add.text(0, 0, "Try it again", {
                fill: "#ffffff",
                font: "20px Arial"
            });
            button.tint = 0xff0000;
            button.setOrigin(0.5);
            text.setOrigin(0.5);
            button.addChild(text);
            var tween = this.add.tween({targets: button});
            tween.updateTo({y: game.config.height/2}, 1000);
            tween.play();
            this.cameras.main.shake(1000, 0.05); //Shake camera
            if(!(this.jumping || this.arc) && !this.dying){ //If the player is not in mid-air or has already been hit by a bullet
                if(!game.played){ //If the sound of the car crashing hadn't already been played
                    this.add.sound('crash', 0.5).play();
                }
                this.dying = true; //The player is dying
                //SOUND
                // this.carSound.pause();
                // this.brakeSound.pause();
                // this.constant.pause();
                game.played = true;
                this.canInput = false;
                this.player.topS.frame = 2; //Show damage on the car
                this.player.body.velocity.y -= 10 + Math.floor(this.road.speed * 10) * 400; //Road stops, launch player
                this.player.body.collideWorldBounds = false;
                this.enemies.getChildren().forEach(function(child){
                    if(!child.isDown){
                        child.tween.stop();
                        child.finished = false;
                        child.body.velocity.y -= this.road.speed * 400; //Launch enemies
                    }
                });
                if(!this.player.hit){
                    var exp = this.add.sprite(-10, -15, 'explosion'); //Generate explosion
                    exp.setOrigin(0.5);
                    exp.setScale(10);
                    exp.anim = exp.anims.add('explode');
                    exp.anims.play('explode', 15, false);
                    var dec = false;
                    var int = setInterval(function(){
                        if(exp.anim.frame >= 7){
                            dec = true;
                        }
                        if(!dec){
                            exp.scale.x += 0.01 * game.config.width/800;
                            exp.scale.y += 0.01 * game.config.width/800;
                        } else {
                            exp.scale.x -= 0.01 * game.config.width/800;
                            exp.scale.y -= 0.01 * game.config.width/800;
                        }
                    }, 1);
                    exp.anim.onComplete.add(function(){ //Remove explosion on completion of animation
                        clearInterval(int);
                        exp.destroy();
                        this.enemySpawn.loop = false;
                        this.spawnPad.loop = false;
                        this.spawnPad.pendingDelete = true;
                        this.enemySpawn.pendingDelete = true;
                        this.canInput = false;
                        this.player.smoke.emitting = false;
                    }, this);
                    this.player.hit = true;
                    exp.car = this.player; //Set Explosion to track player car
                    this.expGroup.add(exp);
                }
                b.body.velocity.y -= this.road.speed * 100;
                this.enemies.getChildren().forEach(function(e){
                    e.weapon.bullets.getChildren().forEach(function(bull){
                        if(!bull.done){
                            bull.body.velocity.y -= this.road.speed * 400; //Speed up bullets
                            bull.done = true;
                        }
                    });
                }, this);
                this.road.speed = 0; //Stop road
            }
        }
        if(b.key === "enemyBullet"){ //Destroy bullet on hit
            b.kill();
        }
    }

    
    skid(sprite) {
        if(!(this.jumping || this.arc) && this.player.health > 0){
            //TODO: Get wheel left and wheelRight sprites, track those positions
            let wheelLeftPoint = this.player.localTransform.transformPoint(this.wheelLeft.x, this.wheelLeft.y);
            var skLeft = this.add.sprite(wheelLeftPoint.x, wheelLeftPoint.y, 'skid');
            skLeft.tint = 0x000000;
            
            let wheelRightPoint = this.player.localTransform.transformPoint(this.wheelRight.x, this.wheelRight.y);
            var skRight = this.add.sprite(wheelRightPoint.x, wheelRightPoint.y, 'skid');
            skRight.setOrigin(0.5);
            skRight.tint = 0x000000;

            skRight.setScale((0.4) * 0.00125 * game.config.width, this.road.speed/5);
            skLeft.setScale(0.4 * 0.00125 * game.config.width, this.road.speed/5);

            skLeft.depth = -1;
            skRight.depth = -1;

            this.skG.add(skLeft);
            this.skG.add(skRight);
        }
    }

    #targetAngle = 0;
    playerRotate() {
        this.player.angle = Phaser.Math.Linear(this.player.angle, this.#targetAngle, 0.01);
    }

    smokeUpdate() {
        this.player.smoke.setPosition(this.player.x, this.player.y + this.player.height/2 - this.player.height/4);
        //Counteract player movement:
        this.player.smoke.forEachAlive(function(part){
            /*if(!part.spawned){
                part.anims.setCurrentFrame(Math.floor(Math.random() * 4));
                part.spawned = true;
            }*/
            // TODO: Replace with it just getting added to a static group?
            part.x -= (this.player.x - this.player.prevX) * 0.6;
            part.y -= (this.player.y - this.player.prevY) * 0.6;
        }, this);
        this.player.prevX = this.player.x;
        this.player.prevY = this.player.y;

        if (this.player.smoke.emitting) {
            if (this.player.smoke.frequency > 1) {
                this.player.smoke.frequency -= this.#elapsed/1000;
            }
        } else {
            this.player.smoke.frequency = 15;
        }
    }

    fireUpdate() {
        if((this.fire.isDown || this.altFire.isDown || this.input.activePointer.isDown) && !(this.arc || this.jumping) && this.player.health > 0){
            this.player.weapon.fireAngle = this.player.angle - 90;

            let gunPos = this.player.localTransform.transformPoint(this.player.gun.x, this.player.gun.y - 10 * this.player.gun.height);
            this.player.weapon.fireFrom.setPosition(gunPos.x, gunPos.y);
            this.player.weapon.fire();
        }
    }

    #time = performance.now();
    #elapsed;
    update () {
        let now = performance.now();
        this.#elapsed = now - this.#time;
        this.playerRotate();

        this.constant.playbackRate.value = this.road.speed;
        if(this.shadowT){
            this.shadowT.x = this.shadowT.truck.x + 5;
            this.shadowT.y = this.shadowT.truck.y + 5;
        }
        this.player.body.setVelocity(0.9 * this.player.body.velocity.x, 0.9 * this.player.body.velocity.y);
        function skidTimeInt(time, sprite){
            var loop = this.time.addEvent({delay: 1, loop: true, callback: function(){
                loop.cT += 1;
                if(loop.cT >= time){
                    loop.pendingDelete = true;
                }
                this.skid(sprite);
            }});
            loop.cT = 0;
        }
        if(this.canInput){
            if(this.keys.up.isDown && this.keys.down.isDown && !(this.arc || this.jumping) && this.player.health > 0){
              this.timeDown += 1;
              this.cameras.main.shake(100, 0.01);
              this.player.smoke.emitting = true;
              this.player.smoke.gravity = 0;
              this.road.speed -= 0.008;
              if(this.road.speed < 0.5){
                    this.road.speed = 0.5;
                }
            } else if(this.keys.up.isDown){
                this.player.body.velocity.y -= (20 * game.config.height/600);
                //SOUND
                // if(!this.carSound.isPlaying && !this.carSound.played){
                //     this.carSound.volume = 0.5 * this.road.speed;
                //     if(this.carSound.volume > 1){
                //         this.carSound.volume = 1;
                //     }
                //     this.carSound.play();
                //     this.brakeSound.fadeOut(100);
                //     this.carSound.played = true;
                //     this.brakeSound.played = false;
                // }
                this.player.smoke.emitting = false;
            } else if (this.keys.down.isDown){
                this.player.body.velocity.y += (20 * game.config.height/600);
                this.skid(this.player);
                //SOUND
                // if(!this.brakeSound.isPlaying && !this.brakeSound.played){
                //     this.brakeSound.volume = 0.2 * this.road.speed;
                //     if(this.brakeSound.volume > 1){
                //         this.brakeSound.volume = 1;
                //     }
                //     this.brakeSound.play();
                //     this.carSound.fadeOut(100);
                //     this.brakeSound.played = true;
                //     this.carSound.played = false;
                // }
            } else {
                this.player.smoke.emitting = false;
            }
        }
        if((this.keys.left.isDown) && this.canInput){
            this.player.body.velocity.x -= (20 * game.config.height/600);
            this.skid(this.player);
            if(!(this.jumping || this.arc)){
                this.#targetAngle = -30;
            }
        } else if((this.keys.right.isDown) && this.canInput){
            this.player.body.velocity.x += (20 * game.config.height/600);
            this.skid(this.player);
            if(!(this.jumping || this.arc)){
                this.#targetAngle = 30;
            }
        } else if(!this.input.activePointer.isDown && this.canInput) {
            this.#targetAngle = 0;
        }
        if(this.canInput){
            if(this.input.activePointer.isDown){
                this.skid(this.player);
                if(this.player.x < this.input.activePointer.x - this.player.width/4){
                    this.player.body.velocity.x += (20 * game.config.height/600);
                    if(!(this.jumping || this.arc)){
                        this.#targetAngle = 30;
                    }
                } else if (this.player.x > this.input.activePointer.x + this.player.width/4){
                    this.player.body.velocity.x -= (20 * game.config.height/600);
                    if(!(this.jumping || this.arc)){
                        this.#targetAngle = -30;
                    }
                } else {
                    this.#targetAngle = 0;
                }
                if(this.player.y < this.input.activePointer.y - this.player.height/4){
                    this.player.body.velocity.y += (20 * game.config.height/600);
                    if(!(this.arc || this.jumping) && this.player.health > 0){
                        this.player.smoke.emitting = true;
                        this.player.smoke.gravityY = this.player.body.velocity.y;
                    }
                } else if (this.player.y > this.input.activePointer.y + this.player.height/4){
                    this.player.body.velocity.y -= (20 * game.config.height/600);
                } else {
                    this.player.smoke.emitting = false;
                }
            }
        }
        if(!this.psd){
            this.expGroup.getChildren().forEach(function(e){
                e.x = e.car.x + e.car.width/2;
                e.y = e.car.y + e.car.height/2;
            });
            if(this.player.health > 0){
                this.road.speed += 0.002;
            }
            if(!this.player.hit){
                this.speedDisplay.text = 10 + Math.floor(this.road.speed * 10) + " mph";
            }
            if (this.player.y + this.player.height/2 >= game.config.height - 1 && (this.keys.down.isDown || this.input.activePointer.isDown) && this.player.health > 0){
                this.road.speed -= 0.008;
                if(this.road.speed < 0.5){
                    this.road.speed = 0.5;
                }
            }
            this.boostGroup.getChildren().forEach(function(pad){
                pad.y += this.road.speed;
                if(pad.y - pad.height > game.config.height){
                    pad.destroy();
                }
            });
            if(this.player.health <= 0){
                this.skid(this.player);
            }
            this.enemies.getChildren().forEach(function(enemy){
                enemy.body.velocity.setTo(0.95 * enemy.body.velocity.x, 0.95 * enemy.body.velocity.y);
                enemy.weapon.fireAngle = Math.floor(Math.random() * 30) - 15 + (this.physics.angleBetween(enemy, this.player) / (Math.PI/180));
                this.physics.collide(enemy.weapon.bullets, this.blockGroup, function(b, blocker){
                    b.kill();
                    this.time.addEvent({delay: 100, function(){
                        blocker.hp -= 25;
                        if(blocker.hp <= 0){
                            blocker.anims.setCurrentFrame(Math.floor(Math.random() * 3) + 2);
                            blocker.currFrame = blocker.anims.currentFrame;
                            this.blockGroup.remove(blocker);
                            blocker.body.velocity.setTo(0);
                            this.destBlockGroup.add(blocker);
                        }
                    }});
                });
                if(enemy.isMoving){
                    var enemyTween = this.add.tween({targets: enemy});
                    if(enemy.finished && !enemy.isDodging){
                        var newVelX = Math.floor(Math.random() * 50) - 25;
                        var newVelY = Math.floor(Math.random() * 50) - 25;
                        if(enemy.x - enemy.body.velocity.x < 0){
                            newVelX = 0;
                        } else if (enemy.x + enemy.width + enemy.body.velocity.x > game.config.width){
                            newVelX = 0;
                        }
                        if(enemy.y - enemy.body.velocity.y < 0){
                            newVelY = 0;
                        } else if (enemy.y + enemy.height + enemy.body.velocity.y > game.config.height){
                            newVelY = game.config.height - enemy.height;
                        }
                        enemy.body.velocity.setTo(newVelX + enemy.body.velocity.x, newVelY + enemy.body.velocity.y);
                        this.time.addEvent({delay: 1000, callback: function(){
                            enemy.finished = true;
                        }});
                        enemy.finished = false;
                    }
                    if(enemy.x > enemy.prevX){
                        enemyTween.updateTo({angle: 10}, 400, "Linear");
                    } else if (enemy.x < enemy.prevX){
                        enemyTween.updateTo({angle: -10}, 400, "Linear");
                    } else {
                        enemyTween.updateTo({angle: 0}, 400, "Linear");
                    }
                    enemyTween.play();
                }
                if(enemy.isRoading){
                    enemy.y += this.road.speed;
                }
                if(enemy.y > game.config.height){
                    enemy.car.destroy();
                    enemy.fire.pendingDelete = true;
                    enemy.destroy();
                }
                if(!(this.jumping || this.arc)){
                    this.physics.collide(enemy.weapon.bullets, this.player, this.death);
                }
                // if(enemy.prevX !== enemy.x){
                //     this.skid(enemy);
                // } else if (enemy.prevY > enemy.y){
                //     this.skid(enemy);
                // }
                enemy.prevX = enemy.x;
                enemy.prevY = enemy.y;
            });
            this.road.tilePositionY -= this.road.speed /  (game.config.height/600);
            if(!(this.jumping || this.arc)){
                this.physics.overlap(this.blockGroup, this.player.weapon.bullets, function(blocker, b){
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
                    blocker.body.velocity.x = b.body.velocity.x * (this.friction * 12);
                    blocker.body.velocity.y = b.body.velocity.y * (this.friction * 12);
                    blocker.anims.create();
                    blocker.anims.setCurrentFrame(1);
                    this.time.addEvent({delay: 100, callback: function(){
                        blocker.anims.setCurrentFrame(0);
                        blocker.hp -= 25;
                        if(blocker.hp <= 0){
                            var rand = Math.floor(Math.random() * 3) + 2;
                            blocker.anims.setCurrentFrame(rand);
                            blocker.currFrame = blocker.anims.currentFrame;
                            this.blockGroup.remove(blocker);
                            blocker.body.velocity.setTo(0);
                            this.destBlockGroup.add(blocker);
                        }
                    }});
                    setTimeout(function(){
                        this.psd = false;
                        this.physics.isPaused = false;
                    }, 100);
                    this.psd = true;
                    this.physics.isPaused = true;
                });
                this.physics.collide(this.blockGroup, this.player, this.death);
                this.physics.collide(this.enemies, this.player, this.death);
                this.physics.overlap(this.expGroup, this.player, function(p, e){
                    if((e.anim.frame === 6 || e.anim.frame === 7 || e.anim.frame === 8) && e.car !== this.player){
                        p.body.velocity.x += 500/(p.x - e.x);
                        p.body.velocity.y += 500/(p.y - e.y);
                    }
                });
                this.physics.overlap(this.blockGroup, this.expGroup, function(b, e){
                    if((e.anim.frame === 6 || e.anim.frame === 7 || e.anim.frame === 8) && e.car !== b){ //For truck
                        if(e.car === this.player){
                            b.body.velocity.x += 10000/(b.x - e.x);
                            b.body.velocity.y += 10000/(b.y - e.y);
                        } else {
                            b.body.velocity.x += 500/(b.x - e.x);
                            b.body.velocity.y += 500/(b.y - e.y);
                        }
                    }
                });
                this.physics.overlap(this.player, this.boostGroup, function(){
                    if(this.player.health > 0){
                        this.jumping = true;
                        this.road.speed += 0.5;
                        //SOUND
                        // this.carSound.play();
                    }
                });
            }
            this.physics.overlap(this.player.weapon.bullets, this.enemies, function(b, enemy){
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
                enemy.body.velocity.x += b.body.velocity.x * this.friction * 10;
                enemy.body.velocity.y += b.body.velocity.y * this.friction * 10;
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
                    this.time.addEvent({delay: 50, callback: function(){
                        enemy.topS.frame = 2;
                        enemy.playerFire = false;
                    }});
                } else if(!enemy.isDown) {
                    this.time.addEvent({delay: 50, callback: function(){
                        enemy.topS.frame = 1;
                        enemy.playerFire = false;
                    }});
                } else if(enemy.isDown){
                    this.time.addEvent({delay: 50, callback: function(){
                        enemy.topS.frame = 2;
                        enemy.playerFire = false;
                    }});
                }
                setTimeout(function(){
                    this.psd = false;
                    this.physics.isPaused = false;
                }, 100);
                this.psd = true;
                this.physics.isPaused = true;
            });
            this.physics.overlap(this.enemies, this.expGroup, function(en, e){
                if((e.anim.frame === 6 || e.anim.frame === 7 || e.anim.frame === 8) && e.car !== en){
                    if(e.anim.frame === 6 || e.anim.frame === 7 || e.anim.frame === 8){
                        if(e.car === this.player){
                            en.body.velocity.x += 10000/(en.x - e.x);
                            en.body.velocity.y += 10000/(en.y - e.y);
                        } else {
                            en.body.velocity.x += 500/(en.x - e.x);
                            en.body.velocity.y += 500/(en.y - e.y);
                        }
                    }
                }
            })
            this.physics.overlap(this.enemies, this.enemies, function(e1, e2){
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
            this.physics.overlap(this.enemies, this.blockGroup, function(e, b){
                e.isRoading = true;
                e.finished = false;
                e.tween.stop();
                b.body.velocity.x += e.body.velocity.x * this.road.speed * this.friction;
                b.body.velocity.y += e.body.velocity.y * this.road.speed * this.friction;
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
            if(this.jumping){
                this.player.gun.alpha = 0;
                this.player.removeChild(this.player.gun);
                this.player.addChild(this.player.gun);
                this.player.gun.canShoot = false;
                if(this.player.scale.x > 1.6 * game.config.width/3000 && this.midair === false){
                    this.midair = true;
                    setTimeout(function(){
                        this.arc = true;
                        this.jumping = false;
                        this.midair = false;
                    }, 500);
                } else {
                    // this.constant.volume += 0.01;
                    //SOUND
                    this.midair = false;
                    this.player.scale.x += 0.02 * (game.config.width/3000);
                    this.player.scale.y += 0.02 * (game.config.width/3000);
                    this.shadow.x += 2;
                    this.player.x -= 2;
                    this.#targetAngle = 0;
                }
            } else if (this.arc){
                this.player.scale.x -= 0.02 * (game.config.width/3000);
                this.player.scale.y -= 0.02 * (game.config.width/3000);
                this.shadow.x -= 2;
                this.player.x += 2;
                // this.constant.volume -= 0.01;
                //SOUND
                if(this.player.scale.x <= game.config.width/3000){
                    this.arc = false;
                    this.player.gun.alpha = 1;
                    skidTimeInt(50, this.player);
                    this.cameras.main.shake(500, 0.02);
                    this.player.smoke.emitting = true;
                    this.player.setScale(game.config.width/3000);
                    this.shadow.x = 10;
                    this.shadow.y = 12;
                    this.canInput = true;
                    this.player.gun.canShoot = true;
                    this.player.removeChild(this.player.gun);
                    this.player.addChildAt(this.player.gun, 0);
                }
            }
            this.skG.getChildren().forEach(function(i){
                i.y += this.road.speed;
                if(i.y > game.config.height + i.height){
                    i.destroy();
                }
            }, this);
            this.destBlockGroup.getChildren().forEach(function(i){
                i.y += this.road.speed;
                i.anims.setCurrentFrame(i.currFrame);
                if(i.y > game.config.height + i.height){
                    i.destroy();
                }
            }, this);

            this.fireUpdate();

            this.blockGroup.getChildren().forEach(function(i){
                i.y += this.road.speed;
                i.body.velocity.setTo(0.95 * i.body.velocity.x, 0.95 * i.body.velocity.y);
                this.enemies.getChildren().forEach(function(e){
                    this.physics.overlap(this.expGroup, e.weapon.bullets, function(ex, b){
                        if((ex.anim.frame === 6 || ex.anim.frame === 7 || ex.anim.frame === 8)){
                            b.body.velocity.x += 90/(b.x - ex.x);
                            b.body.velocity.y += 90/(b.y - ex.y);
                        }
                    });
                    this.avoidObstacles(i, e);
                    if(e.y > game.config.height + e.height){
                        e.destroy();
                    }
                });
                if(i.y > game.config.height + i.height){
                    i.destroy();
                }
            }, this);
            this.road.prevSpeed = this.road.speed;
        }
        
        this.smokeUpdate();

        this.#time = now;
    }
};