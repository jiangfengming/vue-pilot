(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports);
    global.Router = mod.exports;
  }
})(this, function (module, exports) {
  'use strict';

  exports.__esModule = true;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class = function () {
    function _class(_ref) {
      var routes = _ref.routes,
          _ref$mode = _ref.mode,
          mode = _ref$mode === undefined ? 'history' : _ref$mode,
          base = _ref.base;

      _classCallCheck(this, _class);

      this.mode = mode;
      this.base = base;
      this.routes = this.parseRoutes(routes);
    }

    _class.prototype.parseRoutes = function parseRoutes(routes) {
      var _this = this;

      var parsed = [];
      routes.forEach(function (route) {
        if (route.path) {
          parsed.push([route.path, route.file, { meta: route.meta, props: route.props, layout: null }]);
        } else {
          var rts = _this.findRoutesInLayout(route);
          if (rts) rts.forEach(function (r) {
            return parsed.push([r.path, r.file, { meta: r.meta, props: r.props, layout: route }]);
          });
        }
      });
    };

    _class.prototype.findRoutesInLayout = function findRoutesInLayout(layout) {
      for (var name in layout) {
        var section = layout[name];
        if (section.routes) {
          return layout[name].routes;
        } else if (section.children) {
          var routes = this.findRoutesInLayout(section.children);
          if (routes) return routes;
        }
      }
    };

    return _class;
  }();

  exports.default = _class;
  module.exports = exports['default'];
});