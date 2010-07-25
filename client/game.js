
Ext.setup({
    icon: 'icon.png',
    tabletStartupScreen: 'TODO.png',
    phoneStartupScreen: 'TODO.png',
    glossOnIcon: true,
    onReady: function() {
      var worldRefreshLoop = function() {
        // TODO show loading icon somewhere
        Ext.Ajax.request({
            url: '/a/world',
            method: 'get',
            success: function(response, opts) {
                console.log("successfully received response", response, opts)
                updateWorldState(Ext.util.JSON.decode(response.responseText));
                setTimeout(function() {
                  console.log("waited 30 sec after receiving response, now do world refresh again");
                  worldRefreshLoop();
                }, 60000);
                // TODO hide loading icon
            },
            failure : function(response, opts) {
              console.log("FAILURE", response)
              // TODO hide loading icon
            }
        });
      };      
      var addWorldObject = function(key, object) {
        console.log("adding world object", key, object)
        var object_type = key.split(":")[0];
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(object.lat, object.lon),
            map: mapPanel.map,
            title: lib.entities[object_type].title,
            icon: lib.entities[object_type].marker
          });
        game.markers[key] = marker;
        game.worldState[key]= object;
      } 
      var updateWorldObject = function(key, object) {
        console.log("updating world object", key, object);
        game.worldState[key] = object; 
      }
      var removeWorldObject = function(key, object) {
        console.log("removing world object", key, object);
        delete game.worldState[key];
      }
      // if i receive 409, my version of gamestate is not new enough
      var updateWorldState = function(newWorldState) {
        console.log("will update world state", newWorldState);        
        // move players into first level of object for convenience
        for(var i=0; i<newWorldState.players.length; i++) {
          newWorldState["player:"+newWorldState.players[i].id] = newWorldState.players[i];
        }
        delete newWorldState.players;    
        // for all know world objects, check if they were updated or deleted
        // this partly consumes newWorldState
        for(var key in game.worldState) {
          if(!newWorldState.hasOwnProperty(key)) {
            removeWorldObject(key, game.worldState[key]);
          } else {
            updateWorldObject(key, newWorldState[key]);
            delete newWorldState[key];
          }
        }
        // all remaining keys in newWorldState must be new
        for(var key in newWorldState) {
          addWorldObject(key, newWorldState[key]);
        }
        // capture timestamp
        game.lastWorldTimestamp = newWorldState.timestamp;
        console.log("updated game state", game.worldState);
      }
      var startQuest = function(target) {
        mapPanel.map.setZoom(20);
        game.quest = new HippieHunt(target, game);


//        tabPanel.layout.setActiveItem(1);
//        questPanel.layout.setActiveItem(1);

  //      questPanel.items.items[1].update(game.quest);
        
      }

      
      // have a timer updating the gamestate as fast as possible with 1 sec delay after response comes in
      var questPanel = new Ext.Panel({
        
        
        title: 'Quest',
        iconCls: 'info',
        cls: 'quest',
        layout: {
          type: 'card'
        },
        scroll: 'vertical',
        items: [{
          xtype: 'panel',

          flex: 1,
          items: [
          {
              xtype: 'fieldset',
              title: 'Go on a quest to',
              defaults: {
                  required: true,
                  labelAlign: 'left'
              },
              items: [{
                  xtype: 'textfield',
                  name : 'name'
              }]
              },
          
            {
              xtype: 'button',
              text: 'Start quest',
              handler: function(){
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({
                  address: "1400 Washington St, 94109 San Francisco"
                }, function(response){
                
                  startQuest({
                    lat: response[0].geometry.location.lat(),
                    lon: response[0].geometry.location.lng()
                  });
                
                });

              }
            }
          ]
        },
        
        {
          xtype: 'component',
          tpl: [
          '<div class="profile">',
                '<div class="attrs">',
                  '<table>',
                  '<tr><td class="label">goal</td><td class="value">{title}</td></tr>',
                  '</table>',
                '</div>',
          '</div>'
          ]
        }
        
        
        ]
        
      });
// > 
// >       var currentQuestComponent = new Ext.Component({
// >           title: 'Current Quest',
// >           scroll: 'vertical',
// >           tpl: [
// >               '<div class="profile">',
// >                     '<div class="picture"><img src="{picture}"/></div>',
// >                     '<div class="attrs">',
// >                       '<table>',
// >                       '<tr><td class="label">Name</td><td class="value">{title}</td></tr>',
// >                       '<tr><td class="label">Level</td><td class="value">{data.level} (Exp: {data.experience})</td></tr>',
// >                       '<tr><td class="label">Health</td><td class="value">{data.current_health}/{data.max_health}</td></tr>',
// >                       '<tr><td class="label">Strength</td><td class="value">{data.strength}</td></tr>',
// >                       '<tr><td class="label">Defense</td><td class="value">{data.defense}</td></tr>',
// >                       '</table>',
// >                     '</div>',
// >               '</div>'
// >           ]       
// >       });
// >       
// >       var newQuestComponent = new Ext.Compenent({
// >         
// >       });
// >

      var characterPanel = new Ext.Component({
          title: 'Character',
          iconCls: 'user',
          cls: 'character',
          scroll: 'vertical',
          tpl: [
              '<div class="profile">',
                    '<div class="picture"><img src="{picture}"/></div>',
                    '<div class="attrs">',
                      '<table>',
                      '<tr><td class="label">Name</td><td class="value">{title}</td></tr>',
                      '<tr><td class="label">Level</td><td class="value">{data.level} (Exp: {data.experience})</td></tr>',
                      '<tr><td class="label">Health</td><td class="value">{data.current_health}/{data.max_health}</td></tr>',
                      '<tr><td class="label">Strength</td><td class="value">{data.strength}</td></tr>',
                      '<tr><td class="label">Defense</td><td class="value">{data.defense}</td></tr>',
                      '</table>',
                    '</div>',
              '</div>'
          ]       
      });
      var mapPanel = new Ext.Map({
          title: 'World',
          cls: 'world',
          iconCls: 'download',
          getLocation: true,
          mapOptions: {
              zoom: 12
          }
      });
      
        var tabPanel = new Ext.TabPanel({
            tabBar: {
                dock: 'bottom',
                layout: {
                    pack: 'center'
                }
            },
            fullscreen: true,
            ui: 'dark',
            animation: {
                type: 'slide',
                cover: true
            },
            defaults: {
                scroll: 'vertical'
            },
            items: [mapPanel, questPanel, characterPanel]
        });
                
        // world state
        var game = {
          lastTimestamp: 0,
          you: null,
          entities: {},
          entities: [],
          initialized : false,
          characterPanel: characterPanel,
          mapPanel: mapPanel,
          questPanel: questPanel
        };
        
        
      
        var initializeGame = function(loc) {
          
          // draw the player into the map
          //drawPlayer();
          
          // start world refresh loop
          //worldRefreshLoop();
          game.initialized = true;
           
           game.you = new You({
             lat: loc.latitude,
             lon: loc.longitude
           }, game, function() {
             console.log("saved user once", game.you);
           });

        };
        
        
        var geo = new Ext.util.GeoLocation();

        // this will be fired automatically as the getLocation property is set to true
        geo.on('update', function(loc){
          setTimeout(function() {
            if(!game.initialized) {
              initializeGame(loc);
            } else {
             game.you.setPosition(loc.latitude, loc.longitude);
             console.log(game.you.data)
            }
            
          }, 200);
        });
        
        setTimeout(function() {
          geo.updateLocation();
        }, 5000);
        
    }
});