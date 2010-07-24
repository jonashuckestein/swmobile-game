"""This is the player's controller."""

from google.appengine.api import users
from google.appengine.ext import webapp


class PlayerHandler(webapp.RequestHandler):

  def get(self):
    user = users.get_current_user()
    