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

var StringCaster = /*#__PURE__*/function () {
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

var _default = /*#__PURE__*/function () {
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

    if (SUPPORT_HISTORY_API) {
      if (!history.state || !history.state.__position__) {
        this.setState({});
      }

      this._onpopstate = function () {
        _this._beforeChange('pop', _this._getCurrentLocationFromBrowser());
      };

      window.addEventListener('popstate', this._onpopstate);
    }

    this._beforeChange('init', loc);
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
    var state = Object.assign({}, window.history.state);
    var loc = this.normalize(state.__path__ || this._extractPathFromExternalURL(window.location));
    loc.state = state;

    if (state.__path__) {
      loc.hidden = true;
    }

    return loc;
  };

  _proto._beforeChange = function _beforeChange(action, to) {
    var _this2 = this;

    var position = history.state && history.state.__position__ || history.length;
    to.state.__position__ = action === 'push' ? position + 1 : position;
    Promise.resolve(this.beforeChange(to, this.current, action)).then(function (ret) {
      if (ret === undefined || ret === true) {
        if (action === 'push' || action === 'replace') {
          _this2.__changeHistory(action, to);
        }

        var from = _this2.current;
        _this2.current = to;

        _this2.afterChange(to, from, action);
      } else if (ret === false) {
        if (action === 'pop') {
          _this2.go(_this2.current.state.__position__ - to.state.__position__, {
            silent: true
          });
        }
      } // do nothing if returns null
      else if (ret === null) {
          return;
        } else if (ret.constructor === String || ret.constructor === Object) {
          if (ret.action) {
            action = ret.action;
          } else if (action === 'init') {
            action = 'replace';
          } else if (action === 'pop') {
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
    var s = Object.assign({}, history.state, JSON.parse(JSON.stringify(state))); // dereferencing

    this.__changeHistory('replace', {
      state: s
    });

    if (this.current) {
      Object.assign(this.current.state, s);
    }
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
    var url = to.url || null;

    if (to.hidden) {
      state.__path__ = to.fullPath;
      url = to.appearPath && this.url(to.appearPath);
    }

    var position = history.state && history.state.__position__ || history.length;
    state.__position__ = action === 'push' ? position + 1 : position;
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

    var a = e.target.closest('a');

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
    } // outside of the app


    if (!a.href.startsWith(location.origin + this.url('/'))) {
      return;
    }

    var to = this.normalize(a.href);
    e.preventDefault(); // same url

    if (to.path === this.current.path && to.query.source.toString() === this.current.query.source.toString() && to.hash === this.current.hash) {
      this.replace(to);
    } else {
      this.push(to);
    }
  };

  return _default;
}();

var _default$1 = /*#__PURE__*/function (_Base) {
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

var _default$2 = /*#__PURE__*/function (_Base) {
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

var REGEX_PARAM_DEFAULT = /^[^/]+/;
var REGEX_START_WITH_PARAM = /^(:\w|\()/;
var REGEX_INCLUDE_PARAM = /:\w|\(/;
var REGEX_MATCH_PARAM = /^(?::(\w+))?(?:\(([^)]+)\))?/;

var Router = /*#__PURE__*/function () {
  function Router(routes) {
    var _this = this;

    this.root = this._createNode();

    if (routes) {
      routes.forEach(function (route) {
        return _this.add.apply(_this, route);
      });
    }
  }

  var _proto = Router.prototype;

  _proto._createNode = function _createNode(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        regex = _ref.regex,
        param = _ref.param,
        handler = _ref.handler;

    return {
      regex: regex,
      param: param,
      handler: handler,
      children: {
        string: {},
        regex: {}
      }
    };
  };

  _proto.add = function add(pattern, handler) {
    this._parseOptim(pattern, handler, this.root);

    return this;
  };

  _proto._parse = function _parse(remain, handler, parent) {
    if (REGEX_START_WITH_PARAM.test(remain)) {
      var match = remain.match(REGEX_MATCH_PARAM);
      var node = parent.children.regex[match[0]];

      if (!node) {
        node = parent.children.regex[match[0]] = this._createNode({
          regex: match[2] ? new RegExp('^' + match[2]) : REGEX_PARAM_DEFAULT,
          param: match[1]
        });
      }

      if (match[0].length === remain.length) {
        node.handler = handler;
      } else {
        this._parseOptim(remain.slice(match[0].length), handler, node);
      }
    } else {
      var _char = remain[0];
      var _node = parent.children.string[_char];

      if (!_node) {
        _node = parent.children.string[_char] = this._createNode();
      }

      this._parse(remain.slice(1), handler, _node);
    }
  };

  _proto._parseOptim = function _parseOptim(remain, handler, node) {
    if (REGEX_INCLUDE_PARAM.test(remain)) {
      this._parse(remain, handler, node);
    } else {
      var child = node.children.string[remain];

      if (child) {
        child.handler = handler;
      } else {
        node.children.string[remain] = this._createNode({
          handler: handler
        });
      }
    }
  };

  _proto.find = function find(path) {
    return this._findOptim(path, this.root, {});
  };

  _proto._findOptim = function _findOptim(remain, node, params) {
    var child = node.children.string[remain];

    if (child && child.handler !== undefined) {
      return {
        handler: child.handler,
        params: params
      };
    }

    return this._find(remain, node, params);
  };

  _proto._find = function _find(remain, node, params) {
    var child = node.children.string[remain[0]];

    if (child) {
      var result = this._find(remain.slice(1), child, params);

      if (result) {
        return result;
      }
    }

    for (var k in node.children.regex) {
      child = node.children.regex[k];
      var match = remain.match(child.regex);

      if (match) {
        if (match[0].length === remain.length && child.handler !== undefined) {
          if (child.param) {
            params[child.param] = decodeURIComponent(match[0]);
          }

          return {
            handler: child.handler,
            params: params
          };
        } else {
          var _result = this._findOptim(remain.slice(match[0].length), child, params);

          if (_result) {
            if (child.param) {
              params[child.param] = decodeURIComponent(match[0]);
            }

            return _result;
          }
        }
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
    var route = parent.$root.$router && parent.$root.$router.current; // make reactive

    route.fullPath; // eslint-disable-line no-unused-expressions

    route.state; // eslint-disable-line no-unused-expressions

    route.meta; // eslint-disable-line no-unused-expressions

    if (!route || !route._routerViews) {
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
        routerView = route._routerViews[props.name];
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

    if (routerView.key) {
      data.key = routerView.key instanceof Function ? routerView.key(route) : routerView.key;
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
    },
    target: String,
    href: String
  },
  render: function render(h, _ref) {
    var parent = _ref.parent,
        props = _ref.props,
        children = _ref.children,
        listeners = _ref.listeners,
        data = _ref.data;
    var router = parent.$router;
    var url = props.to;
    var href, to;
    var spa = false;
    var action = props.action;

    if (url) {
      var isAbsURL = url.constructor === String && /^\w+:/.test(url);

      if (isAbsURL) {
        if (router.origin.length) {
          try {
            var u = new URL(url);

            if (router.origin.includes(u.origin) && u.pathname.startsWith(router.url('/'))) {
              to = router.normalize(url);
              var locationOrigin = typeof window === 'object' && window.location && window.location.origin;

              if (locationOrigin && u.origin !== locationOrigin) {
                url = locationOrigin + u.pathname + u.search + u.hash;
              }
            }
          } catch (e) {// nop
          }
        }
      } else {
        to = router.normalize(url);
        url = to.url;
      }

      if (to && router._urlRouter.find(to.path)) {
        spa = true;
        href = to.url;

        if (to.path === router.current.path) {
          data["class"] = data["class"] ? ['active'].concat(data["class"]) : 'active';
        }
      } else {
        href = isAbsURL ? url : to.url;
      }

      if (props.tag === 'a') {
        data.attrs.href = props.href || href;

        if (props.target) {
          var target = props.target;
          data.attrs.target = target;

          if (spa && (target === '_blank' || target === '_parent' && window.parent !== window || target === '_top' && window.top !== window || !(target in {
            _self: 1,
            _blank: 1,
            _parent: 1,
            _top: 1
          }) && target !== window.name)) {
            spa = false;
          }
        }
      } // same url


      if (to && to.path === router.current.path && to.query.source.toString() === router.current.query.source.toString() && to.hash === router.current.hash) {
        action = 'replace';
      }

      data.on = Object.assign({}, listeners, {
        click: listeners.click ? [].concat(listeners.click, click) : click
      });
    }

    return h(props.tag, data, children);

    function click(e) {
      if (!e.defaultPrevented) {
        e.preventDefault();

        if (spa) {
          router[action](to);
        } else if (props.target) {
          window.open(url, props.target);
        } else if (action === 'push') {
          location = url;
        } else {
          location.replace(url);
        }
      }
    }
  }
};

var Base = /*#__PURE__*/function () {
  Base.install = function install(Vue) {
    Vue.component('router-view', RouterView);
    Vue.component('router-link', RouterLink);

    Vue.config.optionMergeStrategies.beforeRouteLeave = function (parent, child) {
      return child ? (parent || []).concat(child) : parent;
    };

    Vue.mixin({
      beforeCreate: function beforeCreate() {
        var router = this.$options.router || this.$parent && this.$parent.$router;

        if (!router) {
          return;
        }

        this.$router = router;

        if (this.$root === this && !router._observed) {
          router.current = Vue.observable(router.current);
          router._observed = true;
        }
      },
      mounted: function mounted() {
        var _this = this;

        if (this.$router && this.$vnode && // root vm's $vnode is undefined
        this.$vnode.data._routerView && this.$vnode.data._routerView.path && this.$options.beforeRouteLeave) {
          this.$router._hooks.beforeRouteLeave = this.$options.beforeRouteLeave.map(function (f) {
            return f.bind(_this);
          });
        }
      },
      beforeDestroy: function beforeDestroy() {
        if (this.$router && this.$vnode && this.$vnode.data._routerView && this.$vnode.data._routerView.path && this.$options.beforeRouteLeave) {
          this.$router._hooks.beforeRouteLeave = [];
        }
      }
    });
  };

  function Base(_ref) {
    var origin = _ref.origin,
        routes = _ref.routes;
    var locationOrigin = typeof window === 'object' && window.location && window.location.origin;
    this.origin = [].concat(locationOrigin || [], origin || []);
    this._routes = this._parseRoutes(routes);
    this._urlRouter = new Router(this._routes);
    this._hooks = {
      beforeChange: [],
      beforeChangeOnce: [],
      beforeUpdate: [],
      beforeUpdateOnce: [],
      afterChange: [],
      afterChangeOnce: [],
      beforeRouteEnter: [],
      beforeRouteLeave: []
    };
    this.current = {
      path: null,
      fullPath: null,
      url: null,
      query: null,
      hash: null,
      state: null,
      params: null,
      meta: null
    };
  }

  var _proto = Base.prototype;

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
          _this2._parseRoutes(routerView.children, [], _layers, parsed);
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

  _proto.on = function on(event, fn, _temp) {
    var _ref2 = _temp === void 0 ? {} : _temp,
        once = _ref2.once,
        beginning = _ref2.beginning;

    if (once) {
      event += 'Once';
    }

    if (beginning) {
      this._hooks[event].unshift(fn);
    } else {
      this._hooks[event].push(fn);
    }
  };

  _proto.off = function off(event, fn, _temp2) {
    var _ref3 = _temp2 === void 0 ? {} : _temp2,
        once = _ref3.once;

    if (once) {
      event += 'Once';
    }

    this._hooks[event] = this._hooks[event].filter(function (f) {
      return f !== fn;
    });
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
      _routerViews: null,
      _meta: []
    };

    var _route = this._urlRouter.find(to.path);

    if (_route) {
      this._resolveRoute(route, _route);
    }

    var hooks = this._hooks.beforeRouteLeave.concat(this._hooks.beforeRouteEnter, this._hooks.beforeChangeOnce.map(function (fn) {
      return fn.bind(_this3);
    }), this._hooks.beforeChange.map(function (fn) {
      return fn.bind(_this3);
    }));

    if (!hooks.length) {
      return true;
    }

    this._hooks.beforeChangeOnce = [];
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

    to.params = new StringCaster(_route.params);
    var root = {};
    var routerView = root;

    _route.handler.forEach(function (layer) {
      var last = Object.assign({}, layer[layer.length - 1]);
      delete last.children;

      var _layer = layer.slice(0, -1).concat(last);

      routerView.children = _this4._resolveRouterViews(_layer, to);
      routerView = routerView.children[last.name || 'default'];
    });

    to._routerViews = root.children;

    this._generateMeta(to);
  };

  _proto._resolveRouterViews = function _resolveRouterViews(routerViews, route) {
    var _this5 = this;

    var _routerViews = {};
    routerViews.forEach(function (_ref4) {
      var _ref4$name = _ref4.name,
          name = _ref4$name === void 0 ? 'default' : _ref4$name,
          path = _ref4.path,
          component = _ref4.component,
          key = _ref4.key,
          props = _ref4.props,
          meta = _ref4.meta,
          beforeEnter = _ref4.beforeEnter,
          children = _ref4.children;
      var com = _routerViews[name] = {
        component: component,
        key: key,
        props: props
      };

      if (path) {
        com.path = path;
        _this5._hooks.beforeRouteEnter = beforeEnter ? [].concat(beforeEnter).map(function (f) {
          return f.bind(_this5);
        }) : [];
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

  _proto._afterChange = function _afterChange(to, _, action) {
    var _this6 = this;

    var promise = Promise.resolve(true);

    this._hooks.beforeUpdateOnce.concat(this._hooks.beforeUpdate).forEach(function (hook) {
      return promise = promise.then(function () {
        return Promise.resolve(hook.call(_this6, to.route, _this6.current, action, _this6)).then(function (result) {
          if (result === false) {
            throw result;
          }
        });
      });
    });

    this._hooks.beforeUpdateOnce = [];
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
        var from = Object.assign({}, _this6.current);
        Object.assign(_this6.current, to.route);

        _this6._hooks.afterChangeOnce.concat(_this6._hooks.afterChange).forEach(function (hook) {
          hook.call(_this6, to.route, from, action, _this6);
        });

        _this6._hooks.afterChangeOnce = [];
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

  return Base;
}();

var PathRouter = /*#__PURE__*/function (_Base) {
  _inheritsLoose(PathRouter, _Base);

  function PathRouter(args) {
    var _this;

    _this = _Base.call(this, args) || this;
    _this._history = new _default$1({
      base: args.base,
      beforeChange: _this._beforeChange.bind(_assertThisInitialized(_this)),
      afterChange: _this._afterChange.bind(_assertThisInitialized(_this))
    });
    return _this;
  }

  return PathRouter;
}(Base);

var HashRouter = /*#__PURE__*/function (_Base) {
  _inheritsLoose(HashRouter, _Base);

  function HashRouter(args) {
    var _this;

    _this = _Base.call(this, args) || this;
    _this._history = new _default$2({
      beforeChange: _this._beforeChange.bind(_assertThisInitialized(_this)),
      afterChange: _this._afterChange.bind(_assertThisInitialized(_this))
    });
    return _this;
  }

  return HashRouter;
}(Base);

export { HashRouter, PathRouter, RouterLink, RouterView };
