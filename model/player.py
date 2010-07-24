"""This is the player's model"""

from google.appengine.ext import db

class Player(db.Model):

  user = db.UserProperty(required=True)

  location = db.GeoPtProperty()
  
  # Game attributes
  max_health = db.IntegerProperty()
  current_health = db.IntegerProperty()
  experience = db.IntegerProperty()
  level = db.IntegerProperty()
  strength = db.IntegerProperty()
  dexterity = db.IntegerProperty()