"""I CONTROL THE WORLD.  MWAHAHAHAHA."""

import itertools
import logging
import time

from django.utils import simplejson 
from model import player as player_model
from model import world as world_model
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.ext import webapp


class WorldHandler(webapp.RequestHandler):

  def get(self):
    self._OutputWorld(self._GetWorld())
  
  def put(self):
    logging.debug("World put request.")
    def txn(request_json):
      logging.debug("World update transaction.")
      world = self._GetWorld()
      if self._IsRecent(request_json, world):
        world_dict = self._GetWorldDict(world)
        world_dict = self._UpdateWorldDict(world_dict)
        self._PutWorldDict(world, world_dict)
      else:
        # Status 409 Conflict
        logging.info("Invalid game state updated, returning conflict.")
        self.response.set_status(409)
      return world

    world = db.run_in_transaction(txn, self._GetRequestJson())
    self._OutputWorld(world)
    
  def _GetRequestJson(self):
    return simplejson.loads(self.request.body)

  def _GetWorld(self):
    w = world_model.World.get_by_key_name("1")
    if w is None:
      w = world_model.World(key_name="1")

    assert len(w.keys) == len(w.values)
    if len(w.keys) == 0:
      w.keys.append("timestamp")
      w.values.append(str(int(time.time() * 1000)))

    w.put()
    return w
  
  def _GetWorldDict(self, w):
    d = {}
    for key, value in itertools.izip(w.keys, w.values):
      d[key] = value
    logging.debug("Constructed world dictionary: %s" % d)
    return d
  
  def _PutWorldDict(self, world, world_dict):
    logging.debug("_PutWorldDict - Updating world to: %s" % world_dict)
    world.keys = []
    world.values = []
    
    for key in world_dict:
      world.keys.append(key)
      world.values.append(world_dict[key])
    
    world.put()
  
  def _IsRecent(self, request_json, world):
    """Return true if the incoming request's payload has a timestamp that's
    equal to the timestamp of the world."""
    world_dict = self._GetWorldDict(world)
    payload = simplejson.loads(self.request.body)
    valid = "timestamp" in payload and \
        payload["timestamp"] >= int(world_dict["timestamp"])
    if not valid:
      logging.debug("Invalid request timestamp.  Payload: %s; World: %s" %
                    (payload, world_dict))
    else:
      logging.debug("Request passed world timestamp check.  Payload: %s; "
                    "World: %s" % (payload, world_dict))
    return valid
  
  def _UpdateWorldDict(self, world_dict):
    """In-place updates the given world with the request's body."""
    logging.debug("Updating world.")
    payload = self._GetRequestJson()
    
    for key in payload:
      value = payload[key]
      logging.debug("Updating attribute '%s' to '%s'" % (key, value))
      if value is None:
        logging.debug("Deleting attribute '%s'" % key)
        del world_dict[key]
      else:
        dumped = simplejson.dumps(value)
        logging.debug("Writing value '%s'" % dumped)
        world_dict[key] = dumped

    timestamp = str(int(time.time() * 1000))
    logging.debug("Updating world timestamp to %s" % timestamp)
    world_dict["timestamp"] = timestamp
    
    return world_dict
  
  def _OutputWorld(self, world):
    assert world is not None
    assert len(world.keys) == len(world.values)
    
    self.response.headers["Content-Type"] = "application/json; charset=utf-8"
    
    self.response.out.write("{")
    
    elements = []
    for key, value in itertools.izip(world.keys, world.values):
      elements.append("\"%s\": %s" % (key, value))
    
    players = player_model.Player.all().fetch(1000)
    p_list = []
    for player in players:
      p_d = {"email": player.user.email(), 
             "nickname": player.user.nickname(),
             "id": int(player.user.user_id())}
      if player.location is not None:
        p_d["lat"] = player.location.lat
        p_d["lon"] = player.location.lon
      p_list.append(p_d)
    elements.append("\"%s\": %s" % ("players", simplejson.dumps(p_list)))
    
    self.response.out.write(",".join(elements))
    
    self.response.out.write("}")