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

function _int(s, _temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      radix = _ref.radix,
      defaults = _ref.defaults,
      _throws = _ref["throws"];

  if (s == null) {
    return defaults;
  }

  s = parseInt(s, radix);

  if (isNaN(s)) {
    if (_throws) {
      throw _throws;
    } else {
      return defaults;
    }
  } else {
    return s;
  }
}

function _float(s, _temp2) {
  var _ref2 = _temp2 === void 0 ? {} : _temp2,
      defaults = _ref2.defaults,
      _throws2 = _ref2["throws"];

  if (s == null) {
    return defaults;
  }

  s = parseFloat(s);

  if (isNaN(s)) {
    if (_throws2) {
      throw _throws2;
    } else {
      return defaults;
    }
  } else {
    return s;
  }
}

function _number(s, _temp3) {
  var _ref3 = _temp3 === void 0 ? {} : _temp3,
      defaults = _ref3.defaults,
      _throws3 = _ref3["throws"];

  if (s == null) {
    return defaults;
  }

  s = Number(s);

  if (isNaN(s)) {
    if (_throws3) {
      throw _throws3;
    } else {
      return defaults;
    }
  } else {
    return s;
  }
}

function _bool(s, _temp4) {
  var _ref4 = _temp4 === void 0 ? {} : _temp4,
      _ref4$empty = _ref4.empty,
      empty = _ref4$empty === void 0 ? true : _ref4$empty,
      defaults = _ref4.defaults,
      _throws4 = _ref4["throws"];

  if (s == null) {
    return defaults;
  }

  var truthy = ['1', 'true', 'yes'];
  var falsy = ['0', 'false', 'no'];

  if (empty === true) {
    truthy.push('');
  } else if (empty === false) {
    falsy.push('');
  }

  if (truthy.includes(s)) {
    return true;
  } else if (falsy.includes(s)) {
    return false;
  } else {
    if (_throws4) {
      throw _throws4;
    } else {
      return defaults;
    }
  }
}

function _string(v, _temp5) {
  var _ref5 = _temp5 === void 0 ? {} : _temp5,
      defaults = _ref5.defaults;

  return v == null ? defaults : String(v);
}

function _arrayOfInt(a, _temp6) {
  var _ref6 = _temp6 === void 0 ? {} : _temp6,
      radix = _ref6.radix,
      defaults = _ref6.defaults,
      dedup = _ref6.dedup,
      splitComma = _ref6.splitComma,
      _throws5 = _ref6["throws"];

  return trimArray(toArray(a, splitComma).map(function (s) {
    return _int(s, {
      radix: radix,
      "throws": _throws5
    });
  }), defaults, dedup);
}

function _arrayOfFloat(a, _temp7) {
  var _ref7 = _temp7 === void 0 ? {} : _temp7,
      defaults = _ref7.defaults,
      dedup = _ref7.dedup,
      splitComma = _ref7.splitComma,
      _throws6 = _ref7["throws"];

  return trimArray(toArray(a, splitComma).map(function (s) {
    return _float(s, {
      "throws": _throws6
    });
  }), defaults, dedup);
}

function _arrayOfNumber(a, _temp8) {
  var _ref8 = _temp8 === void 0 ? {} : _temp8,
      defaults = _ref8.defaults,
      dedup = _ref8.dedup,
      splitComma = _ref8.splitComma,
      _throws7 = _ref8["throws"];

  return trimArray(toArray(a, splitComma).map(function (s) {
    return _number(s, {
      "throws": _throws7
    });
  }), defaults, dedup);
}

function _arrayOfString(a, _temp9) {
  var _ref9 = _temp9 === void 0 ? {} : _temp9,
      defaults = _ref9.defaults,
      dedup = _ref9.dedup,
      splitComma = _ref9.splitComma;

  return trimArray(toArray(a, splitComma).map(function (v) {
    return _string(v);
  }), defaults, dedup);
}

function toArray(a, splitComma) {
  if (splitComma === void 0) {
    splitComma = false;
  }

  if (a == null) {
    return [];
  }

  if (a.constructor === String) {
    a = [a];
  }

  if (splitComma) {
    a = a.join(',').split(',');
  }

  return a;
}

