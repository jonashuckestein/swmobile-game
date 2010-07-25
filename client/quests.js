Quest = Class.extend({
  init : function(target, game) {
    this.game = game;
    this.target = target;
    this.targetMarker = new google.maps.Marker({
        position: new google.maps.LatLng(this.target.lat, this.target.lon),
        map: this.game.mapPanel.map,
        icon: new google.maps.MarkerImage(
                   "res/target.png")
      });
      
  },
  runAway: function(e) {
    this.game.you.data.experience -= 1;
    if(this.game.you.data.experience < 0) this.game.you.data.experience = 0;
    this.game.you.save();
    
    alert("How disgraceful! You lose 1 experience point!");
    this.fight.panel.destroy();
    this.game.mapPanel.recenter();
  },
  
  winFight: function(e) {
    alert(e.defeatText())
  },
  
  loseFight: function(e) {
    alert(e.winText());
  },
  
  log : function(msg) {
    this.fight.logPanel.body.insertFirst({
      tag: 'p',
      html: msg,
      cls: 'logMessage'
    });
  }
  
});

HippieHunt = Quest.extend({
  
  init : function(target, game) {
    
    // establish bounds of path to target
    this.bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(target.lat, target.lon),
      new google.maps.LatLng(game.you.data.lat, game.you.data.lon)
    );    
    
    game.mapPanel.map.panToBounds(this.bounds);
    
    
    this._super(target, game);
    
    this.toKill = Math.floor(Math.random()*5)+5; // at least 5!
    this.killed = 0;
    this.title = "Hippie Hunt";
        
    // insert hippies into the game world
    for(var i =0; i<this.toKill*4; i++) {
      var position = {lat: this.game.you.data.lat + 0.001*Math.random() - 0.0005,
                      lon: this.game.you.data.lon + 0.001*Math.random() - 0.0005
                      }
      this.game.entities.push(new Hippie(position, game));
    }

    

  },

    fightRound: function(e) {

      var y = this.game.you;
      
      var damage = y.attackRoll() - e.defenseRoll();
      // player attacks
      if(damage > 0) {
        this.log(e.getHitText(damage));
        
        // TODO some sort of animation that shows the impact of your hit
        e.data.current_health -= damage;
        if(e.data.current_health <= 0) {
          this.winFight(e);
          return;
        }
        // TODO update fight screen
        // TODO log event
      } else {
        // TODO abstract into generic text for monster
        this.log(e.evade());
      }
      
      // monster attacks
      damage = e.attackRoll() - y.defenseRoll();
      if(damage > 0) {

        this.log(e.hitText(damage))
          
        y.data.current_health -= damage;
        if(y.data.current_health <= 0) {
          this.loseFight(e);
          return;
        }
        // TODO update fight screen
        // TODO log event
      } else {
        this.log(e.failHit(damage))
      }
      
      this.fight.youPanel.update(y.getFightHTML());
      this.fight.enemyPanel.update(e.getFightHTML());
      
    },
      
       startFight : function(entity) {
         var self = this;

      this.fight = {};
      
        this.fight.youPanel = new Ext.Panel({
          html: this.game.you.getFightHTML()
        });
        
        this.fight.enemyPanel = new Ext.Panel({
          html: entity.getFightHTML()
        });
        
        this.fight.logPanel = new Ext.Panel({
          scrolls: true,
          cls: "fightLog",
          style: "background: #fff",
          flex: 0.3
        });
        
        
        
        this.fight.panel = new Ext.Panel({
          fullscreen: true,
          modal: true,
          style: "background: #f00",
          layout: {
            type: 'vbox',
            align: 'stretch'
          },
          items: [
            {
              layout: 'hbox',
              flex: 1.5,
              items: [this.fight.enemyPanel, this.fight.youPanel]
            },
            {
              layout: {
                type: 'hbox'
              },
              items: [{
                xtype: 'button',
                text: 'Fight!',
                handler: function(){return self.fightRound(entity)}
              },
              {
                xtype: 'button',
                text: 'Run away!',
                handler: function(){self.runAway()}
              }
              ]
            },
            this.fight.logPanel
          ]
          });


      }
  
  
  
  
  
});

