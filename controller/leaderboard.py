"""This is the Leaderboard."""

import os

from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from model import player as player_model


class LeaderboardHandler(webapp.RequestHandler):

  def get(self):
    player_query = player_model.Player.all()
    player_query.order("-total_distance_traveled_meters")
    
    distance_traveled_miles = 0
    if player.total_distance_traveled_meters is not None:
      distance_traveled_miles = player.total_distance_traveled_meters / 1609.344
    
    players = []
    for player in player_query.fetch(10):
      players.append({"user": { "user_id": player.user.user_id(),
                                "nickname": player.user.nickname() },
                      "total_distance_traveled_miles": "%.2f" % (distance_traveled_miles)})
    
    self._OutputTemplate({"players": players}, "leaderboard.html")
  
  def _OutputTemplate(self, dict, template_name):
    path = os.path.join(os.path.dirname(__file__),
                        '../templates', 
                        template_name)
    self.response.out.write(template.render(path, dict))