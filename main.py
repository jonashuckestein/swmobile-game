from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from controller import player


def main():
  application = webapp.WSGIApplication([('/a/player', player.PlayerHandler)],
                                       debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
