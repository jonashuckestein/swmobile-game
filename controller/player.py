"""This is the Leaderboard."""

import os

from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from model import player as player_model


class PlayerHandler(webapp.RequestHandler):

  def get(self):
    id = self.request.get("id")
    if id is None:
      self.error(403)
    
    player = player_model.Player.get_by_key_name(id)
    self._OutputTemplate({"player": {"user": { "nickname": player.user.nickname(),
                                               "email": player.user.email(),
                                               "user_id": player.user.user_id() },
                                     "level": player.level,
                                     "experience": player.experience,
                                     "current_health": player.current_health,
                                     "max_health": player.max_health,
                                     "strength": player.strength,
                                     "defense": player.defense,
                                     "reach_feet": int(player.reach * 0.3048),  # convert meters to feet
                                     "total_distance_traveled_miles": "%.2f" % (player.total_distance_traveled_meters / 1609.344),
                                      }},
                         "player.html")
  
  def _OutputTemplate(self, dict, template_name):
    path = os.path.join(os.path.dirname(__file__),
                        '../templates', 
                        template_name)
    self.response.out.write(template.render(path, dict))