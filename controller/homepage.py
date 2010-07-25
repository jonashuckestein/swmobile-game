"""This is the Homepage."""

import os

from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from model import player as player_model


class HomepageHandler(webapp.RequestHandler):

  def get(self):
    player_query = player_model.Player.all()
    player_query.order("-total_distance_traveled_meters")
    
    players = []
    for player in player_query.fetch(3):
      players.append(player)
    
    self._OutputTemplate({"players": players}, "homepage.html")
  
  def _OutputTemplate(self, dict, template_name):
    path = os.path.join(os.path.dirname(__file__),
                        '../templates', 
                        template_name)
    self.response.out.write(template.render(path, dict))