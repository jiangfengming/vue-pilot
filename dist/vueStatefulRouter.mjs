import { PathHistory, HashHistory } from 'spa-history';
import UrlRouter from 'url-router';

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
    var route = parent.$root.$router.current;

    if (!route || !route._layout) {
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
        routerView = route._layout[props.name];
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
    tag: {
      "default": 'a'
    },
    to: {
      type: [String, Object]
    },
    action: {
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
      if (!e.defaultPrevented && props.to) {
        e.preventDefault();
        parent.$router[props.action](props.to);
      }
    }

    data.attrs.href = props.to ? parent.$router.url(props.to) : 'javascript:';
    data.on = Object.assign({}, listeners, {
      click: listeners.click ? [].concat(listeners.click, click) : click
    });
    return h(props.tag, data, children);
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
      _layout: null // make <router-view> reactive

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
          parsed.push([routerView.path, _layers, function (matchedRoute, _ref2) {
            var to = _ref2.to,
                from = _ref2.from,
                action = _ref2.action;

            _this2._resolveRoute(to, from, matchedRoute);

            return _this2._test(to, from, action);
          }]);
        }
      }
    });
    return parsed;
  };

  _proto._resolveRoute = function _resolveRoute(to, from, matchedRoute) {
    var _this3 = this;

    to.params = matchedRoute.params;
    to._meta = [];
    to._test = [];
    to._beforeEnter = [];
    to._beforeLeave = [];
    var root = {};
    var routerView = root;
    matchedRoute.handler.forEach(function (layer) {
      var last = Object.assign({}, layer[layer.length - 1]);
      delete last.children;

      var _layer = layer.slice(0, -1).concat(last);

      routerView.children = _this3._resolveRouterViews(_layer, to);
      routerView = routerView.children[last.name || 'default'];
    });
    to._layout = root.children;

    this._generateMeta(to);
  };

  _proto._resolveRouterViews = function _resolveRouterViews(routerViews, route) {
    var _this4 = this;

    var _routerViews = {};
    routerViews.forEach(function (_ref3) {
      var _ref3$name = _ref3.name,
          name = _ref3$name === void 0 ? 'default' : _ref3$name,
          path = _ref3.path,
          component = _ref3.component,
          props = _ref3.props,
          meta = _ref3.meta,
          test = _ref3.test,
          beforeEnter = _ref3.beforeEnter,
          children = _ref3.children;
      var com = _routerViews[name] = {
        component: component,
        props: props
      };

      if (path) {
        com.path = path;

        if (beforeEnter) {
          Array.prototype.push.apply(route._beforeEnter, [].concat(beforeEnter));
        }
      }

      if (meta) {
        route._meta.push(meta);
      }

      if (test) {
        Array.prototype.push.apply(route._test, [].concat(test));
      }

      if (children) {
        children = children.filter(function (v) {
          return !(v instanceof Array) && !v.path;
        });
        com.children = _this4._resolveRouterViews(children, route);
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

  _proto.setState = function setState(state) {
    this._history.setState(state); // Vue can not react if add new props into an existing object
    // so we replace it with a new state object


    this.current.state = Object.assign({}, this._history.current.state); // meta factory function may use state object to generate meta object
    // so we need to re-generate a new meta

    this._generateMeta(this.current);
  };

  _proto._test = function _test(to, from, action) {
    return !to._test.some(function (t) {
      return !t(to, from, action);
    });
  };

  _proto.beforeChange = function beforeChange(hook) {
    this._beforeChangeHooks.push(hook);
  };

  _proto._beforeChange = function _beforeChange(to, from, action) {
    var _this5 = this;

    var route = to.route = {
      path: to.path,
      fullPath: to.fullPath,
      url: to.url,
      query: to.query,
      hash: to.hash,
      state: to.state
    };

    var _route = this._urlRouter.find(to.path, {
      to: route,
      from: this.current,
      action: action
    });

    if (!_route) {
      return false;
    }

    var hooks = (this.current._beforeLeave || []).concat(to.route._beforeEnter, this._beforeChangeHooks);

    if (!hooks.length) {
      return true;
    }

    var promise = Promise.resolve(true);
    hooks.forEach(function (hook) {
      return promise = promise.then(function () {
        return Promise.resolve(hook(route, _this5.current, action)).then(function (result) {
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

  _proto.afterChange = function afterChange(hook) {
    this._afterChangeHooks.push(hook);
  };

  _proto._afterChange = function _afterChange(to, from, action) {
    var _this6 = this;

    from = Object.assign({}, this.current);
    Object.assign(this.current, to.route);

    this._afterChangeHooks.forEach(function (hook) {
      return hook(_this6.current, from, action);
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
    _this._history = new PathHistory({
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
    _this._history = new HashHistory({
      beforeChange: _this._beforeChange.bind(_assertThisInitialized(_this)),
      afterChange: _this._afterChange.bind(_assertThisInitialized(_this))
    });
    return _this;
  }

  return _default;
}(_default);

export { _default$2 as HashRouter, _default$1 as PathRouter, RouterLink, RouterView };
