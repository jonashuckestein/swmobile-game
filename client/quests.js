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
      
      
      // TODO remove this
      this.game.you.data.current_health = this.game.you.data.max_health;
      
  },
  
  runAway: function(e) {
    this.game.you.data.experience -= 1;
    if(this.game.you.data.experience < 0) this.game.you.data.experience = 0;
    this.game.you.save();
    alert("How disgraceful! You lose 1 experience point!");
    this.endFight();
  },

  endFight :function() {
    
    this.game.you.save();
    
    this.fight.panel.destroy();
    this.game.mapPanel.recenter();
    
    // did we win the quest yet?
    if(this.questDone()) {
      this.endQuest();
    }
  },
  
  endQuest : function() {
    
  },
  
  
  questDone : function() {
    return false;
  },
  
    
  winFight: function(e) {
    
    // make sure we get experience
    this.game.you.data.experience += e.experience;
    
    var self = this;
    var fightResult = new Ext.Panel({
      cls: 'questPopupWin',
      fullscreen: true,
      items: [{
        xtype: 'component',
        cls: 'winFightText',
        html: e.defeatText()
      },
      {
        xtype: 'component',
        cls: "foundItem",
        html: e.dropItem()
      },
      {
        xtype: 'button',
        text: "Good.",
        handler: function(){
          fightResult.destroy();
          self.endFight();
        }
      }
      ]
    });
    // remove enemy from the map
    e.destroy();
    
  },
  
  loseFight: function(e) {
    
    this.game.you.data.current_health = 1;
    var self = this;
    var fightResult = new Ext.Panel({
      cls: 'questPopupLose',
      fullscreen: true,
      items: [{
        xtype: 'component',
        cls: 'loseFightText',
        html: e.winText()
      },
      {
        xtype: 'button',
        text: "Damn.",
        handler: function(){
          fightResult.destroy();
          self.endFight();
        }
      }
      ]
    });
    
  },
  
  log : function(msg) {
    this.fight.logPanel.body.insertFirst({
      tag: 'p',
      html: msg,
      cls: 'logMessage'
    });
  },
  
  fightRound: function(e) {

    var y = this.game.you;
    
    var damage = y.attackRoll() - e.defenseRoll();
    // player attacks
    if(damage > 0) {
      this.log(e.getHitText(damage));
      
      // the enemy has lost
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
        html: this.game.you.getFightHTML(),
        id: "youPanel",
        flex: 1
      });
      
      this.fight.enemyPanel = new Ext.Panel({
        html: entity.getFightHTML(),
        id: "enemyPanel",
        flex: 1
      });
      
      this.fight.logPanel = new Ext.Panel({
        id: "fightLog",
        items: {
          html: '&nbsp;',
          scroll: "vertical"
        },
        height: "30%",
        dockedItems: [{
            dock: 'top',
            xtype: 'toolbar',
            title: 'Event Log',
            ui: 'metal'
        }],
      });
      
      
      
      this.fight.panel = new Ext.Panel({
        fullscreen: true,
        modal: true,
        style: "background: #fff",
        layout: {
          type: 'vbox',
          align: 'top',
          pack: 'center'
        },
        items: [
          {
            layout: {
              type: 'hbox',
              align: 'stretch',
              pack: 'center'
            },
            flex: 1,
            items: [this.fight.enemyPanel, this.fight.youPanel]
          },
          this.fight.logPanel,
          {
            layout: {
              type: 'hbox',
              pack: 'center',
              align: 'stretch'
            },
            items: [{
              flex: 1,
              xtype: 'button',
              text: 'Fight!',
              handler: function(){return self.fightRound(entity)}
            },
            {
              flex: 1,
              xtype: 'button',
              text: 'Run away!',
              handler: function(){self.runAway()}
            }
            ]
          }
        ]
        });


    }

  
  
  
  
});

HippieUprising = Quest.extend({
  
  init : function(target, game) {
    
    // establish bounds of path to target
    this.bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(target.lat, target.lon),
      new google.maps.LatLng(game.you.data.lat, game.you.data.lon)
    );    
    
    game.mapPanel.map.panToBounds(this.bounds);
    
    this._super(target, game);
    
    this.toKill = Math.floor(Math.random()*5)+1; // at least 5!
    this.killed = 0;

    this.game.questPanel.layout.setActiveItem(1);
    this.game.questPanel.items.items[1].update(this.getQuestHTML());
        
    // insert hippies into the game world
    for(var i =0; i<this.toKill*4+8; i++) {
      
      var position = randomLatLngNearLocation(this.bounds.getCenter(), Math.random()*distance(this.bounds.getCenter(), this.bounds.getNorthEast()));
      this.game.entities.push(new Suit({
        lat: position.lat(),
        lon: position.lng()        
      }, game));
    }
    
 
    // insert one hippie really close to the player
    var position = randomLatLngNearLocation(new google.maps.LatLng(this.game.you.data.lat, this.game.you.data.lon), 20);
    this.game.entities.push(new Suit({
      lat: position.lat(),
      lon: position.lng()        
    }, game));

    var self = this;
    var questPopup = new Ext.Panel({
      cls: 'questPopupFullscreen',
      fullscreen: true,
      items: [{
        xtype: 'component',
        html: this.getQuestHTML()
      },
      {
        xtype: 'button',
        text: 'Okay, let\'s go!',
        handler: function() {
          questPopup.destroy();
          self.game.tabPanel.layout.setActiveItem(0);
        }
      }
      ]
    });    

  },
  
  getQuestTitle : function() {
    return '<div class="questTitle">Join the Hippie Uprising!</div>';
  },
  
  getQuestStatus : function() {
    return '<div class="questStatus">Hippies remaining: 5</div>';
  },
  
  getQuestHTML : function() {
    return '<div class="questHTML"><h3><b>Flower Power</b></h3><img src="http://www.dragoart.com/tuts/pics/5/2631/how-to-draw-a-hippie.jpg" height="100"/><br>The hippies need your help to make all the suits and squares more chill. You need to defeat '+this.toKill+' suits, hippie-style!</div>';
  },
  


  
  
  
});

