function appendSearchParams(searchParams, q) {
  switch (q.constructor) {
    case Object:
      for (var name in q) {
        searchParams.append(name, q[name]);
      }break;
    case String:
      q = new URLSearchParams(q);
    // falls through
    case URLSearchParams:
      q = Array.from(q);
    // falls through
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

var SUPPORT_HISTORY_API = (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.history && window.history.pushState;
var SUPPORT_HISTORY_ERR = 'Current environment doesn\'t support History API';

var _class = function () {
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
      state: loc.state ? JSON.parse(JSON.stringify(loc.state)) : {} // dereferencing
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
    Object.assign(this.current.state, JSON.parse(JSON.stringify(state))); // dereferencing
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

var _class$1 = function (_Base) {
  inherits(_class$$1, _Base);

  function _class$$1(args) {
    classCallCheck(this, _class$$1);

    var _this = possibleConstructorReturn(this, _Base.call(this, args));

    _this.base = args.base || '/';
    return _this;
  }

  _class$$1.prototype._extractPathFromExternalURL = function _extractPathFromExternalURL(url) {
    return url.pathname.replace(this.base, '/') + url.search + url.hash;
  };

  _class$$1.prototype._url = function _url(loc) {
    return this.base + loc.slice(1);
  };

  return _class$$1;
}(_class);

var _class$2 = function (_Base) {
  inherits(_class$$1, _Base);

  function _class$$1() {
    classCallCheck(this, _class$$1);
    return possibleConstructorReturn(this, _Base.apply(this, arguments));
  }

  _class$$1.prototype._extractPathFromExternalURL = function _extractPathFromExternalURL(url) {
    return url.hash.slice(1) || '/';
  };

  _class$$1.prototype._url = function _url(loc) {
    return loc === '/' ? location.pathname + location.search : '#' + loc;
  };

  return _class$$1;
}(_class);

var _typeof$1 = typeof Symbol === "function" && _typeof(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};

var classCallCheck$1 = function classCallCheck$$1(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var Router = function () {
  function Router(conf) {
    classCallCheck$1(this, Router);

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

          if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof$1(_ret3)) === "object") return _ret3.v;
        }
      }();

      if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof$1(_ret2)) === "object") return _ret2.v;
    }

    if (Router.log) {
      console.log('path:', path, '\n', 'method:', method, '\n', 'match:', null); // eslint-disable-line
    }

    return method === 'ALL' ? null : this.match(path);
  };

  return Router;
}();

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

    function click(e) {
      if (!e.defaultPrevented) {
        e.preventDefault();
        parent.$router[props.method](props.to);
      }
    }

    return h(props.tag, _extends({}, data, {

      attrs: _extends({}, data.attrs, {
        href: parent.$router.url(props.to)
      }),

      on: _extends({}, listeners, {
        click: listeners.click ? [].concat(listeners.click, click) : click
      })
    }), children);
  }
};

