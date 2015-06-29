var raural = raural || {};

(function() {
	
	// Songs Collection
	
	var Songs = Backbone.Collection.extend({
		
		model: raural.Song,
		
		comparator: function(model) {
        	return model.get('position');
        },
        
		// Songs are stored in local storage under the raural namespace
		localStorage: new Store('raural'),
				
		// Return the next song to be played
		nextSong: function(){
			
			var nextPosition = this.indexOf(this.nowPlaying()) + 1;
			
			var nextSong = this.at(nextPosition);
			
			//var nextSong = this.filter(function(song){
			//	return song.get("position") === nextPosition;
			//})[0];
			
			if(nextSong){
				return nextSong;
			}else{
				// Must be at the end of the playlist, so start again
				return this.at(0);
			}
			
		},

		// Return the song that is currently playing
		nowPlaying: function(){
			return this.filter(function( song ) {
				return song.get("inPlayer") === true;
			})[0]; // Single song rather than the array
		}
		
	});
	
	raural.Songs = new Songs();
	
}());