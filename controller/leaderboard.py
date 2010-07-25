"""This is the Leaderboard."""

import os

from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from model import player as player_model


class LeaderboardHandler(webapp.RequestHandler):

  def get(self):
    players = player_model.Player.all()
    players.order("-total_distance_traveled_meters")
    self._OutputTemplate({"players": players}, "leaderboard.html")
  
  def _OutputTemplate(self, dict, template_name):
    path = os.path.join(os.path.dirname(__file__),
                        '../templates', 
                        template_name)
    self.response.out.write(template.render(path, dict))