var _class$3 = function () {
  _class.install = function install(Vue) {
    Vue.component('router-view', RouterView);
    Vue.component('router-link', RouterLink);

    Vue.mixin({
      beforeCreate: function beforeCreate() {
        var _this = this;

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
              options.mixins.forEach(function (mixin) {
                if (mixin.beforeRouteLeave) {
                  hooks.push(mixin.beforeRouteLeave.bind(_this));
                }
              });
            }

            if (options.beforeRouteLeave) {
              hooks.push(options.beforeRouteLeave.bind(this));
            }
          }
        }
      }
    });
  };

  function _class(_ref) {
    var routes = _ref.routes;
    classCallCheck(this, _class);

    this._routes = this._parseRoutes(routes);
    this._urlRouter = new Router(this._routes);
    this._beforeChangeHooks = [];
    this._afterChangeHooks = [];
    this._errorHooks = [];

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

  _class.prototype.beforeChange = function beforeChange(hook) {
    this._beforeChangeHooks.push(hook);
  };

  _class.prototype.afterChange = function afterChange(hook) {
    this._afterChangeHooks.push(hook);
  };

  _class.prototype.onError = function onError(hook) {
    this._errorHooks.push(hook);
  };

  _class.prototype._parseRoutes = function _parseRoutes(routerViews) {
    var _this2 = this;

    var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var parsed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    var _loop = function _loop(routerView) {
      if (routerView.constructor === Array) {
        var names = routerView.map(function (c) {
          return c.name;
        });
        var children = [].concat(routerView, routerViews.filter(function (v) {
          return v.constructor !== Array && !v.path && !names.includes(v.name);
        }));
        _this2._parseRoutes(children, depth, parsed);
      } else if (routerView.path) {
        var _children = [routerView].concat(routerViews.filter(function (v) {
          return v.constructor !== Array && !v.path && v.name !== routerView.name;
        }));
        parsed.push([routerView.path, [].concat(depth, [_children])]);
      } else if (routerView.children) {
        var _children2 = [routerView].concat(routerViews.filter(function (v) {
          return v.constructor !== Array && !v.path && v.name !== routerView.name;
        }));
        _this2._parseRoutes(routerView.children, [].concat(depth, [_children2]), parsed);
      }
    };

    for (var _iterator = routerViews, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref2 = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref2 = _i.value;
      }

      var routerView = _ref2;

      _loop(routerView);
    }

    return parsed;
  };

  _class.prototype._beforeChange = function _beforeChange(to, from, op) {
    var _this3 = this;

    return new Promise(function (resolve) {
      var _route = _this3._urlRouter.find(to.path);
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
        _asyncComponents: [],
        _meta: []
      };

      route._layout = _this3._resolveRoute(route, _route.handler);

      _this3._generateMeta(route);

      var promise = Promise.resolve(true);[].concat(_this3.current.path ? _this3.current._beforeLeaveHooksInComp : [], // not landing page
      _this3._beforeChangeHooks, route._beforeEnterHooks).forEach(function (hook) {
        return promise = promise.then(function () {
          return Promise.resolve(hook(route, _this3.current, op)).then(function (result) {
            // if the hook abort or redirect the navigation, cancel the promise chain.
            if (!(result === true || result == null)) throw result;
          });
        });
      });

      promise.catch(function (e) {
        if (e instanceof Error) throw e; // encountered unexpected error
        else return e; // the result of cancelled promise
      }).then(function (result) {
        return resolve(result);
      });
    });
  };

  _class.prototype._generateMeta = function _generateMeta(route) {
    if (route._meta.length) {
      route._meta.forEach(function (m) {
        return Object.assign(route.meta, m.constructor === Function ? m(route) : m);
      });
    }
  };

  _class.prototype._change = function _change(to) {
    var _this4 = this;

    var promise = Promise.resolve(true);

    this._afterChangeHooks.forEach(function (hook) {
      return promise = promise.then(function () {
        return Promise.resolve(hook(to.route, _this4.current)).then(function (result) {
          if (result === false) throw result;
        });
      });
    });

    promise.then(function () {
      Promise.all(to.route._asyncComponents).then(function () {
        Object.assign(_this4.current, to.route);
      }).catch(function (e) {
        return _this4._handleError(e);
      });
    }).catch(function (e) {
      if (e !== false) throw e;
    });
  };

  _class.prototype._handleError = function _handleError(e) {
    this._errorHooks.forEach(function (hook) {
      return hook(e);
    });
  };

  _class.prototype._resolveRoute = function _resolveRoute(route, depth) {
    var layout = {};
    var current = layout;

    for (var _iterator2 = depth, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref3;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref3 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref3 = _i2.value;
      }

      var routerViews = _ref3;

      current.children = {};

      for (var _iterator3 = routerViews, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
        var _ref4;

        if (_isArray3) {
          if (_i3 >= _iterator3.length) break;
          _ref4 = _iterator3[_i3++];
        } else {
          _i3 = _iterator3.next();
          if (_i3.done) break;
          _ref4 = _i3.value;
        }

        var routerView = _ref4;

        current.children[routerView.name || 'default'] = Object.assign({}, routerView);
      }

      current = current.children[routerViews[0].name || 'default'];
    }

    delete current.path;

    return this._resolveRouterViews(route, layout.children);
  };

  _class.prototype._resolveRouterViews = function _resolveRouterViews(route, routerViews) {
    var _this5 = this;

    var resolved = {};

    var _loop2 = function _loop2(name) {
      var routerView = routerViews[name];

      if (routerView.constructor === Array || routerView.path) return 'continue';

      var v = resolved[name] = { props: routerView.props };

      if (routerView.meta) {
        route._meta.push(routerView.meta);
      }

      if (routerView.beforeEnter) {
        route._beforeEnterHooks.push(routerView.beforeEnter);
      }

      if (routerView.component && routerView.component.constructor === Function) {
        route._asyncComponents.push(routerView.component().then(function (m) {
          return v.component = m.__esModule ? m.default : m;
        }));
      } else {
        v.component = routerView.component;
      }

      if (routerView.children) {
        v.children = _this5._resolveRouterViews(route, routerView.children);
      }
    };

    for (var name in routerViews) {
      var _ret2 = _loop2(name);

      if (_ret2 === 'continue') continue;
    }

    return resolved;
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

var _class$4 = function (_Base) {
  inherits(_class, _Base);

  function _class(args) {
    classCallCheck(this, _class);

    var _this = possibleConstructorReturn(this, _Base.call(this, args));

    _this._history = new _class$1({
      base: args.base,
      beforeChange: _this._beforeChange.bind(_this),
      change: _this._change.bind(_this)
    });
    return _this;
  }

  return _class;
}(_class$3);

var _class$5 = function (_Base) {
  inherits(_class, _Base);

  function _class(args) {
    classCallCheck(this, _class);

    var _this = possibleConstructorReturn(this, _Base.call(this, args));

    _this._history = new _class$2({
      beforeChange: _this._beforeChange.bind(_this),
      change: _this._change.bind(_this)
    });
    return _this;
  }

  return _class;
}(_class$3);

export { _class$4 as PathRouter, _class$5 as HashRouter };