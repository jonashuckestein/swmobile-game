from django.utils import simplejson as json

def Output(json_dictionary, response):
  """Write the given dictionary to output."""
  response.headers["Content-Type"] = "application/json; charset=utf-8"
  response.out.write(json.dumps(json_dictionary))