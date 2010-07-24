from controller import player
from controller import world
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util


def Application():
  return webapp.WSGIApplication([('/a/player', player.PlayerHandler),
                                 ('/a/world', world.WorldHandler)],
                                 debug=True)


def main():
  util.run_wsgi_app(Application())


if __name__ == '__main__':
  main()
