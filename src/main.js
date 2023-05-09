import * as Scenes from "./scenes/Scenes.js";
/* Tyler Knowlton
Not Spy Hunter
Started: 10:54 at 5/8

Todo:
- Looping Background Music
- SFX
- In-game credits
- Creative Tilt

Hey, wouldn't you know, I made an endless runner in Phaser CE about 4 years ago. I'm gonna upgrade it to Phaser 3 and make a bunch of improvements, but all of the art is mine! Time to add some SFX and Music that doesn't suck though. 

Phaser 3 Weapon Plugin: https://github.com/16patsle/phaser3-weapon-plugin

*/

window.game = new Phaser.Game({
	type: Phaser.AUTO,
	width: window.innerWidth,
	height: window.innerHeight,
	parent: "game",
	scene: [Scenes.Play, Scenes.Start],
	physics: {
		default: 'arcade'
	},
});