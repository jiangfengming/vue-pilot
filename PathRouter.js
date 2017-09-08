(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.PathRouter = factory());
}(this, (function () { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var PathHistory = createCommonjsModule(function (module, exports) {
(function (global, factory) {
	module.exports = factory();
}(commonjsGlobal, (function () { 'use strict';

function appendSearchParams(searchParams, q) {
  switch (q.constructor) {
    case Object:
      for (var name in q) {
        searchParams.append(name, q[name]);
      }break;
    case String:
      q = new URLSearchParams(q);
    case URLSearchParams:
      q = Array.from(q);
    case Array:
      for (var _iterator = q, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref2;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref2 = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref2 = _i.value;
        }

        var _ref = _ref2;
        var _name = _ref[0];
        var value = _ref[1];
        searchParams.append(_name, value);
      }break;
  }
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var SUPPORT_HISTORY_API = (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.history && window.history.pushState;
var SUPPORT_HISTORY_ERR = 'Current environment doesn\'t support History API';

var _class$2 = function () {
  function _class(_ref) {
    var _ref$beforeChange = _ref.beforeChange,
        beforeChange = _ref$beforeChange === undefined ? function () {} : _ref$beforeChange,
        change = _ref.change;
    classCallCheck(this, _class);

    this.beforeChange = beforeChange;
    this.change = change;
    this.current = null;
  }

  _class.prototype.start = function start(loc) {
    var _this = this;

    if (!loc && SUPPORT_HISTORY_API) loc = this._getCurrentLocationFromBrowser();else loc = this.normalize(loc);

    this._beforeChange('init', loc);

    if (SUPPORT_HISTORY_API) {
      this._onpopstate = function () {
        _this._beforeChange('popstate', _this._getCurrentLocationFromBrowser());
      };

      window.addEventListener('popstate', this._onpopstate);
    }
  };

  _class.prototype.url = function url(loc) {
    if (loc.constructor === Object) loc = this.normalize(loc).fullPath;
    return this._url(loc);
  };

  _class.prototype.normalize = function normalize(loc) {
    if (loc.constructor === String) {
      loc = { path: loc };
    } else {
      loc = Object.assign({}, loc);

      if (loc.fullPath) return loc; // normalized
    }

    if (loc.external || /^\w+:\/\//.test(loc.path)) {
      loc.path = this._extractPathFromExternalURL(new URL(loc.path, 'file://'));
      delete loc.external;
    }

    var url = new URL(loc.path, 'file://');
    if (loc.query) appendSearchParams(url.searchParams, loc.query);
    if (loc.hash) url.hash = loc.hash;

    return Object.assign(loc, {
      path: url.pathname,
      query: url.searchParams,
      hash: url.hash,
      fullPath: url.pathname + url.search + url.hash,
      state: loc.state || {}
    });
  };

  _class.prototype._getCurrentLocationFromBrowser = function _getCurrentLocationFromBrowser() {
    var state = window.history.state || {};
    var loc = this.normalize(state.path || this._extractPathFromExternalURL(window.location));
    loc.state = state.state || {};
    if (state.path) loc.hidden = true;
    return loc;
  };

  /*
    init
    success: nop                       fail: _beforeChange('replace', current)       redirect: _beforeChange('replace', redirect)
     push
    success: pushState(to)             fail: nop                                     redirect: _beforeChange('push', redirect)
     replace
    success: replaceState(to)          fail: nop                                     redirect: _beforeChange('replace', redirect)
     popstate
    success: nop                       fail: __changeHistory('push', current)        redirect: _beforeChange('push', redirect)
     dispatch
    success: nop                       fail: nop                                     redirect: _beforeChange('dispatch', redirect)
  */


  _class.prototype._beforeChange = function _beforeChange(op, to) {
    var _this2 = this;

    // to is the same as current and op is push, set op to replace
    if (this.current && to.path === this.current.path && to.query.toString() === this.current.query.toString() && op === 'push') op = 'replace';

    Promise.resolve(this.beforeChange(to, this.current, op)).then(function (ret) {
      if (ret == null || ret === true) {
        if (op === 'push' || op === 'replace') _this2.__changeHistory(op, to);
        _this2.current = to;
        _this2.change(to);
      } else if (ret.constructor === String || ret.constructor === Object) {
        if (op === 'init') op = 'replace';else if (op === 'popstate') op = 'push';else if (ret.method) op = ret.method;
        _this2._beforeChange(op, _this2.normalize(ret));
      } else if (ret === false) {
        if (op === 'popstate') _this2.__changeHistory('push', _this2.current);
      }
    });
  };

  _class.prototype.dispatch = function dispatch(to) {
    to = this.normalize(to);
    this._beforeChange('dispatch', to);
  };

  /*
    {
      path,
      query,
      hash,
      state,
      hidden
    }
  */


  _class.prototype.push = function push(to) {
    this._changeHistory('push', to);
  };

  _class.prototype.replace = function replace(to) {
    this._changeHistory('replace', to);
  };

  _class.prototype.setState = function setState(state) {
    Object.assign(this.current.state, state);
    this.__changeHistory('replace', this.current);
  };

  _class.prototype._changeHistory = function _changeHistory(method, to) {
    to = this.normalize(to);
    if (to.silent) {
      this.__changeHistory(method, to);
      this.current = to;
    } else {
      this._beforeChange(method, to);
    }
  };

  _class.prototype.__changeHistory = function __changeHistory(method, to) {
    if (!SUPPORT_HISTORY_API) return;

    var state = {};
    if (to.state) state.state = to.state;

    var url = this._url(to.fullPath);
    if (to.hidden) {
      state.path = to.fullPath;
      url = to.appearPath && this.url(to.appearPath);
    }

    window.history[method + 'State'](Object.keys(state).length ? state : null, '', url);
  };

  _class.prototype.go = function go(n) {
    var _this3 = this;

    var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref2$state = _ref2.state,
        state = _ref2$state === undefined ? null : _ref2$state,
        _ref2$silent = _ref2.silent,
        silent = _ref2$silent === undefined ? false : _ref2$silent;

    return new Promise(function (resolve, reject) {
      if (!SUPPORT_HISTORY_API) return reject(new Error(SUPPORT_HISTORY_ERR));

      var onpopstate = function onpopstate() {
        window.removeEventListener('popstate', onpopstate);
        window.addEventListener('popstate', _this3._onpopstate);

        var to = _this3._getCurrentLocationFromBrowser();

        if (state) {
          Object.assign(to.state, state);
          _this3.__changeHistory('replace', to);
        }

        if (silent) _this3.current = to;else _this3._beforeChange('popstate', to);

        resolve();
      };

      window.removeEventListener('popstate', _this3._onpopstate);
      window.addEventListener('popstate', onpopstate);

      window.history.go(n);
    });
  };

  _class.prototype.back = function back(opts) {
    return this.go(-1, opts);
  };

  _class.prototype.forward = function forward(opts) {
    return this.go(1, opts);
  };

  _class.prototype.captureLinkClickEvent = function captureLinkClickEvent(e) {
    var a = e.target.closest('a');

    // force not handle the <a> element
    if (!a || a.getAttribute('spa-history-skip') != null) return;

    // open new window
    var target = a.getAttribute('target');
    if (target && (target === '_blank' || target === '_parent' && window.parent !== window || target === '_top' && window.top !== window || !(target in { _self: 1, _blank: 1, _parent: 1, _top: 1 }) && target !== window.name)) return;

    // out of app
    if (a.href.indexOf(location.origin + this.url('/')) !== 0) return;

    var to = this.normalize(a.href);

    // hash change
    if (to.path === this.current.path && to.query.toString() === this.current.query.toString() && to.hash && to.hash !== this.current.hash) return;

    e.preventDefault();
    this.push(to);
  };

  return _class;
}();

var _class = function (_Base) {
  inherits(_class, _Base);

  function _class(args) {
    classCallCheck(this, _class);

    var _this = possibleConstructorReturn(this, _Base.call(this, args));

    _this.base = args.base || '/';
    return _this;
  }

  _class.prototype._extractPathFromExternalURL = function _extractPathFromExternalURL(url) {
    return url.pathname.replace(this.base, '/') + url.search + url.hash;
  };

  _class.prototype._url = function _url(loc) {
    return this.base + loc.slice(1);
  };

  return _class;
}(_class$2);

return _class;

})));
});

var Router = createCommonjsModule(function (module, exports) {
(function (global, factory) {
  if (typeof undefined === "function" && undefined.amd) {
    undefined(['module', 'exports'], factory);
  } else {
    factory(module, exports);
  }
})(commonjsGlobal, function (module, exports) {
  'use strict';

  exports.__esModule = true;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var Router = function () {
    function Router(conf) {
      _classCallCheck(this, Router);

      this._routes = {};

      if (conf.constructor === Array) conf = { ALL: conf };

      for (var method in conf) {
        var routes = conf[method];
        var rts = this._routes[method] = {
          string: {},
          regex: []
        };

        for (var _iterator = routes, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
          var _ref;

          if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
          } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
          }

          var _rt = _ref;

          var rt = [].concat(_rt);
          var path = rt.shift();
          var handler = rt.shift() || '$&';
          var options = rt.shift() || {};

          if (path.constructor === RegExp) {
            rts.regex.push({
              path: path,
              handler: handler,
              options: options,
              origin: _rt
            });
          } else {
            if (!/:|\*|\$/.test(path)) {
              rts.string[path] = {
                handler: handler === '$&' ? path : handler,
                options: options,
                origin: _rt
              };
            } else {
              (function () {
                var params = [];

                var regex = path.replace(/[\\&()+.[?^{|]/g, '\\$&').replace(/:(\w+)/g, function (str, key) {
                  params.push(key);
                  return '([^/]+)';
                }).replace(/\*/g, '.*');

                rts.regex.push({
                  path: new RegExp('^' + regex + '$'),
                  handler: handler,
                  params: params,
                  options: options,
                  origin: _rt
                });
              })();
            }
          }
        }
      }
    }

    Router.prototype.find = function find(path) {
      var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'ALL';

      var rts = this._routes[method];

      if (rts) {
        var _ret2 = function () {
          if (rts.string[path]) {
            var match = {
              handler: rts.string[path].handler,
              params: {},
              options: rts.string[path].options,
              origin: rts.string[path].origin
            };

            if (Router.log) {
              console.log('path:', path, '\n', 'method:', method, '\n', 'match:', match); // eslint-disable-line
            }

            return {
              v: match
            };
          }

          var handler = void 0;
          var params = {};

          var _loop = function _loop(rt) {
            var matches = path.match(rt.path);
            if (matches) {
              handler = rt.handler;
              if (handler && handler.constructor === String && handler.indexOf('$') !== -1) {
                handler = handler === '$&' ? path : path.replace(rt.path, handler);
              }

              matches.shift();

              if (rt.params) {
                rt.params.forEach(function (v, i) {
                  return params[v] = matches[i];
                });
              } else {
                matches.forEach(function (v, i) {
                  return params['$' + (i + 1)] = v;
                });
              }

              var _match = {
                handler: handler,
                params: params,
                options: rt.options,
                origin: rt.origin
              };

              if (Router.log) {
                console.log('path:', path, '\n', 'method:', method, '\n', 'match:', _match); // eslint-disable-line
              }

              return {
                v: {
                  v: _match
                }
              };
            }
          };

          for (var _iterator2 = rts.regex, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
            var _ref2;

            if (_isArray2) {
              if (_i2 >= _iterator2.length) break;
              _ref2 = _iterator2[_i2++];
            } else {
              _i2 = _iterator2.next();
              if (_i2.done) break;
              _ref2 = _i2.value;
            }

            var rt = _ref2;

            var _ret3 = _loop(rt);

            if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
          }
        }();

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
      }

      if (Router.log) {
        console.log('path:', path, '\n', 'method:', method, '\n', 'match:', null); // eslint-disable-line
      }

      return method === 'ALL' ? null : this.match(path);
    };

    return Router;
  }();

  exports.default = Router;
  module.exports = exports['default'];
});
});

var UrlRouter = unwrapExports(Router);

var RouterView = {
  functional: true,

  props: {
    name: {
      type: String,
      default: 'default'
    }
  },

  render: function render(h, _ref) {
    var props = _ref.props,
        children = _ref.children,
        parent = _ref.parent,
        data = _ref.data;

    if (!parent.$root.$route.path) return;

    while (parent) {
      if (parent.$vnode && parent.$vnode.data._routerView) {
        if (parent.$vnode.data._routerView.children && parent.$vnode.data._routerView.children[props.name]) {
          data._routerView = parent.$vnode.data._routerView.children[props.name];
          break;
        } else {
          return;
        }
      } else if (parent.$parent) {
        parent = parent.$parent;
      } else {
        data._routerView = parent.$route._layout[props.name];
        break;
      }
    }

    if (data._routerView.component) {
      if (data._routerView.props) {
        var viewProps = data._routerView.props.constructor === Function ? data._routerView.props(parent.$root.$route) : data._routerView.props;
        Object.assign(data, { props: viewProps });
      }

      return h(data._routerView.component, data, children);
    }
  }
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};









var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var RouterLink = {
  functional: true,

  props: {
    tag: {
      default: 'a'
    },

    to: {
      type: [String, Object]
    },

    method: {
      type: String,
      default: 'push' // push, replace, dispatch
    }
  },

  render: function render(h, _ref) {
    var parent = _ref.parent,
        props = _ref.props,
        children = _ref.children,
        listeners = _ref.listeners,
        data = _ref.data;

    return h(props.tag, _extends({}, data, {

      attrs: _extends({}, data.attrs, {
        href: parent.$router.url(props.to)
      }),

      on: _extends({}, listeners, {
        click: function click(e) {
          e.preventDefault();
          parent.$router[props.method](props.to);

          if (listeners.click) listeners.click(e);
        }
      })
    }), children);
  }
};

var _class$2 = function () {
  _class.install = function install(Vue) {
    Vue.component('router-view', RouterView);
    Vue.component('router-link', RouterLink);

    Vue.mixin({
      beforeCreate: function beforeCreate() {
        if (!this.$root.$options.router) return;

        if (this.$options.router) {
          this.$router = this.$options.router;

          // make current route reactive
          this.$route = new Vue({
            data: { route: this.$router.current }
          }).route;
        } else {
          this.$router = this.$root.$router;

          if (this.$vnode && this.$vnode.data._routerView) {
            var hooks = this.$root.$route._beforeLeaveHooksInComp;
            var options = this.constructor.extendOptions;

            if (options.extends && options.extends.beforeRouteLeave) {
              hooks.push(options.extends.beforeRouteLeave.bind(this));
            }

            if (options.mixins) {
              for (var _iterator = options.mixins, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                var _ref;

                if (_isArray) {
                  if (_i >= _iterator.length) break;
                  _ref = _iterator[_i++];
                } else {
                  _i = _iterator.next();
                  if (_i.done) break;
                  _ref = _i.value;
                }

                var mixin = _ref;

                if (mixin.beforeRouteLeave) {
                  hooks.push(mixin.beforeRouteLeave.bind(this));
                }
              }
            }

            if (options.beforeRouteLeave) {
              hooks.push(options.beforeRouteLeave.bind(this));
            }
          }
        }
      }
    });
  };

  function _class(_ref2) {
    var routes = _ref2.routes;
    classCallCheck(this, _class);

    this._routes = this._parseRoutes(routes);
    this._urlRouter = new UrlRouter(this._routes);

    this._hooks = {
      beforeChange: [],
      afterChange: [],
      load: [],
      error: []
    };

    this.current = {
      path: null,
      query: null,
      hash: null,
      fullPath: null,
      state: null,
      params: null,
      meta: null
    };
  }

  _class.prototype._parseRoutes = function _parseRoutes(routerViews) {
    var _this = this;

    var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var parsed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    var _loop = function _loop(rv) {
      if (rv.constructor === Array) {
        // a group of routerViews, merge and override uppper level definitions
        var names = rv.map(function (c) {
          return c.name;
        });
        _this._parseRoutes([].concat(rv, routerViews.filter(function (v) {
          return v.constructor !== Array && !v.path && !names.includes(v.name);
        })), depth, parsed);
      } else if (rv.path) {
        // finally get the main router view
        parsed.push([rv.path, [].concat(depth, [[rv].concat(routerViews.filter(function (v) {
          return v.constructor !== Array && !v.path && v.name !== rv.name;
        }))])]);
      } else if (rv.children) {
        // parent router view. look into it's children
        _this._parseRoutes(rv.children, [].concat(depth, [[rv].concat(routerViews.filter(function (v) {
          return v.constructor !== Array && !v.path && v.name !== rv.name;
        }))]), parsed);
      }
    };

    for (var _iterator2 = routerViews, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref3;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref3 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref3 = _i2.value;
      }

      var rv = _ref3;

      _loop(rv);
    }

    return parsed;
  };

  _class.prototype.on = function on(event, handler) {
    this._hooks[event].push(handler);
  };

  _class.prototype.off = function off(event, handler) {
    this._hooks[event] = this._hooks[event].filter(function (h) {
      return h !== handler;
    });
  };

  _class.prototype._beforeChange = function _beforeChange(to, from, op) {
    var _this2 = this;

    debugger;
    return new Promise(function (resolve) {
      var _route = _this2._urlRouter.find(to.path);
      if (!_route) return false;

      var route = to.route = {
        path: to.path,
        fullPath: to.fullPath,
        query: to.query,
        hash: to.hash,
        state: to.state,
        params: _route.params,
        meta: {},
        _beforeLeaveHooksInComp: [],
        _beforeEnterHooks: [],
        _loadComponents: [],
        _meta: [],
        _asyncData: []
      };

      route._layout = _this2._resolveRoute(route, _route.handler);

      _this2._generateMeta(route);

      var promise = Promise.resolve(true);

      var beforeChangeHooks = [].concat(_this2.current.path ? _this2.current._beforeLeaveHooksInComp : [], // not landing page
      _this2._hooks.beforeChange, route._beforeEnterHooks);

      var _loop2 = function _loop2(hook) {
        promise = promise.then(function () {
          return Promise.resolve(hook(route, _this2.current, op)).then(function (result) {
            // if the hook abort or redirect the navigation, cancel the promise chain.
            if (!(result === true || result == null)) throw result;
          });
        });
      };

      for (var _iterator3 = beforeChangeHooks, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
        var _ref4;

        if (_isArray3) {
          if (_i3 >= _iterator3.length) break;
          _ref4 = _iterator3[_i3++];
        } else {
          _i3 = _iterator3.next();
          if (_i3.done) break;
          _ref4 = _i3.value;
        }

        var hook = _ref4;

        _loop2(hook);
      }

      promise.catch(function (e) {
        if (e instanceof Error) throw e; // encountered unexpected error
        else return e; // the result of cancelled promise
      }).then(function (result) {
        return resolve(result);
      });
    });
  };

  _class.prototype._resolveRoute = function _resolveRoute(route, depth) {
    var layout = {};
    var current = layout;

    for (var _iterator4 = depth, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
      var _ref5;

      if (_isArray4) {
        if (_i4 >= _iterator4.length) break;
        _ref5 = _iterator4[_i4++];
      } else {
        _i4 = _iterator4.next();
        if (_i4.done) break;
        _ref5 = _i4.value;
      }

      var routerViews = _ref5;

      current.children = this._resolveRouterViews(route, routerViews, routerViews !== depth[depth.length - 1]);
      current = current.children[routerViews[0].name || 'default']; // go deeper
    }

    return layout.children;
  };

  _class.prototype._resolveRouterViews = function _resolveRouterViews(route, routerViews) {
    var _this3 = this;

    var skipFirstRouterViewChildren = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var resolved = {};

    var _loop3 = function _loop3(rv) {
      var v = resolved[rv.name || 'default'] = { props: rv.props };

      if (rv.meta) route._meta.push(rv.meta);

      if (rv.beforeEnter) route._beforeEnterHooks.push(rv.beforeEnter);

      var loadComponent = void 0;

      if (rv.component && rv.component.constructor === Function) {
        loadComponent = rv.component().then(function (m) {
          return m.__esModule ? m.default : m;
        });
      } else {
        loadComponent = Promise.resolve(rv.component);
      }

      loadComponent = loadComponent.then(function (component) {
        if (component.asyncData) {
          v.component = _extends({}, component, {
            data: function data() {
              return v.resolvedAsyncData;
            }
          });
        } else {
          v.component = component;
        }

        return component;
      });

      route._loadComponents.push(loadComponent);

      if (rv.children && (!skipFirstRouterViewChildren || rv !== routerViews[0])) {
        var children = rv.children.filter(function (v) {
          return v.constructor !== Array && !v.path;
        });
        if (children.length) v.children = _this3._resolveRouterViews(route, children);
      }
    };

    for (var _iterator5 = routerViews, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
      var _ref6;

      if (_isArray5) {
        if (_i5 >= _iterator5.length) break;
        _ref6 = _iterator5[_i5++];
      } else {
        _i5 = _iterator5.next();
        if (_i5.done) break;
        _ref6 = _i5.value;
      }

      var rv = _ref6;

      _loop3(rv);
    }

    return resolved;
  };

  _class.prototype._generateMeta = function _generateMeta(route) {
    for (var _iterator6 = route._meta, _isArray6 = Array.isArray(_iterator6), _i6 = 0, _iterator6 = _isArray6 ? _iterator6 : _iterator6[Symbol.iterator]();;) {
      var _ref7;

      if (_isArray6) {
        if (_i6 >= _iterator6.length) break;
        _ref7 = _iterator6[_i6++];
      } else {
        _i6 = _iterator6.next();
        if (_i6.done) break;
        _ref7 = _i6.value;
      }

      var m = _ref7;

      Object.assign(route.meta, m.constructor === Function ? m(route) : m);
    }
  };

  _class.prototype._change = function _change(to) {
    var _this4 = this;

    var promise = Promise.resolve(true);

    var _loop4 = function _loop4(hook) {
      promise = promise.then(function () {
        return Promise.resolve(hook(to.route, _this4.current)).then(function (result) {
          if (result === false) throw result;
        });
      });
    };

    for (var _iterator7 = this._hooks.afterChange, _isArray7 = Array.isArray(_iterator7), _i7 = 0, _iterator7 = _isArray7 ? _iterator7 : _iterator7[Symbol.iterator]();;) {
      var _ref8;

      if (_isArray7) {
        if (_i7 >= _iterator7.length) break;
        _ref8 = _iterator7[_i7++];
      } else {
        _i7 = _iterator7.next();
        if (_i7.done) break;
        _ref8 = _i7.value;
      }

      var hook = _ref8;

      _loop4(hook);
    }

    promise.then(function () {
      Promise.all(to.route._loadComponents).then(function () {
        Object.assign(_this4.current, to.route);
        // this._prefetch()
      }).catch(function (e) {
        return _this4._handleError(e);
      });
    }).catch(function (e) {
      if (e !== false) throw e;
    });
  };

  _class.prototype._prefetch = function _prefetch() {
    // this.current._prefetch
  };

  _class.prototype._handleError = function _handleError(e) {
    for (var _iterator8 = this._hooks.error, _isArray8 = Array.isArray(_iterator8), _i8 = 0, _iterator8 = _isArray8 ? _iterator8 : _iterator8[Symbol.iterator]();;) {
      var _ref9;

      if (_isArray8) {
        if (_i8 >= _iterator8.length) break;
        _ref9 = _iterator8[_i8++];
      } else {
        _i8 = _iterator8.next();
        if (_i8.done) break;
        _ref9 = _i8.value;
      }

      var hook = _ref9;
      hook(e);
    }
  };

  _class.prototype.start = function start(loc) {
    return this._history.start(loc);
  };

  _class.prototype.normalize = function normalize(loc) {
    return this._history.normalize(loc);
  };

  _class.prototype.url = function url(loc) {
    return this._history.url(loc);
  };

  _class.prototype.dispatch = function dispatch(loc) {
    return this._history.dispatch(loc);
  };

  _class.prototype.push = function push(loc) {
    return this._history.push(loc);
  };

  _class.prototype.replace = function replace(loc) {
    return this._history.replace(loc);
  };

  _class.prototype.setState = function setState(state) {
    this._history.setState(state);

    // Vue can not react if add new prop into state
    // so we replace it with a new state object
    this.current.state = _extends({}, this._history.current.state);

    // meta factory function may use state object to generate meta object
    // so we need to re-generate a new meta
    this._generateMeta(this.current);
  };

  _class.prototype.go = function go(n, opts) {
    return this._history.go(n, opts);
  };

  _class.prototype.back = function back(opts) {
    return this._history.back(opts);
  };

  _class.prototype.forward = function forward(opts) {
    return this._history.forward(opts);
  };

  _class.prototype.captureLinkClickEvent = function captureLinkClickEvent(e) {
    return this._history.captureLinkClickEvent(e);
  };

  return _class;
}();

var _class = function (_Base) {
  inherits(_class, _Base);

  function _class(args) {
    classCallCheck(this, _class);

    var _this = possibleConstructorReturn(this, _Base.call(this, args));

    _this._history = new PathHistory({
      base: args.base,
      beforeChange: _this._beforeChange.bind(_this),
      change: _this._change.bind(_this)
    });
    return _this;
  }

  return _class;
}(_class$2);

return _class;

})));
