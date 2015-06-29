var raural = raural || {};

$(function() {
	
	raural.SongView = Backbone.View.extend({
		
		tagName: 'li',
		
		template: _.template( $('#template-song').html() ),
		
		// DOM element events
		events: {
			'click ':			'handleClick',
			'click .remove':	'clear',
			'drag .reorder':	'reorder',
			'reorder':			'reorder'
		},
		
		// Model events
		initialize: function(){
			this.model.on('change', this.render, this );
			this.model.on('destroy', this.remove, this );
		},
		
		render: function(){
			this.$el.html(this.template(this.model.toJSON()));
			//this.$el.prepend(this.model.get("position"));

			if(this.model.get('buffering')){
				this.$el.append('<img class="bufferingOrb" src="/images/buffering.gif">');
			}
			
			if(this.model.get('inPlayer')){
				this.$el.addClass('active');
			}else{
				this.$el.removeClass('active');
				this.model.set({buffering: false, paused: false});
			}
			
			if(this.model.get('paused')){
				//this.$el.append('paused');
			}
			
			return this;
		},
		
		// *** Controller functions ***
		
		// Handler to determine whether to load this song into the player or play/pause it
		handleClick: function(){
			
			if(this.model.get('inPlayer')){
				
				// Song is already loaded in the player so it needs to be paused or unpaused
				
				if(this.model.get('paused')){
					
					// Song is paused so unpause it
					this.model.togglePaused();
					
				}else{
					
					// Song isn't paused so pause it
					this.model.togglePaused();
					
				}
				
			}else{
				
				this.model.toggleInPlayer();
				
			}
			
		},
				
		clear: function() {
			
			// Check if the removed Song is currently active in the player and if so, stop it playing
			if(this.model === raural.Songs.nowPlaying() && !this.model.get('paused')){
				this.model.set({inPlayer: false});
				window.raural.playerObject.stopVideo();
			}
			
			this.model.destroy();
			
			return false; // Don't let the click bubble up
			
		},
		
		reorder: function(event, index){

			this.$el.trigger('update-order', [this.model, index]);
			
			//this.model.save({ position: value });
			
		}
		
		
		
	});
	
	
	
}());