var raural = raural || {};

(function(){
	
	// Song Model
	
	raural.Song = Backbone.Model.extend({
		
		defaults: {
			name: '',
			query: '',
			songId: '',
			position: 0,
			inPlayer: false,
			paused: false,
			buffering: false
		},
		
		// Load in the player
		toggleInPlayer: function() {
		
			if(!this.get('inPlayer')){
				// Remove the Song that is currently in the player and set this new Song to be in the player
				var currentlyInPlayer = window.raural.Songs.where({inPlayer: true});
				if(currentlyInPlayer.length > 0){
					currentlyInPlayer[0].toggleInPlayer();
				}
				
			}
				
			this.save({
				inPlayer: !this.get('inPlayer')
			});
			
		},
		
		togglePaused: function(){
			
			this.save({
				paused: !this.get('paused')
			});
			
		},
		
		// Update the position of this song in the playlist
		setPosition: function(newPosition){
			
			this.save({position: newPosition});
			
		}
		
	});
	
}());