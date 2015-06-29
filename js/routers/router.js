var raural = raural || {};

$(function(){

	var RauralRouter = Backbone.Router.extend({
	
		routes:{
			'playlist/:songs': 'loadPlaylist'
		},

		loadPlaylist: function(songs) {
		
			var songs = songs.split("#");
			
			// Check if an iOS device has converted the hashes into %23
			if(songs.length == 1){
				songs = songs[0].split("%23");
			}
			
			if(songs.length){
				
				// Clear the Songs stored in local storage
				window.raural.Songs.reset();
				
			}
					
			$.each(songs, function(i, songId){
					
				// Create a new Song model (which will persist to localStorage) for each song in the parameter
				window.raural.Songs.create({songId: songId, position: window.raural.Songs.length});	

			});
	
		}
	});

	raural.Router = new RauralRouter();
	Backbone.history.start();

});
