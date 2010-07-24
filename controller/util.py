from django.utils import simplejson as json

def Output(self, json_dictionary):
  """Write the given dictionary to output."""
  self.response.headers["Content-Type"] = "application/json; charset=utf-8"
  self.response.out.write(json.dumps(dictionary))