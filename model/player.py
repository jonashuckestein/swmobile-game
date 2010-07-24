"""This is the player's model"""

from google.appengine.ext import db

class Player(db.Model):

  user = db.UserProperty(required=True)

  location = db.GeoPtProperty(required=False)
  
  # Game attributes
  max_health = db.IntegerProperty(required=True)
  current_health = db.IntegerProperty(required=True)
  level = db.IntegerProperty(required=True, default=1)
  strength = db.IntegerProperty(required=True)
  dexterity = db.IntegerProperty(required=True)