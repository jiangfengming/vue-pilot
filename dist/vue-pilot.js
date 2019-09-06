'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var spaHistory = require('spa-history');
var UrlRouter = _interopDefault(require('url-router'));

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

var _default =
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
    this._urlRouter = new UrlRouter(this._routes);
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

    from = Object.assign({}, this.current);
    var promise = Promise.resolve(true);

    this._afterChangeHooks.forEach(function (hook) {
      return promise = promise.then(function () {
        return Promise.resolve(hook(_this6.current, from, action, _this6)).then(function (result) {
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

var _default$1 =
/*#__PURE__*/
function (_Base) {
  _inheritsLoose(_default, _Base);

  function _default(args) {
    var _this;

    _this = _Base.call(this, args) || this;
    _this._history = new spaHistory.PathHistory({
      base: args.base,
      beforeChange: _this._beforeChange.bind(_assertThisInitialized(_this)),
      afterChange: _this._afterChange.bind(_assertThisInitialized(_this))
    });
    return _this;
  }

  return _default;
}(_default);

var _default$2 =
/*#__PURE__*/
function (_Base) {
  _inheritsLoose(_default, _Base);

  function _default(args) {
    var _this;

    _this = _Base.call(this, args) || this;
    _this._history = new spaHistory.HashHistory({
      beforeChange: _this._beforeChange.bind(_assertThisInitialized(_this)),
      afterChange: _this._afterChange.bind(_assertThisInitialized(_this))
    });
    return _this;
  }

  return _default;
}(_default);

exports.HashRouter = _default$2;
exports.PathRouter = _default$1;
exports.RouterLink = RouterLink;
exports.RouterView = RouterView;
