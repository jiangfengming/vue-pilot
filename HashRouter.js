(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.HashRouter = factory());
}(this, (function () { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var HashHistory = createCommonjsModule(function (module, exports) {
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
      // eslint-disable-line
      q = Array.from(q);
    case Array:
      // eslint-disable-line
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
    if (loc.fullPath) return loc; // normalized

    if (loc.constructor === String) loc = { path: loc };

    if (loc.external || /^\w+:\/\//.test(loc.path)) {
      loc.path = this._extractPathFromExternalURL(new URL(loc.path, 'file://'));
      delete loc.external;
    }

    var url = new URL(loc.path, 'file://');
    if (loc.query) appendSearchParams(url.searchParams, loc.query);
    if (loc.hash) url.hash = loc.hash;
    return Object.assign({ state: {} }, loc, {
      path: url.pathname,
      query: url.searchParams,
      hash: url.hash,
      fullPath: url.pathname + url.search + url.hash
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
     sessionless
    success: nop                       fail: nop                                     redirect: _beforeChange('sessionless', redirect)
  */


  _class.prototype._beforeChange = function _beforeChange(op, to) {
    var _this2 = this;

    // to is the same as current and op is push, set op to replace
    if (this.current && to.path === this.current.path && to.query.toString() === this.current.query.toString() && op === 'push') op = 'replace';

    Promise.resolve(this.beforeChange(to, this.current)).then(function (ret) {
      if (ret == null || ret === true) {
        if (op === 'push' || op === 'replace') _this2.__changeHistory(op, to);
        _this2.current = to;
        _this2.change(to);
      } else if (ret.constructor === String || ret.constructor === Object) {
        if (op === 'init') op = 'replace';else if (op === 'popstate') op = 'push';
        _this2._beforeChange(op, _this2.normalize(ret));
      } else if (ret === false) {
        if (op === 'popstate') _this2.__changeHistory('push', _this2.current);
      }
    });
  };

  _class.prototype.dispatch = function dispatch(to) {
    to = this.normalize(to);
    this._beforeChange('sessionless', to);
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

  _class.prototype.hookAnchorElements = function hookAnchorElements() {
    var _this4 = this;

    var container = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.body;

    container.addEventListener('click', function (e) {
      var a = e.target.closest('a'

      // force not handle the <a> element
      );if (!a || a.getAttribute('spa-history-skip') != null) return;

      // open new window
      var target = a.getAttribute('target');
      if (target && (target === '_blank' || target === '_parent' && window.parent !== window || target === '_top' && window.top !== window || !(target in { _self: 1, _blank: 1, _parent: 1, _top: 1 }) && target !== window.name)) return;

      // out of app
      if (a.href.indexOf(location.origin + _this4.url('/')) !== 0) return;

      var to = _this4.normalize(a.href

      // hash change
      );if (to.path === _this4.current.path && to.query.toString() === _this4.current.query.toString() && to.hash && to.hash !== _this4.current.hash) return;

      e.preventDefault();
      _this4.push(to);
    });
  };

  return _class;
}();

var _class = function (_Base) {
  inherits(_class, _Base);

  function _class() {
    classCallCheck(this, _class);
    return possibleConstructorReturn(this, _Base.apply(this, arguments));
  }

  _class.prototype._extractPathFromExternalURL = function _extractPathFromExternalURL(url) {
    return url.hash.slice(1) || '/';
  };

  _class.prototype._url = function _url(loc) {
    return loc === '/' ? location.pathname + location.search : '#' + loc;
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

        var _loop = function _loop(_rt) {
          var path = void 0,
              result = void 0,
              params = void 0,
              options = void 0;

          if (_rt.constructor === String) {
            path = _rt;
            result = '$&';
            params = [];
            options = {};
          } else {
            var rt = _rt.concat(); // clone, preserve original route
            path = rt.shift();
            result = rt.length ? rt.shift() : '$&';
            options = _typeof(rt[rt.length - 1]) === 'object' ? rt.pop() : {};
            params = rt;
          }

          if (path.constructor === RegExp) {
            rts.regex.push({
              path: path,
              result: result,
              params: params,
              options: options,
              origin: _rt
            });
          } else {
            if (!/:|\*|\$/.test(path)) {
              rts.string[path] = {
                result: result === '$&' ? path : result,
                options: options,
                origin: _rt
              };
            } else {
              params = [];

              path = path.replace(/[\\&()+.[?^{|]/g, '\\$&').replace(/:(\w+)/g, function (str, key) {
                params.push(key);
                return '([^/]+)';
              }).replace(/\*/g, '.*');

              rts.regex.push({
                path: new RegExp('^' + path + '$'),
                result: result,
                params: params,
                options: options,
                origin: _rt
              });
            }
          }
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

          _loop(_rt);
        }
      }
    }

    Router.prototype.find = function find(path) {
      var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'ALL';

      var rts = this._routes[method];

      if (rts) {
        if (rts.string[path]) {
          var match = {
            result: rts.string[path].result,
            params: {},
            options: rts.string[path].options,
            origin: rts.string[path].origin
          };

          if (Router.log) {
            console.log('path:', path, '\n', 'method:', method, '\n', 'match:', match); // eslint-disable-line
          }

          return match;
        }

        var _result = void 0;
        var _params = {};
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

          var matches = path.match(rt.path);
          if (matches) {
            _result = rt.result;
            if (_result && _result.constructor === String && _result.indexOf('$') !== -1) {
              _result = _result === '$&' ? path : path.replace(rt.path, _result);
            }

            matches.shift();
            for (var j = 0; j < rt.params.length; j++) {
              if (rt.params[j]) {
                _params[rt.params[j]] = matches[j];
              }
            }

            var _match = {
              result: _result,
              params: _params,
              options: rt.options,
              origin: rt.origin
            };

            if (Router.log) {
              console.log('path:', path, '\n', 'method:', method, '\n', 'match:', _match); // eslint-disable-line
            }

            return _match;
          }
        }
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

  render(h, { props, children, parent, data }) {
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
        const viewProps = data._routerView.props.constructor === Function ? data._routerView.props(parent.$root.$route) : data._routerView.props;
        Object.assign(data, { props: viewProps });
      }

      return h(data._routerView.component, data, children);
    }
  }
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

  render(h, { parent, props, children, data }) {
    return h(props.tag, Object.assign(data, {
      attrs: {
        href: parent.$router.url(props.to)
      },

      on: {
        click(e) {
          e.preventDefault();
          parent.$router[props.method](props.to);
        }
      }
    }), children);
  }
};

var Base = class {
  static install(Vue) {
    Vue.component('router-view', RouterView);
    Vue.component('router-link', RouterLink);

    Vue.mixin({
      data() {
        return this.$root === this && this.$root.$options.router ? { $route: this.$root.$options.router.current } : {};
      },

      beforeCreate() {
        if (!this.$root.$options.router) return;

        if (this.$options.router) {
          this.$router = this.$options.router;
          this.$route = this.$router.current;
        } else {
          this.$router = this.$root.$router;

          if (this.$vnode && this.$vnode.data._routerView && this.$options.beforeRouteLeave) {
            this.$root.$route._beforeLeaveHooksInComp.push(this.$options.beforeRouteLeave.bind(this));
          }
        }
      }
    });
  }

  constructor({ routes }) {
    this._routes = this._parseRoutes(routes);
    this._urlRouter = new UrlRouter(this._routes);
    this._beforeChangeHooks = [];
    this.current = {
      path: null,
      query: null,
      hash: null,
      fullPath: null,
      state: null,
      params: null,
      meta: null,
      _routerViews: null
    };
  }

  beforeChange(cb) {
    this._beforeChangeHooks.push(cb);
  }

  _parseRoutes(routerViews, depth = [], parsed = []) {
    for (const routerView of routerViews) {
      if (routerView.constructor === Array) {
        const names = routerView.map(c => c.name);
        const children = [...routerView, ...routerViews.filter(v => v.constructor !== Array && !v.path && !names.includes(v.name))];
        this._parseRoutes(children, depth, parsed);
      } else if (routerView.path) {
        const children = [routerView, ...routerViews.filter(v => v.constructor !== Array && !v.path && v.name !== routerView.name)];
        parsed.push([routerView.path, [...depth, children]]);
      } else if (routerView.children) {
        const children = [routerView, ...routerViews.filter(v => v.constructor !== Array && !v.path && v.name !== routerView.name)];
        this._parseRoutes(routerView.children, [...depth, children], parsed);
      }
    }

    return parsed;
  }

  _beforeChange(to) {
    return new Promise(resolve => {
      const _route = this._urlRouter.find(to.path);
      if (!_route) return false;

      const route = to.route = {
        path: to.path,
        fullPath: to.fullPath,
        query: to.query,
        hash: to.hash,
        state: to.state,
        params: _route.params,
        _beforeLeaveHooksInComp: [],
        _beforeEnterHooks: [],
        _asyncComponents: []
      };

      const mainView = _route.result[_route.result.length - 1][0];

      if (!mainView.meta) {
        route.meta = {};
      } else if (mainView.meta.constructor === Function) {
        route._metaFactory = mainView.meta;
        route.meta = route._metaFactory(route);
      } else {
        route.meta = mainView.meta;
      }

      route._layout = this._resolveRoute(route, _route.result);

      let prom = Promise.resolve(true);[].concat(this.current.path ? this.current._beforeLeaveHooksInComp : [], this._beforeChangeHooks, route._beforeEnterHooks).forEach(hook => prom = prom.then(() => Promise.resolve(hook(route, this.current)).then(result => {
        // if the hook abort or redirect the navigation, cancel the promise chain.
        if (!(result === true || result == null)) throw result;
      })));

      prom.catch(e => {
        if (e instanceof Error) throw e;else return e;
      }).then(result => resolve(result));
    });
  }

  _change(to) {
    Promise.all(to.route._asyncComponents).then(() => {
      Object.assign(this.current, to.route);
    });
  }

  _resolveRoute(route, depth) {
    const layout = {};
    let current = layout;

    for (const routerViews of depth) {
      current.children = {};

      for (const routerView of routerViews) {
        current.children[routerView.name || 'default'] = Object.assign({}, routerView);
      }

      current = current.children[routerViews[0].name || 'default'];
    }

    delete current.path;

    return this._resolveRouterViews(route, layout.children);
  }

  _resolveRouterViews(route, routerViews) {
    const resolved = {};

    for (const name in routerViews) {
      const routerView = routerViews[name];

      if (routerView.constructor === Array || routerView.path) continue;

      const v = resolved[name] = { props: routerView.props };

      if (routerView.beforeEnter) {
        route._beforeEnterHooks.push(routerView.beforeEnter);
      }

      if (routerView.component && routerView.component.constructor === Function) {
        route._asyncComponents.push(routerView.component().then(component => v.component = component));
      } else {
        v.component = routerView.component;
      }

      if (routerView.children) {
        v.children = this._resolveRouterViews(route, routerView.children);
      }
    }

    return resolved;
  }

  start(loc) {
    return this._history.start(loc);
  }

  normalize(loc) {
    return this._history.normalize(loc);
  }

  url(loc) {
    return this._history.url(loc);
  }

  dispatch(loc) {
    return this._history.dispatch(loc);
  }

  push(loc) {
    return this._history.push(loc);
  }

  replace(loc) {
    return this._history.replace(loc);
  }

  setState(state) {
    this._history.setState(state

    // meta factory function may use state object to generate meta object
    // so we need to re-generate a new meta
    );if (this.current._metaFactory) {
      this.current.meta = this.current._metaFactory(this.current);
    }
  }

  go(n, opts) {
    return this._history.go(n, opts);
  }

  back(opts) {
    return this._history.back(opts);
  }

  forward(opts) {
    return this._history.forward(opts);
  }

  hookAnchorElements(container) {
    return this._history.hookAnchorElements(container);
  }
};

var HashRouter = class extends Base {
  constructor(args) {
    super(args);

    this._history = new HashHistory({
      beforeChange: this._beforeChange.bind(this),
      change: this._change.bind(this)
    });
  }
};

return HashRouter;

})));
