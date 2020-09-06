'use strict';

module.exports = function(app, mongoose) {
  require('./security')(app, mongoose);
  require('./portfolio')(app, mongoose);
  require('./trade')(app, mongoose);
};
