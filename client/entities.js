var Entity = Class.extend({
  
  init: function(data, game) {
    this.game = game;
        
    this.data = {};

    this.data.lat = 0;
    this.data.lon = 0;
    
    this.picture = "res/unknown_picture.png";
    
    for(var key in data) {
      this.data[key] = data[key];
    }
    
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(this.data.lat, this.data.lon),
        map: this.game.mapPanel.map,
        icon: this.markerImage()
      });
      
  },

  getFightHTML: function() {
    
    return '<div class="fightStats"><div class="image"><img src="'+this.picture+'"/></div><table>'+
    '<tr><td colspan="2"><b>'+this.getName()+'</b></td></tr>' +
      '<tr><td class="label">Health&nbsp;</td><td>'+this.data.current_health+'/'+this.data.max_health+'</td></tr>' +
          '</table></div>';
    
  },
  
  markerImage : function() {
    return new google.maps.MarkerImage(
               "res/marker_"+this.data.type+".png");
  },
  
  setPosition: function(lat, lon) {
    if(lat !== undefined) this.data.lat = lat;
    if(lon !== undefined) this.data.lon = lon;
    this.marker.setPosition(new google.maps.LatLng(this.data.lat, this.data.lon));
  },
    
  destroy: function() {
    this.marker.setMap(null);
    delete this.data;
    delete this.marker;
    delete this;
  },

  attackRoll: function() {
    return Math.floor(Math.random()*this.data.strength);
  },
  
  // returns whether or not the entity died
  defenseRoll: function() {
    return Math.floor(Math.random()*this.data.defense);
  },
  
  getPicture: function() {
    return "res/unknown_picture.png";
  },
  
  dropItem : function() {
    return "You didn't find any items."
  }
  
});


var You = Entity.extend({
  
  // the callback is called once a full player object including position has arrived
  init : function(data, game, callback) {
    
    this._super(data, game);
      
      this.data.strength = 7;
      
    this.picture = "/avatars/1.jpg";
    this.title = this.data.email;
    this.marker.setTitle(this.title);
    this.circle = new google.maps.Circle({
            center: new google.maps.LatLng(this.data.lat, this.data.lon),
            fillColor: "#1623CC",
            fillOpacity: 0.1,
            map: game.mapPanel.map,
            radius: 150,
            strokeColor: "#1623CC",
            strokeOpacity: 0.6,
            strokeWeight: 1,
            zIndex: 0
          });
    
    // console.log("initialized YOU object", this)
    this.save(callback);
  },
  getName : function() {
    return "You";
  },
  
  save : function(callback) {
    var self = this;
    console.log("Saving self to server.");
    // TODO show loading icon somewhere
    Ext.Ajax.request({
      url: '/a/player',
      method: 'put',
      jsonData: this.data,
      success: function(response, opts) {
    	console.log("Successfully saved player data to server.");
        self.data = Ext.util.JSON.decode(response.responseText);
        console.log("Player data ", self.data);
        
        // TODO: maybe it is nicer to update the character panel
        // already even before the server confirms the update
        self.game.characterPanel.update(self);

        if (callback !== undefined) {
        	callback();
        }
      },
      failure : function(response, opts) {
        console.error("FAILED to save YOU", response, opts);
      }
    });
    
  },
  
  setPosition : function(lat, lon) {
    if(this.data.lat !== undefined &&
    		this.data.lon !== undefined &&
    		lat !== undefined &&
    		lon !== undefined) {
    	lat += Math.random() / 1000;
    	
    	var oldPosition = new google.maps.LatLng(this.data.lat, this.data.lon);
    	var newPosition = new google.maps.LatLng(lat, lon);
    	differenceMeters = distance(oldPosition, newPosition);
    	this.data.total_distance_traveled_meters += differenceMeters;
    }
	  
    this._super(lat, lon);
    this.circle.setCenter(new google.maps.LatLng(this.data.lat,this.data.lon));
    this.save();
  },
  
  markerImage : function() {
    return new google.maps.MarkerImage(
               "res/player.png",
               new google.maps.Size(16, 40));
  }
});