function trimArray(a, defaults, dedup) {
  if (dedup === void 0) {
    dedup = true;
  }

  a = a.filter(function (v, i) {
    return v != null && (dedup ? a.indexOf(v) === i : true);
  });
  return a.length ? a : defaults;
}

var StringCaster =
/*#__PURE__*/
function () {
  function StringCaster(source) {
    this.source = source;
  }

  var _proto = StringCaster.prototype;

  _proto._getValue = function _getValue(key, isArray) {
    if (isArray === void 0) {
      isArray = false;
    }

    var src = this.source;

    if (this.source instanceof Function) {
      src = this.source();
    }

    if (src instanceof URLSearchParams) {
      return isArray ? src.getAll(key) : src.get(key);
    } else {
      return src[key];
    }
  };

  _proto["int"] = function int(key, _temp10) {
    var _ref10 = _temp10 === void 0 ? {} : _temp10,
        defaults = _ref10.defaults,
        radix = _ref10.radix,
        _throws8 = _ref10["throws"];

    return _int(this._getValue(key), {
      defaults: defaults,
      radix: radix,
      "throws": _throws8
    });
  };

  _proto["float"] = function float(key, _temp11) {
    var _ref11 = _temp11 === void 0 ? {} : _temp11,
        defaults = _ref11.defaults,
        _throws9 = _ref11["throws"];

    return _float(this._getValue(key), {
      defaults: defaults,
      "throws": _throws9
    });
  };

  _proto.number = function number(key, _temp12) {
    var _ref12 = _temp12 === void 0 ? {} : _temp12,
        defaults = _ref12.defaults,
        _throws10 = _ref12["throws"];

    return _number(this._getValue(key), {
      defaults: defaults,
      "throws": _throws10
    });
  };

  _proto.bool = function bool(key, _temp13) {
    var _ref13 = _temp13 === void 0 ? {} : _temp13,
        empty = _ref13.empty,
        defaults = _ref13.defaults,
        _throws11 = _ref13["throws"];

    return _bool(this._getValue(key), {
      empty: empty,
      defaults: defaults,
      "throws": _throws11
    });
  };

  _proto.string = function string(key, _temp14) {
    var _ref14 = _temp14 === void 0 ? {} : _temp14,
        defaults = _ref14.defaults;

    return _string(this._getValue(key), {
      defaults: defaults
    });
  };

  _proto.arrayOfInt = function arrayOfInt(key, _temp15) {
    var _ref15 = _temp15 === void 0 ? {} : _temp15,
        radix = _ref15.radix,
        defaults = _ref15.defaults,
        dedup = _ref15.dedup,
        splitComma = _ref15.splitComma,
        _throws12 = _ref15["throws"];

    return _arrayOfInt(this._getValue(key, true), {
      radix: radix,
      defaults: defaults,
      dedup: dedup,
      splitComma: splitComma,
      "throws": _throws12
    });
  };

  _proto.arrayOfFloat = function arrayOfFloat(key, _temp16) {
    var _ref16 = _temp16 === void 0 ? {} : _temp16,
        defaults = _ref16.defaults,
        dedup = _ref16.dedup,
        splitComma = _ref16.splitComma,
        _throws13 = _ref16["throws"];

    return _arrayOfFloat(this._getValue(key, true), {
      defaults: defaults,
      dedup: dedup,
      splitComma: splitComma,
      "throws": _throws13
    });
  };

  _proto.arrayOfNumber = function arrayOfNumber(key, _temp17) {
    var _ref17 = _temp17 === void 0 ? {} : _temp17,
        defaults = _ref17.defaults,
        dedup = _ref17.dedup,
        splitComma = _ref17.splitComma,
        _throws14 = _ref17["throws"];

    return _arrayOfNumber(this._getValue(key, true), {
      defaults: defaults,
      dedup: dedup,
      splitComma: splitComma,
      "throws": _throws14
    });
  };

  _proto.arrayOfString = function arrayOfString(key, _temp18) {
    var _ref18 = _temp18 === void 0 ? {} : _temp18,
        defaults = _ref18.defaults,
        dedup = _ref18.dedup,
        splitComma = _ref18.splitComma,
        _throws15 = _ref18["throws"];

    return _arrayOfString(this._getValue(key, true), {
      defaults: defaults,
      dedup: dedup,
      splitComma: splitComma,
      "throws": _throws15
    });
  };

  return StringCaster;
}();

