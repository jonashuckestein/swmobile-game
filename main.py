from controller import homepage
from controller import leaderboard
from controller import player
from controller.api import event
from controller.api import player as player_api
from controller.api import world
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util


def Application():
  return webapp.WSGIApplication(
      [('/a/event', event.EventHandler),
       ('/a/player', player_api.PlayerHandler),
       ('/a/world', world.WorldHandler),
       ('/s/leaderboard', leaderboard.LeaderboardHandler),
       ('/s/player', player.PlayerHandler),
       ('/', homepage.HomepageHandler)],
      debug=True)


def main():
  util.run_wsgi_app(Application())


if __name__ == '__main__':
  main()
