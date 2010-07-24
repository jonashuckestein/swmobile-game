"""I CONTROL THE WORLD.  MWAHAHAHAHA."""

import itertools
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
    def txn():
      world = self._GetWorld()
      if self._IsRecent(request_json, world):
        self._UpdateWorld(world)
        world.put()
      else:
        # Status 409 Conflict
        self.set_status(409)
      self._OutputWorld(world)

    db.run_in_transaction(txn)

  def _GetWorld(self):
    return world_model.World.get_or_insert("1")
  
  def _IsRecent(self, request_json, world):
    """Return true if the incoming request's payload has a timestamp that's
    equal to the timestamp of the world."""
    payload = simplejson.loads(self.request.body)
    return "timestamp" in payload and payload["timestamp"] >= world.timestamp
  
  def _UpdateWorld(self, world):
    payload = simplejson.loads(self.request.body)
    
    world_dict = {}
    for key, value in itertools.izip(world.keys, world.values):
      world_dict[key] = value
    
    for key in payload:
      if payload[key] is None:
        del world_dict[key]
      else:
        world_dict[key] = json.dumps(payload[key])
    
    world.timestamp = int(time.time() * 1000)
  
  def _OutputWorld(self, world):
    assert len(world.keys) == len(world.values)
    
    self.response.headers["Content-Type"] = "application/json; charset=utf-8"
    
    self.response.out.write("{")
    for key, value in itertools.izip(world.keys, world.values):
      self.response.out.write("\"%s\": {%s}," % (key, value))
    self.response.out.write("}")