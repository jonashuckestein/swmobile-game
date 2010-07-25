"""This is the Leaderboard."""

from google.appengine.ext import db
from google.appengine.ext import webapp
from model import player as player_model


class LeaderboardHandler(webapp.RequestHandler):

  def get(self):
    players = player.all()
    self._OutputTemplate({}, "leaderboard.html")
  
  def _OutputTemplate(self, dict, template_name):
    path = os.path.join(os.path.dirname(__file__),
                        '../templates', 
                        template_name)
    self.response.out.write(template.render(path, dict))