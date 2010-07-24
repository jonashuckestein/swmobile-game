"""This is the world model.  There is only one."""

from google.appengine.ext import db

class World(db.Model):
  
  keys = db.StringListProperty()
  values = db.StringListProperty()