from django.utils import simplejson 
from google.appengine.ext import db
from tests import base

from controller import world
from model import world as world_model


class WorldHandlerTest(base.HandlerTestCase):

  def testInitialGet(self):
    response = self._app.get("/a/world", status=200)
    simplejson.loads(str(response.body))

  def testAttributePut(self):
    initial_response = self._app.get("/a/world", status=200)
    d = simplejson.loads(str(initial_response.body))
    timestamp = d["timestamp"]
    
    content = """{ "timestamp": %d, "a": 1 }""" % timestamp
    response = self._app.put("/a/world", params=content, status=200)

    res_a = str(response)
    
    response = self._app.get("/a/world", status=200)
    res_b = str(response)
    self.assertEquals(res_a, res_b)
    
    simplejson.loads(str(response.body))
