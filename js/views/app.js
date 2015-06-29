var raural = raural || {};

$(function(){
	
	// Raural top level view
	
	raural.AppView = Backbone.View.extend({
		
		// Bind this view to the container already in the page
		el: '#rauralApp',
		
		sessionUsageTemplate: _.template( $('#template-sessionUsage').html() ),
		
		// DOM element events
		events: {
			'keypress #searchBox': 'searchOnEnter',
			'click #searchButton': 'search',
			'click #share': 'share',
			'update-order':	'updateOrderAfterDrag',
			'mouseover h1#title': 'showTagline',
			'mouseleave h1#title': 'hideTagline'
		},

		initialize: function(){
			
			// Element hooks
			this.$searchBox = this.$('#searchBox');
			this.$searchButton = this.$('#searchButton');
			this.$shareButton = this.$('#share');
			this.$sessionUsage = this.$('#sessionUsage');
			
			// (Songs) Collection event bindings
			window.raural.Songs.on('add', this.addSong, this);
			window.raural.Songs.on('reset', this.addSongs, this);
			window.raural.Songs.on('change:completed', this.filterOne, this);
			window.raural.Songs.on('change:inPlayer', this.inPlayerChanged, this);
			window.raural.Songs.on('change:paused', this.pausedChanged, this);
			window.raural.Songs.on('remove', this.songRemoved, this);
			window.raural.Songs.on('filter', this.filterAll, this);
			window.raural.Songs.on('all', this.render, this);
			
			// v3
			// Embed player object
			//$('html').append('<div id="playerContainer"><object type="application/x-shockwave-flash" id="playerObject" data="" width="700" height="700"><param name="allowScriptAccess" value="always"><param name="bgcolor" value="#fff"><param name="allowFullScreen" value="false"></object></div>');
			
			// Embed the player container
			$('html').append('<div id="player"></div>');
			
			// Load the IFrame Player API code asynchronously
			var tag = document.createElement('script');
			tag.src = "//www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      		
			
			// Allow ordering of the songs
			$('#playlist').sortable({
		        stop: function(event, ui) {
		            ui.item.trigger('reorder', ui.item.index());
		        }
		    });
			
			//raural.Songs.fetch();
			
					
		},
		
		render: function(){

			if(raural.Songs.length){
			
				megsUsed = "20";
				this.$sessionUsage.html(this.sessionUsageTemplate({used: megsUsed}));
				
			}else{
				
				this.$sessionUsage.hide();
				
			}
			
		},
		
		// Reorder the Songs in the Songs collection to comply with the reordering that just happened
		updateOrderAfterDrag: function(event, draggedSong, newPosition){
		
			this.hideShareBox();
			
			// Original ordinal of the Song that has been dragged
			var originalOrdinal = draggedSong.get('position');
					
			var startPosition = newPosition;
			var draggedPosition = newPosition;
			
			// Dragging down the list needs to start a position later
			if(newPosition > originalOrdinal){
				// The song has been dragged down the list
				startPosition++;
				draggedPosition++;
			}
			
			// Update the ordinals of every song after it
			raural.Songs.each(function(song){
				
				if(song.get('position') >= startPosition){
					song.set('position', (song.get('position') + 1));
				}
				
			});
						
			draggedSong.set('position', draggedPosition);

	        // Re-sort and update ordinals
			raural.Songs.sort();
			raural.Songs.each(function(song, ordinal){
				song.set('position', ordinal);
			});
	       			
		},
		
		updateOrderAfterRemoval: function(){
			
			raural.Songs.each(function(song, index){
			
				var ordinal = index;
				
				song.set('position', ordinal);
			
			});
			
			raural.Songs.sort();
			
		},
		
		// Create a new Player view for the Player model that has already been added from the Songs View
		//addPlayer: function(player){
		//	var playerView = new raural.PlayerView({model: player});
		//	$('body').append(playerView.render().el);
		//},
		
		// Create a new view for a song and append it to the playlist unordered list
		addSong: function(song){

			console.log('creating new view and appending');

			var songView = new raural.SongView({model: song});
			$('#playlist').append(songView.render().el);
						
			// This only happens if a name isn't present but a song ID is,
			// as recent searches may not have their song IDs back yet
			if(!song.get("name") && song.get("songId")){
				
				// The song doesn't have a name yet so look it up and update the model
				this.lookupName(song);
				
			}
			
			this.updatePageTitle();
			
		},
		
		// Look up the name of a Song and update its model
		// (Only used if a Song was added to the Songs collection without a name being supplied, normally when the router is used)
		lookupName: function(song){
			
			$.getJSON('https://gdata.youtube.com/feeds/api/videos/' + song.get("songId") + '?v=2&alt=json-in-script&callback=?', function(data){
			
				song.set("name", window.raural.App.cleanseTitle(data.entry.title.$t));

			});
			
		},
		
		// Add all songs from the Songs collection to the playlist unordered list
		addSongs: function(){
		
			this.$('#playlist').html('');
			raural.Songs.each(this.addSong, this);
			
		},
		
		// If the enter key has been pressed in the search box, search
		searchOnEnter: function(e){
		
			if(e.which !== 13 || !this.$searchBox.val().trim()) {
				return;
			}
			
			this.search();

		},
		
		search: function(){
		
			if(!this.$searchBox.val()){
				$('input#searchBox').effect("shake", {times: 3}, 300);
				return;
			}
		
			this.hideShareBox();
		
			// Create a new Song model (which will persist to localStorage) for each result
			var loadingSong = raural.Songs.create({name: "loading", position: (window.raural.Songs.length)});
		
			// Find songs using the specified song/artist name
			var query = this.$searchBox.val();
			
			$.getJSON('http://gdata.youtube.com/feeds/api/videos?v=2&format=5&restriction=UK&q=' + query + '&orderby=relevance&start-index=' + (raural.Songs.where({query: query}).length || 1) + '&max-results=1&alt=json-in-script&callback=?', function(data){
				
				$.each(data.feed.entry, function(i, song) {
					
					// Update the song with the returned details
					loadingSong.set({name: window.raural.App.cleanseTitle(song.title.$t), query: query, songId: song.id.$t.split(":")[3]});		
					
					// Update the URL
					window.raural.App.updatePageTitle();						
				});

			});		
			
		},
		
		cleanseTitle: function(original){
		
			// Apply a few regular expressions to the original titles so that they're more appropriate

			var cleansed = original.replace(/video/i, "");
			cleansed = cleansed.replace(/\((.*?)\)/i, "");
			cleansed = cleansed.replace(/\[(.*?)\]/i, "");
			cleansed = cleansed.replace(/\*(.*?)\*/i, "");
			cleansed = cleansed.replace(/lyrics/i, "");
			cleansed = cleansed.replace(/itunes/i, "");
			cleansed = cleansed.replace(/official/i, "");
			cleansed = cleansed.replace(/hd/i, "");
			cleansed = cleansed.replace(/gopro/i, "");
			cleansed = cleansed.replace(/720/i, "");
			cleansed = cleansed.replace(/1080/i, "");
			cleansed = cleansed.replace(/\|/i, "");
			//cleansed = cleansed.replace(/now on itunes/i, "");
		
			// TODO: ADD OTHER REG EXPS HERE
			
			return cleansed;
		},
		
		// Present the user with a URL that they can use to share their playlist with others
		share: function(){
			
			//var playlistURL = "http://raural.com/#playlist/" + (raural.Songs.pluck("songId")).join("#");
			
			window.raural.App.updateShareButtons();

			// Show share buttons (which should already be up to date)
			$('div#shareBox').slideDown();
			
			// Start timer to hide the share buttons
			
						
			return false;
			
		},
		
		inPlayerChanged: function(changedSong){
			
			if(changedSong.get('inPlayer')){
				
				// This song is now to be loaded in the player
				
				// Start buffering indication early
				changedSong.set('buffering', true);
				
				// Confirm that the player object exists
				if(window.raural.playerObject){
				
					window.raural.playerObject.loadVideoById(changedSong.get('songId'), 1);	
				
				}else{
				
					// v3
					// Initialise it with this current song
					
					
	
						
					

					
					
					
					//var dataAddress = 'http://www.youtube.com/v/' + changedSong.get('songId') + '?autohide=1&theme=light&border=0&fs=1&rel=0&enablejsapi=1&playerapiid=player&autoplay=1&version=3&showinfo=0';
					//var params = { allowScriptAccess: "always", bgcolor: "#fff", allowFullScreen: false };
					//var atts = {id: "playerObject"};
					//swfobject.embedSWF(dataAddress, "playerObject", "700", "700", "8", null, null, params, atts);
					
				}
					
			}
			
		},
		
		pausedChanged: function(pausedSong){
			
			if(pausedSong.get('paused')){
				
				// This song is now to be paused
				window.raural.playerObject.stopVideo();
				
			}else{
				
				// This song was previously paused and should now be played
				window.raural.playerObject.playVideo();
				
			}
			
		},
		
		// Trigger the updating of the URL and re-rendering of the Facebook Send button
		songRemoved: function(){
			
			this.updatePageTitle();
			this.hideShareBox();
			this.updateOrderAfterRemoval();
			
		},
		
		// Update the page title to show the number of songs in the playlist
		// Also updates the URL so that the playlist can be shared in its current state
		updatePageTitle: function(){
			
			//$('title').html("A " + window.raural.Songs.length + "-song raural playlist");
			
			window.raural.Router.navigate("playlist/" + (raural.Songs.pluck("songId")).join("#"), {trigger: false, replace: true});
			
		},
		
		// Re-render the share buttons so that they use the correct URL
		updateShareButtons: function(){
		
			var $shareBox = $('div#shareBox');

			$shareBox.html('');
			
			// Twitter
			$shareBox.append('<div style="vertical-align: middle; width: 100px; height: 30px;"><a href="https://twitter.com/share" class="twitter-share-button" data-lang="en">Tweet</a></div><br/>');
			$('.twitter-share-button').attr('data-url', location.href);
			    $('.twitter-share-button').attr('data-hashtags', '#raural');
			    $('.twitter-share-button').attr('data-count', 'none');
			    $('.twitter-share-button').attr('data-size', 'medium');
			    $('.twitter-share-button').attr('data-text', 'Made a new raural playlist: ');
			if(typeof(twttr) !== 'undefined'){
			    twttr.widgets.load();
			}
			
			// Facebook
			$shareBox.append('<div id="fbSendContainer" style="vertical-align: middle; width: 100px; height: 30px;"><fb:send font="verdana"></fb:send></div><br/>');
			
			if(typeof(FB) !== 'undefined'){
				FB.XFBML.parse(document.getElementById('fbSendContainer'));
			}
			$('div.uiIconText').css("visibility", "hidden");
			
			// Update the Google Plus button
			$shareBox.append('<div id="gplus" class="g-plus" data-action="share" data-annotation="none" style="vertical-align: middle; height: 30px; width: 100px;"></div><br/>');
			if(typeof(gapi) !== 'undefined') {
			    gapi.plusone.render(document.getElementById('gplus'),{
			        'href': location.href,
			        'annotation': 'none',
			        'width': 90,
			        'align': 'left',
			        'size': 'medium'
			    });
			}
			
		},
		
		showTagline: function(){
			$('span#rauralDescription').show();			
		},
		
		hideTagline: function(){
			$('span#rauralDescription').hide();			
		},
		
		hideShareBox: function(){
			$('div#shareBox').slideUp(20, function(){
				window.raural.App.updateShareButtons();
			});	
		},
		
		// Find the next song in the playlist and play it
		playNextInList: function(){

			raural.Songs.nextSong().toggleInPlayer();
						
		},
		
		// Handle the player object changing state
		onPlayerStateChange: function(state){

			switch(state.data){
				
				case -1:
					// Check if there is a Song in the player
					// (or whether it is just the player initialising)
					if(raural.Songs.nowPlaying()){
					
						// Check if the Song in the player isn't just paused
						if(!raural.Songs.nowPlaying().get('paused')){
							raural.Songs.nowPlaying().set("buffering", true);
						}

					}
					
				break;
				
				case 0: // Finished playing
				
					raural.App.playNextInList();
					
				break;
				
				case 1: // Playing

					raural.Songs.nowPlaying().set("buffering", false);
					raural.Songs.nowPlaying().set("paused", false);
				
				break;
				
				case 2: // Paused

					raural.Songs.nowPlaying().set("paused", true);
					//raural.Songs.nowPlaying().set("buffering", true);
				
				break;
				
				case 3: // Buffering

					raural.Songs.nowPlaying().set("buffering", true);
					
				break;
				
				case 5: // Something
				
				break;
			}
			
		},
		
		onPlayerReady: function(){
			
		},
		
		// Remove the current Song as there was a problem playing it
		onPlayerError: function(error){
			raural.Songs.remove(raural.Songs.nowPlaying());
		}
		
		
	});
	
	
	
});