var raural = raural || {};

(function() {
	
	// Players Collection
	
	var Players = Backbone.Collection.extend({
		
		model: raural.Player,
			
	});
	
	raural.Players = new Players();
	
}());