/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();







    
      // utilities
      var kRadiusOfEarthMeters = 6378100;

      // Takes the position object from the navigator's location services,
      // returns a google.maps.LatLng
      function latLngFromPosition(position) {
        return new google.maps.LatLng(position.coords.latitude,
                                      position.coords.longitude);
      }

      // Convert degrees to radians.
      function toRadians(degrees) {
        return degrees * Math.PI / 180;
      }

      // Distance, in meters, between points a and b
      // a and b are both google.maps.LatLng
      function distance(a, b) {
        // Haversine formula, from http://mathforum.org/library/drmath/view/51879.html
        dLat = a.lat() - b.lat();
        dLon = a.lng() - b.lng();
        var x = Math.pow(Math.sin(toRadians(dLat / 2)), 2) +
            Math.cos(toRadians(a.lat())) *
              Math.cos(toRadians(b.lat())) *
                Math.pow(Math.sin(toRadians(dLon / 2)), 2);
        var greatCircleDistance = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
        return kRadiusOfEarthMeters * greatCircleDistance;
      }

      // origin and target are google.maps.LatLng, distanceMeters is numeric
      function latLngTowardTarget(origin, target, distanceMeters) {
        dLat = target.lat() - origin.lat();
        dLon = target.lng() - origin.lng();

        dist = distance(origin, target);
        offsetLat = dLat * distanceMeters / dist;
        offsetLng = dLon * distanceMeters / dist;
        return new google.maps.LatLng(origin.lat() + offsetLat, origin.lng() + offsetLng);
      }

      // Get a random latitude and longitude near the given point.
      function randomLatLngNearLocation(origin, distanceMeters) {
        var randLat = origin.lat() + Math.random() - 0.5;
        var randLng = origin.lng() + Math.random() - 0.5;
        var targetLoc = new google.maps.LatLng(randLat, randLng);
        return latLngTowardTarget(origin, targetLoc, distanceMeters);
      }





