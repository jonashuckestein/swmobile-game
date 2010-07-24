'''
Created on Apr 27, 2010

Requires WebTest to be installed: http://pythonpaste.org/webtest/

@author: peterjdolan
'''
import main
import unittest
from model import player
from model import world
from model import event
from webtest import TestApp

class HandlerTestCase(unittest.TestCase):
  def setUp(self):
    self._app = TestApp(main.Application())
    self.__Cleanup()

  def tearDown(self):  
    self.__Cleanup()

  def __Cleanup(self):
    for x in player.Player.all().fetch(1000):
      x.delete()
    for x in world.World.all().fetch(1000):
      x.delete()
    for x in event.Event.all().fetch(1000):
      x.delete()
