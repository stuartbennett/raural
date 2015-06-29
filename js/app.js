var raural = raural || {};

// When the page is loaded create the raural app
$(function(){
	raural.App = new raural.AppView();	
});

function onYouTubePlayerReady(playerId){
	//raural.playerObject = document.getElementById("playerObject");
	//raural.playerObject.addEventListener("onStateChange", "raural.App.onPlayerStateChange");
	//raural.playerObject.addEventListener("onError", "raural.App.onPlayerError");
}	

function onPlayerStateChange(state){
	
}

function onPlayerReady(){
	
}

function onYouTubeIframeAPIReady(playerId){
	// Embed the player
      		raural.playerObject = new YT.Player('player', {
				height: '390',
				width: '640',
				videoId: '',
				events: {
					'onReady': onPlayerReady,
					'onStateChange': raural.App.onPlayerStateChange
				}
			});
}