var Enemy = Entity.extend({
  
  init : function(data, game) {
    this._super(data, game);


    // set some really default default values
    this.data.strength = 3;
    this.data.defense = 3;
    this.data.level = 1;
    this.data.current_health = 11;
    this.data.max_health = 11;
    this.data.experience = 3;

    this.name = "Peter";
    var self = this;
    this.eventHandler = google.maps.event.addListener(this.marker, 'click', function() {
      if(confirm("Attack "+self.name+"?") )self.game.quest.startFight(self);
    });
    
  },
  
  // overload for plenty of funny names
  getName : function() {
    return this.name;
  },
  
  getHitText : function(damage) {
    return this.name + " got hit for " + damage + " damage!";
  },
  
  hitText : function(damage) {
    return this.name + " hits you for " + damage + " damage!";    
  },
  
  defeatText : function() {
    return this.name + " dies";
  },
  
  winText : function() {
    return this.name + " brutally slaughters you!!!!";
  },
  
  evade : function() {
    return "You fail to hit " + this.getName() +"!";
  },
  failHit : function() {
    return this.getName() + " fails miserably to hit you!"
  }
  
});

var Hippie = Enemy.extend({
  
  init : function(data, game) {
    data.type = 'hippie';
    this._super(data, game);

    this.experience = 4;
    var names = ["Smelly", "Holly", "Abraham"];
    this.name = names[Math.floor(Math.random()*names.length)] + " the Hippie";
  },
  
  dropItem : function() {
    
    if(Math.random() > 0.5) {
      return "you found no item"
    } else if(Math.random() > 0.5) {
      return "you found an item"
    } else if(Math.random() > 0.5) {
      return "you found a super rare item"
    } else {
      return "you found a potion of level up!"
    }
    
  },
  


  
});


var Suit = Enemy.extend({
  
  init : function(data, game) {
    data.type = 'suit';
    this._super(data, game);
    this.picture = "res/suit_picture5.jpg"
    this.experience = 4;
    var names = ["Steve the Snob"];
    this.name = names[Math.floor(Math.random()*names.length)];
  },
  
  dropItem : function() {
      return '<div id="item"><img src="res/Shirt.jpg"/>You steal the suit\'s button up shirt and tiedeye it. Good karma! You gain 3 strength points!</div>'
  },
  
  getHitText : function(damage) {
    
    this.picture = "res/suit_picture"+(Math.floor((this.data.current_health/this.data.max_health)*4)+1)+".jpg"
    
    
    var texts = [
      "You make fun of the corporate square and his lack of hipness. He loses <b>"+damage+" points</b> of power.",
      "You get the corporate square to share a joint with you. He gets <b>"+damage+" points</b> less uptight.",
      "You hug "+this.getName()+" and get sweat all over his new suit. He loses <b>"+damage+" points</b> of suit-esteem.",
      "You read poetry to the suit and he becomes <b>"+damage+" points</b> less shallow"
    ];
    return texts[Math.floor(Math.random()*texts.length)];
  },
  
  hitText : function(damage) {
    var texts = [
      this.getName()+" offers you a well-paying job. You take <b>"+damage+" points</b> of spirit-damage.",
      this.getName()+" knocks your joint into the sewers. You lose <b>"+damage+" points</b> from your hight",
      this.getName()+" breaks the strings on your guitar. You lose <b>"+damage+" points</b> of mellowness",
      this.getName()+" washes you with cold water and soap. You become less annoyin and take <b>"+damage+" points</b> of damage.",
    ];
    return texts[Math.floor(Math.random()*texts.length)];
  },
  
  defeatText : function() {
    return "You win, the corporate square quts his job and joins the commune! You gain <b>"+this.experience+" experience</b> points.";
  },
  
  winText : function() {
    return this.getName()+" crushed your your spirit. You are left with only one resistance point. Time to find a safe zone...";
  },
  
  evade : function() {
    return "The square is too slick. He <b>evades</b> your attempt to chill him out.";
  },
  failHit : function() {
    return this.getName() + " can't move in his suit. You <b>evade</b> his attack."
  }
  
});
