var raural = raural || {};

$(function() {

	// Player View

	raural.PlayerView = Backbone.View.extend({
			
		el: '#player',
		
		template: _.template(''),
		
		initialize: function(){
			// Player model events
			this.model.on('change:songId', this.render, this);
			this.model.on('change', this.render, this );
			this.model.on('destroy', this.remove, this );
			
			// Keep track of the Song Models via their Collection
			window.raural.Songs.on('change:playing', this.playingChanged, this);
			

		},
		
		render: function(){
		alert('in player view render function');
						var dataAddress = 'http://www.youtube.com/v/' + this.model.get('song').get('songId') + '?autohide=1&theme=light&border=0&fs=1&rel=0&enablejsapi=1&playerapiid=player&autoplay=1&version=3&showinfo=0';
				var params = { allowScriptAccess: "always", bgcolor: "#fff", allowFullScreen: false };
				var atts = {id: "playerObject"};
				swfobject.embedSWF(dataAddress, "playerObject", "700", "700", "8", null, null, params, atts);
			
			return this;
			
		},
		
		playingChanged: function(changedSong){
			
			// Check if this song is already in use by the player
			if(this.model.get('song') === changedSong){
				
				// This song is already attached to the player, but it may have been paused or started playing again
				if(changedSong.get('playing')){
					
					// It is now playing so it must have been paused before
					window.raural.playerObject.playVideo();
					
				}else{
					
					// It is now stopped so it must have been playing before
					window.raural.playerObject.stopVideo();
					
				}
			
			}else{
			
				// This is a new song so switch to it and start playing
				this.model.set('song', changedSong);
			
			}	
			
		},
		
		updateUsage: function(){
			
			
		},
		
		remove: function(){
			this.model.destroy();
		}

	});
	
	// Create player
	//var plMod = new raural.Player();
	//var pl = new raural.PlayerView({model: plMod});
	//var playerView = new raural.PlayerView({model: new raural.player()});
	//$('body').append(playerView.render().el);	
	
	// Create the shared Player View and link it to a new, blank Song Model
	var tempSong = new raural.Song();
	raural.Player = new raural.PlayerView({model: tempSong});	
	
	
});