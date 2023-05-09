import { soundManager } from "../lib/Sound.js";

export class Start extends Phaser.Scene {
    constructor() {
        super("Start");
    }

    preload() {
        var graphics = this.make.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 1, 1);
        graphics.generateTexture("button", 1, 1);
        graphics.destroy();

        soundManager.load("hit", "./assets/sounds/hit.mp3");
        soundManager.load('crash', './assets/sounds/explosion.mp3');
    }
    create() {
        // Holy cow, this is all terrible.
        function start(){
            soundManager.play("crash");
            this.cameras.main.shake(1000, 0.01);
            setTimeout(function(){
                this.scene.start('Play');
            }.bind(this), 1000);
        }

        var titleText = this.add.text(game.config.width/2, game.config.height/8, "", {
            fill:"#ffffff",
            font: (100 * game.config.width/1920) +"px Arial"
        });
        var subtitleText = this.add.text(game.config.width/2, game.config.height/8 + (90 * game.config.height/921), "(It's like Spy Hunter)", {
           fill: "#ffffff",
           font: (30 * game.config.width/1920) + "px Arial"
        });
        titleText.setOrigin(0.5);
        subtitleText.alpha = 0;
        subtitleText.setOrigin(0.5);
        
        var button = this.add.image(game.config.width/2, game.config.height/2, "button");
        button.setInteractive({useHandCursor: true});
        button.on("pointerdown", start.bind(this));
        button.setOrigin(0.5);

        var text = this.add.text(game.config.width/2, game.config.height/2, 'GO!', {
            fill: "#000000",
            font: (30 * game.config.width/1920) + "px Arial"
        });
        text.setOrigin(0.5);
        button.setDisplaySize(text.width + 50, text.height + 50);
        button.tint = 0x00dd50;
        text.alpha = 0;
        button.alpha = 0;
        setTimeout(function(){ //Nesting because lazy
            titleText.text += "Not ";
            this.cameras.main.shake(100, 0.01);
            soundManager.play("hit").playbackRate.value = 0.5;
            setTimeout(function(){
                titleText.text += "Spy ";
                this.cameras.main.shake(100, 0.01);
                soundManager.play("hit").playbackRate.value = 0.6;
                setTimeout(function(){
                    titleText.text += "Hunter";
                    this.cameras.main.shake(100, 0.01);
                    soundManager.play("hit").playbackRate.value = 0.7;
                    setTimeout(function(){
                        subtitleText.alpha = 1;
                        this.cameras.main.shake(100, 0.01);
                        soundManager.play("hit").playbackRate.value = 1;
                        setTimeout(function(){
                            this.cameras.main.shake(100, 0.01);
                            soundManager.play("hit").playbackRate.value = 1;
                            button.alpha = 1;
                            text.alpha = 1;
                            this.cameras.main.shake(100, 0.01);

                            this.add.text(game.config.width/2, 3 * game.config.height/4, "By Ambiguousname.\nPhaser 3 Weapon Plugin by 16patsle.\nSounds from http://bbcsfx.acropolis.org.uk/", {
                                fill: "#ffffff",
                                font: (100 * game.config.width/1920) + "px Arial",
                                align: "center"
                             }).setOrigin(0.5);
                        }.bind(this), 800);
                    }.bind(this), 800);
                }.bind(this), 500);
            }.bind(this), 500);
        }.bind(this), 800);
    }
};