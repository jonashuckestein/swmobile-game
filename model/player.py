"""This is the player's model"""

from google.appengine.ext import db

class Player(db.Model):

  user = db.UserProperty(required=True)

  location = db.GeoPtProperty()
  
  # Game attributes
  max_health = db.IntegerProperty(default=15)
  current_health = db.IntegerProperty(default=15)
  experience = db.IntegerProperty(default=0)
  level = db.IntegerProperty(default=1)
  strength = db.IntegerProperty(default=5)
  defense = db.IntegerProperty(default=5)
  reach = db.FloatProperty(default=50.0)
  
  # Leaderboard attributes
  total_distance_traveled_meters = db.FloatProperty(default=0.0)