var request = require('request');
var cheerio = require('cheerio');

module.exports = NodeHelper.create({
  start: function () {
    console.info('Starting node helper for: ' + this.name);
  },

  socketNotificationReceived: function(notification, payload) {
     if (notification === 'GET_EMBALSES') {
       this.getEmbalses();
     }
  },

  getEmbalses: function() {
    var self = this;
    var j = request.jar();

    var url = 'https://www.embalses.net';

    request({url: url, jar: j}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body);

        var table = [];
        $('div.SeccionCentral_Caja > div.FilaSeccion').each(function(index, element) {
          var fila = [];

          // Get rid of the <strong> tags
          $('strong', element).replaceWith(function() { return $(this).contents(); });
          // Remove all style attributes
          $(element).find('*').removeAttr("style");

          $('div', element).each(function(index, e) {
            // Remove : from the end of the string
            fila.push($(e).html().toString().replace(/:$/, ''));
          });

          if (fila != []) {
            table.push(fila);
          }
        });

        var graph = $('div.Grafico img').attr('src');
        if (graph.startsWith('/')) {
          graph = url + graph;
        }

        self.sendSocketNotification('CURRENT_EMBALSES', {
          table: table,
          graph: graph,
        });
      }
    });

  },

});
