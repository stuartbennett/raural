var raural = raural || {};

(function(){
	
	raural.PlayerModel = Backbone.Model.extend({
		
		defaults: {
			playing: false,
			song: null,
			usage: 0
		},
		
		// Toggle the playing state
		togglePlaying: function(){
		
			this.save({
				playing: !this.get('playing')
			});
			
		},
		
		// Update the song that the player is playing
		setSong: function(song){
			
			if(this.get('song') !== song){
				this.save({song: song});
			}
			
		}
		
	});
	
	
}());