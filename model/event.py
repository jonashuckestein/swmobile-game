"""This is an event in a player's life."""

from google.appengine.ext import db

class Event(db.Model):
  """The parent of an event is always a player."""
  
  location = db.GeoPtProperty(required=True)

  title = db.TextProperty()
  type = db.StringProperty()
  description = db.TextProperty()
  
  # milliseconds since the epoch.
  time = db.IntegerProperty()