"""This is the player's controller."""

import logging

from controller.api import util
from django.utils import simplejson 
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.ext import webapp
from model import player as player_model


class PlayerHandler(webapp.RequestHandler):

  def get(self):
    util.Output(self._AsJsonDict(self._GetPlayer()), self.response)
  
  def put(self):
    logging.debug("Putting player, request body: %s" % self.request.body)
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
    if "total_distance_traveled_meters" in payload:
      player.total_distance_traveled_meters = \
          payload["total_distance_traveled_meters"]
    if "reach" in payload:
      player.reach = float(payload["reach"])

    player.put()
    
    # Output the current player state
    self.get()

  def _GetPlayer(self):
    user = users.get_current_user()
    player = player_model.Player.get_or_insert(user.user_id(), user=user)
    
    # Update defaults.
    if player.reach is None:
      player.reach = 50.0

    return player
    
  def _AsJsonDict(self, player):
    d = {"email": player.user.email(),
         "id": int(player.user.user_id()),
         "total_distance_traveled_meters":
             player.total_distance_traveled_meters,
         "max_health": player.max_health,
         "current_health": player.current_health,
         "experience": player.experience,
         "level": player.level,
         "strength": player.strength,
         "defense": player.defense,
         "reach": player.reach }
    if player.location is not None:
      d["lat"] = player.location.lat
      d["lon"] = player.location.lon
    return d
