var request = require('hyperquest');
var joi = require('joi');

var ROOT_URL = 'http://api.openweathermap.org/data/2.5';
var SECOND = 1000;
var qs = require('querystring');
var plugin = {
  register: function(server, options, next) {
    function openweather(type, query, next) {
      var r = request(ROOT_URL + '/' + type + '?' + query);
      var data = '';
      r.on('data', function(chunk){
        data += chunk;
      });
      r.on('end', function(){
        var obj = {};
        try {
          obj = JSON.parse(data);
        } catch (ex) {
          return next(ex);
        }
        next(null, obj);
      });
      r.on('error', next);
    }
    server.method('openweather', openweather, {
      cache: {
        expiresIn: 60 * SECOND
      }
    }); 
    server.route({
      method: 'GET',
      path: '/weather/current',
      config: {
        handler: function(req, res) {
          server.methods.openweather('weather', qs.stringify(req.query), function(err, data) {
            res(err || data);
          });
        },
        validate: {
          query: {
            q: joi.string().insensitive().required()
          }
        }
      }
    });
    server.route({
      method: 'GET',
      path: '/weather/forecast',
      config: {
        handler: function(req, res) {
          server.methods.openweather('forecast', qs.stringify(req.query), function(err, data) {
            res(err || data);
          });
        },
        validate: {
          query: {
            q: joi.string().insensitive().required()
          }
        }
      }
    });
  }
}

plugin.register.attributes = require(__dirname + '/package.json');
module.exports = plugin;