function _inheritsLoose$1(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function appendSearchParams(searchParams, q) {
  switch (q.constructor) {
    case Object:
      Object.entries(q).forEach(function (_ref) {
        var key = _ref[0],
            val = _ref[1];

        if (val != null) {
          if (val.constructor === Array) {
            val.forEach(function (v) {
              return searchParams.append(key, v);
            });
          } else {
            searchParams.append(key, val);
          }
        }
      });
      break;

    case String:
      q = new URLSearchParams(q);
    // falls through

    case URLSearchParams:
      q.forEach(function (val, key) {
        return searchParams.append(key, val);
      });
      break;

    case Array:
      q.forEach(function (_ref2) {
        var key = _ref2[0],
            val = _ref2[1];
        return searchParams.append(key, val);
      });
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
        afterChange = _ref.afterChange;
    this.beforeChange = beforeChange;
    this.afterChange = afterChange;
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
        _this._beforeChange('pop', _this._getCurrentLocationFromBrowser());
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
      appendSearchParams(url.searchParams, loc.query instanceof StringCaster ? loc.query.source : loc.query);
    }

    if (loc.hash) {
      url.hash = loc.hash;
    }

    Object.assign(loc, {
      path: url.pathname,
      query: new StringCaster(url.searchParams),
      hash: url.hash,
      fullPath: url.pathname + url.search + url.hash,
      state: loc.state ? JSON.parse(JSON.stringify(loc.state)) : {} // dereferencing

    });
    loc.url = this._url(loc);
    return loc;
  };

  _proto._getCurrentLocationFromBrowser = function _getCurrentLocationFromBrowser() {
    var state = window.history.state || {};
    var loc = this.normalize(state.__path__ || this._extractPathFromExternalURL(window.location));
    loc.state = state;

    if (state.__path__) {
      loc.hidden = true;
    }

    return loc;
  }
  /*
    init
    success: nop                       fail: _beforeChange('replace', current)       redirect: _beforeChange('replace', redirect)
     push
    success: pushState(to)             fail: nop                                     redirect: _beforeChange('push', redirect)
     replace
    success: replaceState(to)          fail: nop                                     redirect: _beforeChange('replace', redirect)
     pop
    success: nop                       fail: __changeHistory('push', current)        redirect: _beforeChange('push', redirect)
     dispatch
    success: nop                       fail: nop                                     redirect: _beforeChange('dispatch', redirect)
  */
  ;

  _proto._beforeChange = function _beforeChange(action, to) {
    var _this2 = this; // `to` is same as `current` and `action` is `push`, set `action` to `replace`


    if (this.current && to.path === this.current.path && to.query.source.toString() === this.current.query.source.toString() && action === 'push') {
      action = 'replace';
    }

    Promise.resolve(this.beforeChange(to, this.current, action)).then(function (ret) {
      if (ret === undefined || ret === true) {
        if (action === 'push' || action === 'replace') {
          _this2.__changeHistory(action, to);
        }

        var from = _this2.current;
        _this2.current = to;

        _this2.afterChange(to, from, action);
      } else if (ret === false) {
        if (action === 'popstate') {
          _this2.__changeHistory('push', _this2.current);
        }
      } // do nothing if returns null
      else if (ret === null) {
          return;
        } else if (ret.constructor === String || ret.constructor === Object) {
          if (ret.action) {
            action = ret.action;
          } else if (action === 'init') {
            action = 'replace';
          } else if (action === 'popstate') {
            action = 'push';
          }

          _this2._beforeChange(action, _this2.normalize(ret));
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

  _proto._changeHistory = function _changeHistory(action, to) {
    to = this.normalize(to);

    if (to.silent) {
      this.__changeHistory(action, to);

      this.current = to;
    } else {
      this._beforeChange(action, to);
    }
  };

  _proto.__changeHistory = function __changeHistory(action, to) {
    if (!SUPPORT_HISTORY_API) {
      return;
    }

    var state = to.state;
    var url = to.url;

    if (to.hidden) {
      state.__path__ = to.fullPath;
      url = to.appearPath && this.url(to.appearPath);
    }

    window.history[action + 'State'](Object.keys(state).length ? state : null, '', url);
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
          _this3._beforeChange('pop', to);
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
    if (e.defaultPrevented) {
      return;
    }

    var a = e.target.closest('a'); // force not handle the <a> element

    if (!a) {
      return;
    } // open new window


    var target = a.target;

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

    if (to.path === this.current.path && to.query.source.toString() === this.current.query.source.toString() && to.hash && to.hash !== this.current.hash) {
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

  _proto.add = function add(method, path, handler) {
    // if method is omitted, defaults to 'GET'
    if (method.constructor !== String || !['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
      var _ref2 = ['GET', method, path];
      method = _ref2[0];
      path = _ref2[1];
      handler = _ref2[2];
    }

    if (!this._routes[method]) {
      this._routes[method] = [];
    }

    var table = this._routes[method];

    if (path.constructor === RegExp) {
      table.push({
        path: path,
        regex: path,
        handler: handler
      });
    } else {
      if (!/:|\*|\$/.test(path)) {
        table.push({
          path: path,
          handler: handler
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
          params: params
        });
      }
    }

    return this;
  };

  _proto.get = function get(path, handler) {
    return this.add('GET', path, handler);
  };

  _proto.post = function post(path, handler) {
    return this.add('POST', path, handler);
  };

  _proto.put = function put(path, handler) {
    return this.add('PUT', path, handler);
  };

  _proto["delete"] = function _delete(path, handler) {
    return this.add('DELETE', path, handler);
  };

  _proto.patch = function patch(path, handler) {
    return this.add('PATCH', path, handler);
  };

  _proto.head = function head(path, handler) {
    return this.add('HEAD', path, handler);
  };

  _proto.options = function options(path, handler) {
    return this.add('OPTIONS', path, handler);
  };

  _proto.trace = function trace(path, handler) {
    return this.add('TRACE', path, handler);
  };

  _proto.find = function find(method, path) {
    // if method is omitted, defaults to 'GET'
    if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
      var _ref3 = ['GET', method];
      method = _ref3[0];
      path = _ref3[1];
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
              params[k] = !params[k] ? params[k] : decodeURIComponent(params[k]);
            }

            resolved = {
              method: method,
              path: path,
              handler: handler,
              params: new StringCaster(params)
            };
          }
        })();
      } else {
        if (route.path === path) {
          resolved = {
            method: method,
            path: path,
            handler: route.handler,
            params: new StringCaster({})
          };
        }
      }

      if (resolved) {
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
    var route = parent.$root.$router && parent.$root.$router.current;

    if (!route || !route.routerViews) {
      return;
    }

    var routerView;
    var _parent = parent;

    while (_parent) {
      // root vm's $vnode is undefined
      if (_parent.$vnode && _parent.$vnode.data._routerView) {
        var _children = _parent.$vnode.data._routerView.children;
        routerView = _children && _children[props.name];
        break;
      } else if (_parent.$parent) {
        _parent = _parent.$parent;
      } else {
        routerView = route.routerViews[props.name];
        break;
      }
    }

    if (!routerView || !routerView.component) {
      return;
    }

    if (routerView.props) {
      var viewProps = routerView.props instanceof Function ? routerView.props(route) : routerView.props;
      Object.assign(data, {
        props: viewProps
      });
    }

    data._routerView = routerView;
    return h(routerView.component, data, children);
  }
};

var RouterLink = {
  functional: true,
  props: {
    to: {
      type: [String, Object]
    },
    action: {
      type: String,
      "default": 'push'
    },
    tag: {
      type: String,
      "default": 'a'
    }
  },
  render: function render(h, _ref) {
    var parent = _ref.parent,
        props = _ref.props,
        children = _ref.children,
        listeners = _ref.listeners,
        data = _ref.data;
    var router = parent.$router;
    var isAbsURL = props.to && props.to.constructor === String && /^https?:/.test(props.to);
    data.attrs.href = props.to ? isAbsURL ? props.to : router.url(props.to) : 'javascript:';
    data.on = Object.assign({}, listeners, {
      click: listeners.click ? [].concat(listeners.click, click) : click
    });
    return h(props.tag, data, children);

    function click(e) {
      if (e.defaultPrevented) {
        return;
      }

      var a = e.currentTarget; // open new window

      var target = a.target;

      if (target && (target === '_blank' || target === '_parent' && window.parent !== window || target === '_top' && window.top !== window || !(target in {
        _self: 1,
        _blank: 1,
        _parent: 1,
        _top: 1
      }) && target !== window.name)) {
        return;
      } // outside of app


      if (isAbsURL && !props.to.startsWith(location.origin + router.url('/'))) {
        return;
      }

      var to = router.normalize(props.to);

      if (!router._urlRouter.find(to.path)) {
        return;
      } // hash change


      if (to.path === router.current.path && to.query.source.toString() === router.current.query.source.toString() && to.hash && to.hash !== router.current.hash) {
        return;
      }

      e.preventDefault();
      router[props.action](to);
    }
  }
};

var _default$3 =
/*#__PURE__*/
function () {
  _default.install = function install(Vue) {
    Vue.component('router-view', RouterView);
    Vue.component('router-link', RouterLink);

    Vue.config.optionMergeStrategies.beforeRouteLeave = function (parent, child) {
      return child ? (parent || []).concat(child) : parent;
    };

    Vue.mixin({
      beforeCreate: function beforeCreate() {
        var _this = this;

        var router = this.$root.$options.router;

        if (!router) {
          return;
        }

        this.$router = router;

        if (this.$root === this) {
          router.current = Vue.observable(router.current);
        } else if (this.$vnode.data._routerView && this.$vnode.data._routerView.path && this.$options.beforeRouteLeave) {
          Array.prototype.push.apply(router.current._beforeLeave, this.$options.beforeRouteLeave.map(function (f) {
            return f.bind(_this);
          }));
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
    this.current = {
      path: null,
      fullPath: null,
      url: null,
      query: null,
      hash: null,
      state: null,
      params: null,
      meta: null,
      routerViews: null,
      // make <router-view> reactive
      _meta: [],
      _beforeEnter: [],
      _beforeLeave: []
    };
  }

  var _proto = _default.prototype;

  _proto._parseRoutes = function _parseRoutes(routerViews, siblings, layers, parsed) {
    var _this2 = this;

    if (siblings === void 0) {
      siblings = [];
    }

    if (layers === void 0) {
      layers = [];
    }

    if (parsed === void 0) {
      parsed = [];
    }

    var sib = routerViews.filter(function (v) {
      return !(v instanceof Array) && !v.path;
    });
    var names = sib.map(function (v) {
      return v.name;
    }); // router views in same array has higher priority than outer ones

    siblings = siblings.filter(function (v) {
      return !names.includes(v.name);
    }).concat(sib);
    routerViews.forEach(function (routerView) {
      if (routerView instanceof Array) {
        _this2._parseRoutes(routerView, siblings, layers, parsed);
      } else {
        var layer = siblings.filter(function (v) {
          return v.name !== routerView.name;
        }).concat(routerView);

        var _layers = layers.concat([layer]);

        if (routerView.children) {
          _this2._parseRoutes(routerView.children, siblings, _layers, parsed);
        } else if (routerView.path) {
          parsed.push([routerView.path, _layers]);
        }
      }
    });
    return parsed;
  };

  _proto.setState = function setState(state) {
    this._history.setState(state); // Vue can not react if add new props into an existing object
    // so we replace it with a new state object


    this.current.state = Object.assign({}, this._history.current.state); // meta factory function may use state object to generate meta object
    // so we need to re-generate a new meta

    this._generateMeta(this.current);
  };

  _proto.beforeChange = function beforeChange(hook) {
    this._beforeChangeHooks.push(hook.bind(this));
  };

  _proto._beforeChange = function _beforeChange(to, from, action) {
    var _this3 = this;

    var route = to.route = {
      path: to.path,
      fullPath: to.fullPath,
      url: to.url,
      query: to.query,
      hash: to.hash,
      state: to.state,
      meta: {},
      params: null,
      routerViews: null,
      _meta: [],
      _beforeEnter: [],
      _beforeLeave: []
    };

    var _route = this._urlRouter.find(to.path);

    if (_route) {
      this._resolveRoute(route, _route);
    }

    var hooks = this.current._beforeLeave.concat(to.route._beforeEnter, this._beforeChangeHooks);

    if (!hooks.length) {
      return true;
    }

    var promise = Promise.resolve(true);
    hooks.forEach(function (hook) {
      return promise = promise.then(function () {
        return Promise.resolve(hook(route, _this3.current, action, _this3)).then(function (result) {
          // if the hook abort or redirect the navigation, cancel the promise chain.
          if (result !== undefined && result !== true) {
            throw result;
          }
        });
      });
    });
    return promise["catch"](function (e) {
      if (e instanceof Error) {
        // encountered unexpected error
        throw e;
      } else {
        // abort or redirect
        return e;
      }
    });
  };

  _proto._resolveRoute = function _resolveRoute(to, _route) {
    var _this4 = this;

    to.params = _route.params;
    var root = {};
    var routerView = root;

    _route.handler.forEach(function (layer) {
      var last = Object.assign({}, layer[layer.length - 1]);
      delete last.children;

      var _layer = layer.slice(0, -1).concat(last);

      routerView.children = _this4._resolveRouterViews(_layer, to);
      routerView = routerView.children[last.name || 'default'];
    });

    to.routerViews = root.children;

    this._generateMeta(to);
  };

  _proto._resolveRouterViews = function _resolveRouterViews(routerViews, route) {
    var _this5 = this;

    var _routerViews = {};
    routerViews.forEach(function (_ref2) {
      var _ref2$name = _ref2.name,
          name = _ref2$name === void 0 ? 'default' : _ref2$name,
          path = _ref2.path,
          component = _ref2.component,
          props = _ref2.props,
          meta = _ref2.meta,
          beforeEnter = _ref2.beforeEnter,
          children = _ref2.children;
      var com = _routerViews[name] = {
        component: component,
        props: props
      };

      if (path) {
        com.path = path;

        if (beforeEnter) {
          Array.prototype.push.apply(route._beforeEnter, [].concat(beforeEnter).map(function (f) {
            return f.bind(_this5);
          }));
        }
      }

      if (meta) {
        route._meta.push(meta);
      }

      if (children) {
        children = children.filter(function (v) {
          return !(v instanceof Array) && !v.path;
        });
        com.children = _this5._resolveRouterViews(children, route);
      }
    });
    return _routerViews;
  };

  _proto._generateMeta = function _generateMeta(route) {
    route.meta = {};

    if (route._meta.length) {
      route._meta.forEach(function (m) {
        return Object.assign(route.meta, m instanceof Function ? m(route) : m);
      });
    }
  };

  _proto.afterChange = function afterChange(hook) {
    this._afterChangeHooks.push(hook.bind(this));
  };

  _proto._afterChange = function _afterChange(to, from, action) {
    var _this6 = this;

    var promise = Promise.resolve(true);

    this._afterChangeHooks.forEach(function (hook) {
      return promise = promise.then(function () {
        return Promise.resolve(hook(to.route, _this6.current, action, _this6)).then(function (result) {
          if (result === false) {
            throw result;
          }
        });
      });
    });

    promise["catch"](function (e) {
      if (e instanceof Error) {
        // encountered unexpected error
        throw e;
      } else {
        // abort or redirect
        return e;
      }
    }).then(function (v) {
      if (v !== false) {
        Object.assign(_this6.current, to.route);
      }
    });
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
      afterChange: _this._afterChange.bind(_assertThisInitialized(_this))
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
      afterChange: _this._afterChange.bind(_assertThisInitialized(_this))
    });
    return _this;
  }

  return _default;
}(_default$3);

export { _default$5 as HashRouter, _default$4 as PathRouter, RouterLink, RouterView };
