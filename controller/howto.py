"""This is the Howto page."""

import os
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template


class HowtoHandler(webapp.RequestHandler):

  def get(self):
    self._OutputTemplate({}, "howto.html")
  
  def _OutputTemplate(self, dict, template_name):
    path = os.path.join(os.path.dirname(__file__),
                        '../templates', 
                        template_name)
    self.response.out.write(template.render(path, dict))