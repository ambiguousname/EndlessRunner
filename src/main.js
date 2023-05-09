import * as Scenes from "./scenes/Scenes.js";
import { soundManager } from "../lib/Sound.js";
/* Tyler Knowlton
Not Spy Hunter
Started: 10:54 at 5/8
Finished: 23:46 at 5/8
So roughly 12 hours.

Hey, wouldn't you know, I made an endless runner in Phaser CE about 4 years ago. I'm gonna upgrade it to Phaser 3 and make a bunch of improvements, but all of the art is mine! Time to add some SFX and Music that doesn't suck though. 

Creative Tilt: I upgraded this entire project from Phaser CE to Phaser 3. And keep in mind this is all my old spaghetti code from when I didn't know how to program. It runs pretty much the same, with a few improvements! You can play the original here: https://ambiguous-name.itch.io/not-spy-hunter. Although at some point I might upgrade that page to use this version. And I like the visuals! I made this game years ago as part of a school project; it had something to do with making like a basic driving game. But then I expanded on it and added a lot of visuals, and someone pointed out it just so happens to resemble spy hunter. I think it looks cool! And I like the visual aesthetic of it.

Phaser 3 Weapon Plugin: https://github.com/16patsle/phaser3-weapon-plugin

SFX and Music modified from https://sound-effects.bbcrewind.co.uk/

*/

window.game = new Phaser.Game({
	type: Phaser.AUTO,
	width: window.innerWidth,
	height: window.innerHeight,
	parent: "game",
	scene: [Scenes.Start, Scenes.Play],
	physics: {
		default: 'arcade'
	},
});

soundManager.load("music", "./assets/sounds/music.mp3");