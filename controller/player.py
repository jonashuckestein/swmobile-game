"""This is the player's controller."""

from google.appengine.api import users
from google.appengine.ext import webapp
from model import Player as PlayerModel
from controller import util

class PlayerHandler(webapp.RequestHandler):

  def get(self):
    user = users.get_current_user()
    player = PlayerModel.get_or_insert(user.user_id(), user=user)
    util.Output(self._AsJsonDict(player))
    
  def _AsJsonDict(self, player):
    d = {"email": player.user.email()}
    if player.location is not None:
      d["lat"] = player.location.lat
      d["lon"] = player.location.lon
    if player.max_health is not None and player.current_health is not None:
      