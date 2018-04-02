/* global Module */

/* Magic Mirror
 * Module: HelloWorld
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("MMM-embalses",{

	// Default module config.
	defaults: {
    initialLoadDelay: 0, // 0 seconds delay
    retryDelay: 2500,
    updateInterval: 24 * 60 * 60 * 1000, // every 24 hours
    animationSpeed: 1000,
	},

  getTemplate: function () {
		return 'embalses.njk';
	},

  getStyles: function() {
    return [this.file('embalses.css')];
  },

	getTemplateData: function () {
		return this.config.data;
	},

  start: function() {
    Log.info('Starting module: ' + this.name);

    this.config.data = {loading: true};
    this.update_timer = null;
    this.scheduleUpdate(this.config.initialLoadDelay);
  },

  suspend: function() {
    if (this.update_timer) {
      clearTimeout(this.update_timer);
      this.update_timer = -1;
    }
  },

  resume: function() {
    this.update_timer = null;
    this.config.data.loading = true;
    this.scheduleUpdate(this.config.initialLoadDelay);
  },

  scheduleUpdate: function(delay) {
    if (this.update_timer == -1) { return; }
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
    }

    var self = this;
    this.update_timer = setTimeout(function() {
      self.updateEmbalses();
    }, nextLoad);
  },

  updateEmbalses: function() {
    Log.info('Updating embalses');
    this.sendSocketNotification('GET_EMBALSES', { });
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === 'CURRENT_EMBALSES') {
      Log.info('Query result: ' + this.name);

      this.config.data.loading = false;
      this.config.data.table = payload.table;
      this.config.data.graph = payload.graph;
      // Log.info(this.config.data);
      this.updateDom(this.config.animationSpeed);
    }
  },

});
