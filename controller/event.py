"""This is the controller for the events in the world."""

import time

from controller import util
from django.utils import simplejson
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.ext import webapp
from model import player as player_model
from model import event as event_model


class EventHandler(webapp.RequestHandler):

  def get(self):
    self.error(403)
  
  def put(self):
    payload = simplejson.loads(self.request.body)
    
    location = None
    if "lat" in payload and "lon" in payload:
      location = db.GeoPt(payload["lat"], payload["lon"])
    else:
      self.error(403)
      return
      
    title = None
    if "title" in payload:
      title = payload["title"]
      
    type = None
    if "type" in payload:
      type = payload["type"]
      
    description = None
    if "description" in payload:
      description = payload["description"]

    record_time = int(time.time() * 1000)
    
    user = users.get_current_user()
    player = player_model.Player.get_or_insert(user.user_id(), user=user)
    event = event_model.Event(parent=player,
                              time=record_time,
                              location=location,
                              title=title,
                              type=type,
                              description=description)
    event.put()
