function _extends() {
  _extends = Object.assign || function (target) {
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

  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _inheritsLoose$1(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function appendSearchParams(searchParams, q) {
  switch (q.constructor) {
    case Object:
      for (var name in q) {
        searchParams.append(name, q[name]);
      }

      break;

    case String:
      q = new URLSearchParams(q);
    // falls through

    case URLSearchParams:
      q = Array.from(q);
    // falls through

    case Array:
      for (var _iterator = q, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var _ref2 = _ref,
            _name = _ref2[0],
            value = _ref2[1];
        searchParams.append(_name, value);
      }

      break;
  }
}

var SUPPORT_HISTORY_API = typeof window === 'object' && window.history && window.history.pushState;
var SUPPORT_HISTORY_ERR = 'Current environment doesn\'t support History API';

var _default =
/*#__PURE__*/
function () {
  function _default(_ref) {
    var _ref$beforeChange = _ref.beforeChange,
        beforeChange = _ref$beforeChange === void 0 ? function () {} : _ref$beforeChange,
        change = _ref.change;
    this.beforeChange = beforeChange;
    this.change = change;
    this.current = null;
  }

  var _proto = _default.prototype;

  _proto.start = function start(loc) {
    var _this = this;

    if (!loc && SUPPORT_HISTORY_API) {
      loc = this._getCurrentLocationFromBrowser();
    } else {
      loc = this.normalize(loc);
    }

    this._beforeChange('init', loc);

    if (SUPPORT_HISTORY_API) {
      this._onpopstate = function () {
        _this._beforeChange('popstate', _this._getCurrentLocationFromBrowser());
      };

      window.addEventListener('popstate', this._onpopstate);
    }
  };

  _proto.url = function url(loc) {
    return this.normalize(loc).url;
  };

  _proto.normalize = function normalize(loc) {
    if (loc.constructor === String) {
      loc = {
        path: loc
      };
    } else {
      loc = Object.assign({}, loc);
    }

    var hasOrigin = /^\w+:\/\//.test(loc.path);

    if (loc.external || hasOrigin) {
      loc.path = this._extractPathFromExternalURL(new URL(hasOrigin ? loc.path : 'http://a.a' + loc.path));
      delete loc.external;
    }

    var url = new URL('http://a.a' + loc.path);

    if (loc.query) {
      appendSearchParams(url.searchParams, loc.query);
    }

    if (loc.hash) {
      url.hash = loc.hash;
    }

    Object.assign(loc, {
      path: url.pathname,
      query: url.searchParams,
      hash: url.hash,
      fullPath: url.pathname + url.search + url.hash,
      state: loc.state ? JSON.parse(JSON.stringify(loc.state)) : {} // dereferencing

    });
    loc.url = this._url(loc);
    return loc;
  };

  _proto._getCurrentLocationFromBrowser = function _getCurrentLocationFromBrowser() {
    var state = window.history.state || {};
    var loc = this.normalize(state.path || this._extractPathFromExternalURL(window.location));
    loc.state = state.state || {};
    if (state.path) loc.hidden = true;
    return loc;
  }
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
  ;

  _proto._beforeChange = function _beforeChange(op, to) {
    var _this2 = this; // to is the same as current and op is push, set op to replace


    if (this.current && to.path === this.current.path && to.query.toString() === this.current.query.toString() && op === 'push') {
      op = 'replace';
    }

    Promise.resolve(this.beforeChange(to, this.current, op)).then(function (ret) {
      if (ret == null || ret === true) {
        if (op === 'push' || op === 'replace') {
          _this2.__changeHistory(op, to);
        }

        _this2.current = to;

        _this2.change(to);
      } else if (ret.constructor === String || ret.constructor === Object) {
        if (op === 'init') {
          op = 'replace';
        } else if (op === 'popstate') {
          op = 'push';
        } else if (ret.method) {
          op = ret.method;
        }

        _this2._beforeChange(op, _this2.normalize(ret));
      } else if (ret === false) {
        if (op === 'popstate') {
          _this2.__changeHistory('push', _this2.current);
        }
      }
    });
  };

  _proto.dispatch = function dispatch(to) {
    to = this.normalize(to);

    this._beforeChange('dispatch', to);
  }
  /*
    {
      path,
      query,
      hash,
      state,
      hidden
    }
  */
  ;

  _proto.push = function push(to) {
    this._changeHistory('push', to);
  };

  _proto.replace = function replace(to) {
    this._changeHistory('replace', to);
  };

  _proto.setState = function setState(state) {
    Object.assign(this.current.state, JSON.parse(JSON.stringify(state))); // dereferencing

    this.__changeHistory('replace', this.current);
  };

  _proto._changeHistory = function _changeHistory(method, to) {
    to = this.normalize(to);

    if (to.silent) {
      this.__changeHistory(method, to);

      this.current = to;
    } else {
      this._beforeChange(method, to);
    }
  };

  _proto.__changeHistory = function __changeHistory(method, to) {
    if (!SUPPORT_HISTORY_API) {
      return;
    }

    var state = {};

    if (to.state) {
      state.state = to.state;
    }

    var url = to.url;

    if (to.hidden) {
      state.path = to.fullPath;
      url = to.appearPath && this.url(to.appearPath);
    }

    window.history[method + 'State'](Object.keys(state).length ? state : null, '', url);
  };

  _proto.go = function go(n, _temp) {
    var _this3 = this;

    var _ref2 = _temp === void 0 ? {} : _temp,
        _ref2$state = _ref2.state,
        state = _ref2$state === void 0 ? null : _ref2$state,
        _ref2$silent = _ref2.silent,
        silent = _ref2$silent === void 0 ? false : _ref2$silent;

    return new Promise(function (resolve, reject) {
      if (!SUPPORT_HISTORY_API) {
        return reject(new Error(SUPPORT_HISTORY_ERR));
      }

      var onpopstate = function onpopstate() {
        window.removeEventListener('popstate', onpopstate);
        window.addEventListener('popstate', _this3._onpopstate);

        var to = _this3._getCurrentLocationFromBrowser();

        if (state) {
          Object.assign(to.state, state);

          _this3.__changeHistory('replace', to);
        }

        if (silent) {
          _this3.current = to;
        } else {
          _this3._beforeChange('popstate', to);
        }

        resolve();
      };

      window.removeEventListener('popstate', _this3._onpopstate);
      window.addEventListener('popstate', onpopstate);
      window.history.go(n);
    });
  };

  _proto.back = function back(opts) {
    return this.go(-1, opts);
  };

  _proto.forward = function forward(opts) {
    return this.go(1, opts);
  };

  _proto.captureLinkClickEvent = function captureLinkClickEvent(e) {
    var a = e.target.closest('a'); // force not handle the <a> element

    if (!a || a.getAttribute('spa-history-skip') != null) {
      return;
    } // open new window


    var target = a.getAttribute('target');

    if (target && (target === '_blank' || target === '_parent' && window.parent !== window || target === '_top' && window.top !== window || !(target in {
      _self: 1,
      _blank: 1,
      _parent: 1,
      _top: 1
    }) && target !== window.name)) {
      return;
    } // out of app


    if (!a.href.startsWith(location.origin + this.url('/'))) {
      return;
    }

    var to = this.normalize(a.href); // hash change

    if (to.path === this.current.path && to.query.toString() === this.current.query.toString() && to.hash && to.hash !== this.current.hash) {
      return;
    }

    e.preventDefault();
    this.push(to);
  };

  return _default;
}();

var _default$1 =
/*#__PURE__*/
function (_Base) {
  _inheritsLoose$1(_default, _Base);

  function _default(args) {
    var _this;

    _this = _Base.call(this, args) || this;
    _this.base = args.base || '';
    return _this;
  }

  var _proto = _default.prototype;

  _proto._extractPathFromExternalURL = function _extractPathFromExternalURL(url) {
    var path = url.pathname;

    if (this.base && this.base !== '/' && path.startsWith(this.base)) {
      path = path.replace(this.base, '');

      if (!path) {
        path = '/';
      } else if (this.base.endsWith('/')) {
        path = '/' + path;
      }
    }

    return path + url.search + url.hash;
  };

  _proto._url = function _url(loc) {
    // if base is not end with /
    // do not append / if is the root path
    if (loc.path === '/' && this.base && !this.base.endsWith('/')) {
      return this.base + loc.fullPath.slice(1);
    }

    return (this.base && this.base.endsWith('/') ? this.base.slice(0, -1) : this.base) + loc.fullPath;
  };

  return _default;
}(_default);

var _default$2 =
/*#__PURE__*/
function (_Base) {
  _inheritsLoose$1(_default, _Base);

  function _default() {
    return _Base.apply(this, arguments) || this;
  }

  var _proto = _default.prototype;

  _proto._extractPathFromExternalURL = function _extractPathFromExternalURL(url) {
    return url.hash.slice(1) || '/';
  };

  _proto._url = function _url(loc) {
    return loc.fullPath === '/' ? location.pathname + location.search : '#' + loc.fullPath;
  };

  return _default;
}(_default);

var Router =
/*#__PURE__*/
function () {
  function Router(routes) {
    this._routes = {};

    if (routes) {
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

        var route = _ref;
        this.add.apply(this, route);
      }
    }
  }

  var _proto = Router.prototype;

  _proto.add = function add(method, path, handler, test) {
    // if method is omitted, defaults to 'GET'
    if (method.constructor !== String || !['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
      var _ref2 = ['GET', method, path, handler];
      method = _ref2[0];
      path = _ref2[1];
      handler = _ref2[2];
      test = _ref2[3];
    }

    if (!this._routes[method]) {
      this._routes[method] = [];
    }

    var table = this._routes[method];

    if (path.constructor === RegExp) {
      table.push({
        path: path,
        regex: path,
        handler: handler,
        test: test
      });
    } else {
      if (!/:|\*|\$/.test(path)) {
        table.push({
          path: path,
          handler: handler,
          test: test
        });
      } else {
        var params = [];
        var regex = path.replace(/[\\&()+.[?^{|]/g, '\\$&').replace(/:(\w+)/g, function (str, key) {
          params.push(key);
          return '([^/]+)';
        }).replace(/\*/g, '.*');
        table.push({
          path: path,
          regex: new RegExp("^" + regex + "$"),
          handler: handler,
          params: params,
          test: test
        });
      }
    }

    return this;
  };

  _proto.get = function get(path, handler, test) {
    return this.add('GET', path, handler, test);
  };

  _proto.post = function post(path, handler, test) {
    return this.add('POST', path, handler, test);
  };

  _proto.put = function put(path, handler, test) {
    return this.add('PUT', path, handler, test);
  };

  _proto["delete"] = function _delete(path, handler, test) {
    return this.add('DELETE', path, handler, test);
  };

  _proto.patch = function patch(path, handler, test) {
    return this.add('PATCH', path, handler, test);
  };

  _proto.head = function head(path, handler, test) {
    return this.add('HEAD', path, handler, test);
  };

  _proto.options = function options(path, handler, test) {
    return this.add('OPTIONS', path, handler, test);
  };

  _proto.trace = function trace(path, handler, test) {
    return this.add('TRACE', path, handler, test);
  };

  _proto.find = function find(method, path, testArg) {
    // if method is omitted, defaults to 'GET'
    if (method.constructor !== String || !['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
      var _ref3 = ['GET', method, path];
      method = _ref3[0];
      path = _ref3[1];
      testArg = _ref3[2];
    }

    var table = this._routes[method];

    if (!table) {
      return null;
    }

    for (var _iterator2 = table, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref4;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref4 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref4 = _i2.value;
      }

      var route = _ref4;
      var resolved = void 0;

      if (route.regex) {
        (function () {
          var matches = path.match(route.regex);

          if (matches) {
            var handler = route.handler;

            if (handler.constructor === String && handler.includes('$')) {
              handler = handler === '$&' ? path : path.replace(route.regex, handler);
            }

            var params;

            if (matches.groups) {
              params = matches.groups;
            } else {
              params = {};
              matches.shift();

              if (route.params) {
                route.params.forEach(function (v, i) {
                  return params[v] = matches[i];
                });
              } else {
                matches.forEach(function (v, i) {
                  return params['$' + (i + 1)] = v;
                });
              }
            }

            for (var k in params) {
              params[k] = decodeURIComponent(params[k]);
            }

            resolved = {
              method: method,
              path: path,
              handler: handler,
              params: params
            };
          }
        })();
      } else {
        if (route.path === path) {
          resolved = {
            method: method,
            path: path,
            handler: route.handler,
            params: {}
          };
        }
      }

      if (resolved && (!route.test || route.test(resolved, testArg))) {
        return resolved;
      }
    }

    return null;
  };

  return Router;
}();

var RouterView = {
  functional: true,
  props: {
    name: {
      type: String,
      "default": 'default'
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
        Object.assign(data, {
          props: viewProps
        });
      }

      return h(data._routerView.component, data, children);
    }
  }
};

var RouterLink = {
  functional: true,
  props: {
    tag: {
      "default": 'a'
    },
    to: {
      type: [String, Object]
    },
    method: {
      type: String,
      "default": 'push' // push, replace, dispatch

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

var _default$3 =
/*#__PURE__*/
function () {
  _default.install = function install(Vue) {
    Vue.component('router-view', RouterView);
    Vue.component('router-link', RouterLink);
    Vue.mixin({
      beforeCreate: function beforeCreate() {
        var _this = this;

        if (!this.$root.$options.router) return;

        if (this.$options.router) {
          this.$router = this.$options.router; // make current route reactive

          this.$route = new Vue({
            data: {
              route: this.$router.current
            }
          }).route;
        } else {
          this.$router = this.$root.$router;

          if (this.$vnode && this.$vnode.data._routerView) {
            var hooks = this.$root.$route._beforeLeaveHooksInComp;
            var options = this.constructor.extendOptions;

            if (options["extends"] && options["extends"].beforeRouteLeave) {
              hooks.push(options["extends"].beforeRouteLeave.bind(this));
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

  function _default(_ref) {
    var routes = _ref.routes;
    this._routes = this._parseRoutes(routes);
    this._urlRouter = new Router(this._routes);
    this._beforeChangeHooks = [];
    this._afterChangeHooks = [];
    this._errorHooks = [];
    this.current = {
      path: null,
      query: {},
      hash: null,
      fullPath: null,
      state: {},
      params: {},
      meta: {},
      _routerViews: null
    };
  }

  var _proto = _default.prototype;

  _proto.beforeChange = function beforeChange(hook) {
    this._beforeChangeHooks.push(hook);
  };

  _proto.afterChange = function afterChange(hook) {
    this._afterChangeHooks.push(hook);
  };

  _proto.onError = function onError(hook) {
    this._errorHooks.push(hook);
  };

  _proto._parseRoutes = function _parseRoutes(routerViews, depth, parsed) {
    var _this2 = this;

    if (depth === void 0) {
      depth = [];
    }

    if (parsed === void 0) {
      parsed = [];
    }

    var _loop = function _loop() {
      if (_isArray) {
        if (_i >= _iterator.length) return "break";
        _ref2 = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) return "break";
        _ref2 = _i.value;
      }

      var routerView = _ref2;

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

        parsed.push(['GET', routerView.path, [].concat(depth, [_children]), function (matchedRoute, _ref3) {
          var to = _ref3.to,
              from = _ref3.from,
              op = _ref3.op;
          to.params = matchedRoute.params;
          to._layout = _this2._resolveRoute(to, matchedRoute.handler);

          _this2._generateMeta(to);

          return routerView.test ? routerView.test(to, from, op) : true;
        }]);
      } else if (routerView.children) {
        var _children2 = [routerView].concat(routerViews.filter(function (v) {
          return v.constructor !== Array && !v.path && v.name !== routerView.name;
        }));

        _this2._parseRoutes(routerView.children, [].concat(depth, [_children2]), parsed);
      }
    };

    for (var _iterator = routerViews, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref2;

      var _ret = _loop();

      if (_ret === "break") break;
    }

    return parsed;
  };

  _proto._beforeChange = function _beforeChange(to, from, op) {
    var _this3 = this;

    return new Promise(function (resolve) {
      var route = to.route = {
        path: to.path,
        fullPath: to.fullPath,
        url: to.url,
        query: to.query,
        hash: to.hash,
        state: to.state,
        meta: {},
        _beforeLeaveHooksInComp: [],
        _beforeEnterHooks: [],
        _asyncComponents: [],
        _meta: []
      };

      var _route = _this3._urlRouter.find('GET', to.path, {
        to: route,
        from: _this3.current,
        op: op
      });

      if (!_route) return false;
      var promise = Promise.resolve(true);
      [].concat(_this3.current.path ? _this3.current._beforeLeaveHooksInComp : [], // not landing page
      _this3._beforeChangeHooks, route._beforeEnterHooks).forEach(function (hook) {
        return promise = promise.then(function () {
          return Promise.resolve(hook(route, _this3.current, op)).then(function (result) {
            // if the hook abort or redirect the navigation, cancel the promise chain.
            if (!(result === true || result == null)) throw result;
          });
        });
      });
      promise["catch"](function (e) {
        if (e instanceof Error) throw e; // encountered unexpected error
        else return e; // the result of cancelled promise
      }).then(function (result) {
        return resolve(result);
      });
    });
  };

  _proto._generateMeta = function _generateMeta(route) {
    if (route._meta.length) {
      route._meta.forEach(function (m) {
        return Object.assign(route.meta, m.constructor === Function ? m(route) : m);
      });
    }
  };

  _proto._change = function _change(to) {
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
      Promise.all(to.route._asyncComponents.map(function (comp) {
        return comp();
      })).then(function () {
        Object.assign(_this4.current, to.route);
      })["catch"](function (e) {
        return _this4._handleError(e);
      });
    })["catch"](function (e) {
      if (e !== false) throw e;
    });
  };

  _proto._handleError = function _handleError(e) {
    this._errorHooks.forEach(function (hook) {
      return hook(e);
    });
  };

  _proto._resolveRoute = function _resolveRoute(route, depth) {
    var layout = {};
    var current = layout;

    for (var _iterator2 = depth, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref4;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref4 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref4 = _i2.value;
      }

      var routerViews = _ref4;
      current.children = {};

      for (var _iterator3 = routerViews, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
        var _ref5;

        if (_isArray3) {
          if (_i3 >= _iterator3.length) break;
          _ref5 = _iterator3[_i3++];
        } else {
          _i3 = _iterator3.next();
          if (_i3.done) break;
          _ref5 = _i3.value;
        }

        var routerView = _ref5;
        current.children[routerView.name || 'default'] = Object.assign({}, routerView);
      }

      current = current.children[routerViews[0].name || 'default'];
    }

    delete current.path;
    return this._resolveRouterViews(route, layout.children);
  };

  _proto._resolveRouterViews = function _resolveRouterViews(route, routerViews) {
    var _this5 = this;

    var resolved = {};

    var _loop2 = function _loop2(name) {
      var routerView = routerViews[name];
      if (routerView.constructor === Array || routerView.path) return "continue";
      var v = resolved[name] = {
        props: routerView.props
      };

      if (routerView.meta) {
        route._meta.push(routerView.meta);
      }

      if (routerView.beforeEnter) {
        route._beforeEnterHooks.push(routerView.beforeEnter);
      }

      if (routerView.component && routerView.component.constructor === Function) {
        route._asyncComponents.push(function () {
          return routerView.component().then(function (m) {
            return v.component = m.__esModule ? m["default"] : m;
          });
        });
      } else {
        v.component = routerView.component;
      }

      if (routerView.children) {
        v.children = _this5._resolveRouterViews(route, routerView.children);
      }
    };

    for (var name in routerViews) {
      var _ret2 = _loop2(name);

      if (_ret2 === "continue") continue;
    }

    return resolved;
  };

  _proto.start = function start(loc) {
    return this._history.start(loc);
  };

  _proto.normalize = function normalize(loc) {
    return this._history.normalize(loc);
  };

  _proto.url = function url(loc) {
    return this._history.url(loc);
  };

  _proto.dispatch = function dispatch(loc) {
    return this._history.dispatch(loc);
  };

  _proto.push = function push(loc) {
    return this._history.push(loc);
  };

  _proto.replace = function replace(loc) {
    return this._history.replace(loc);
  };

  _proto.setState = function setState(state) {
    this._history.setState(state); // Vue can not react if add new prop into state
    // so we replace it with a new state object


    this.current.state = _extends({}, this._history.current.state); // meta factory function may use state object to generate meta object
    // so we need to re-generate a new meta

    this._generateMeta(this.current);
  };

  _proto.go = function go(n, opts) {
    return this._history.go(n, opts);
  };

  _proto.back = function back(opts) {
    return this._history.back(opts);
  };

  _proto.forward = function forward(opts) {
    return this._history.forward(opts);
  };

  _proto.captureLinkClickEvent = function captureLinkClickEvent(e) {
    return this._history.captureLinkClickEvent(e);
  };

  return _default;
}();

var _default$4 =
/*#__PURE__*/
function (_Base) {
  _inheritsLoose(_default, _Base);

  function _default(args) {
    var _this;

    _this = _Base.call(this, args) || this;
    _this._history = new _default$1({
      base: args.base,
      beforeChange: _this._beforeChange.bind(_assertThisInitialized(_this)),
      change: _this._change.bind(_assertThisInitialized(_this))
    });
    return _this;
  }

  return _default;
}(_default$3);

var _default$5 =
/*#__PURE__*/
function (_Base) {
  _inheritsLoose(_default, _Base);

  function _default(args) {
    var _this;

    _this = _Base.call(this, args) || this;
    _this._history = new _default$2({
      beforeChange: _this._beforeChange.bind(_assertThisInitialized(_this)),
      change: _this._change.bind(_assertThisInitialized(_this))
    });
    return _this;
  }

  return _default;
}(_default$3);

export { _default$5 as HashRouter, _default$4 as PathRouter };
