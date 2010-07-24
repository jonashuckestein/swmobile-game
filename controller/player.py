"""This is the player's controller."""

from google.appengine.api import users
from google.appengine.ext import webapp
from model import Player as PlayerModel
from controller import util

class PlayerHandler(webapp.RequestHandler):

  def get(self):
    util.Output(self._AsJsonDict(self._GetPlayer()))
  
  def put(self):
    player = self._GetPlayer()
    
    # TODO: Write updates
    
    # Output the current player state
    self.get()

  def _GetPlayer(self):
    user = users.get_current_user()
    return PlayerModel.get_or_insert(user.user_id(), user=user)
    
  def _AsJsonDict(self, player):
    d = {"email": player.user.email()}
    if player.location is not None:
      d["lat"] = player.location.lat
      d["lon"] = player.location.lon
    if player.max_health is not None and player.current_health is not None:
      d["max_health"] = player.max_health
      d["current_health"] = player.current_health
    if player.experience is not None:
      d["experience"] = player.experience
    if player.level is not None:
      d["level"] = player.level
    if player.strength is not None:
      d["strength"] = player.strength
    if player.dexterity is not None:
      d["dexterity"] = player.dexterity
    return d