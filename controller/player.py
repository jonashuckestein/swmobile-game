"""This is the player's controller."""

from controller import util
from django.utils import simplejson 
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.ext import webapp
from model import player as player_model


class PlayerHandler(webapp.RequestHandler):

  def get(self):
    util.Output(self._AsJsonDict(self._GetPlayer()), self.response)
  
  def put(self):
    player = self._GetPlayer()
    
    payload = simplejson.loads(self.request.body)
    if "lat" in payload and "lon" in payload:
      player.location = db.GeoPt(lat=payload["lat"], lon=payload["lon"])
    if "max_health" in payload:
      player.max_health = payload["max_health"]
    if "current_health" in payload:
      player.current_health = payload["current_health"]
    if "experience" in payload:
      player.experience = payload["experience"]
    if "level" in payload:
      player.level = payload["level"]
    if "strength" in payload:
      player.strength = payload["strength"]
    if "defense" in payload:
      player.defense = payload["defense"]

    player.put()
    
    # Output the current player state
    self.get()

  def _GetPlayer(self):
    user = users.get_current_user()
    return player_model.Player.get_or_insert(user.user_id(), user=user)
    
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
    if player.defense is not None:
      d["defense"] = player.defense
    return d