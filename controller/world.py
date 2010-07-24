"""I CONTROL THE WORLD.  MWAHAHAHAHA."""

import itertools
import logging
import time

from django.utils import simplejson 
from model import world as world_model
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.ext import webapp


class WorldHandler(webapp.RequestHandler):

  def get(self):
    self._OutputWorld(self._GetWorld())
  
  def put(self):
    def txn(request_json):
      world = self._GetWorld()
      if self._IsRecent(request_json, world):
        self._UpdateWorld(world)
        world.put()
      else:
        # Status 409 Conflict
        logging.info("Invalid game state updated, returning conflict.")
        self.response.set_status(409)
      self._OutputWorld(world)

    db.run_in_transaction(txn, self._GetRequestJson())
    
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
    return d
  
  def _PutWorldDict(self, world, world_dict):
    world.keys.clear()
    world.values.clear()
    
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
    return valid
  
  def _UpdateWorld(self, world):
    """In-place updates the given world with the request's body."""
    payload = self._GetRequestJson()
    
    world_dict = self._GetWorldDict(world)
    for key in payload:
      if payload[key] is None:
        del world_dict[key]
      else:
        world_dict[key] = simplejson.dumps(payload[key])

    world_dict["timestamp"] = str(int(time.time() * 1000))
  
  def _OutputWorld(self, world):
    assert world is not None
    assert len(world.keys) == len(world.values)
    
    self.response.headers["Content-Type"] = "application/json; charset=utf-8"
    
    self.response.out.write("{")
    
    elements = []
    for key, value in itertools.izip(world.keys, world.values):
      elements.append("\"%s\": %s" % (key, value))
    self.response.out.write(",".join(elements))
    
    self.response.out.write("}")