//https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/playbackRate
//https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
var AudioContext = window.AudioContext || window.webkitAudioContext;
var soundManager = {
	audioCtx: new AudioContext(),
	buffers: [],
	load: function(key, path){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', path, true);
		xhr.responseType = 'arraybuffer';
		var self = this;
		xhr.onload = function(){
			var dat = xhr.response;
			self.audioCtx.decodeAudioData(dat, function(buffer){
				self.buffers[key] = buffer;
			}, function(error){
				console.log("Error decoding data: " + error.error);
			});
		};
		xhr.send();
	},
	play: function(key, loop){
		var sound = this.audioCtx.createBufferSource();
		sound.buffer = this.buffers[key];
		sound.playbackRate.value = 1;
		sound.connect(this.audioCtx.destination);
		sound.loop = loop;
		// sound.start(0);
		//Don't want any sound yet
		return sound;
	}
};