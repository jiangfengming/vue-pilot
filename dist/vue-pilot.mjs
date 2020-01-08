import { PathHistory, HashHistory } from 'spa-history';
import URLRouter from 'url-router';
import { StringCaster } from 'cast-string';

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

    if (!url) {
      href = 'javascript:';
    } else {
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
          data["class"] = 'active';
        }
      } else {
        href = isAbsURL ? url : to.url;
      }
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


    if (to.path === router.current.path && to.query.source.toString() === router.current.query.source.toString() && to.hash === router.current.hash) {
      action = 'replace';
    }

    data.on = Object.assign({}, listeners, {
      click: listeners.click ? [].concat(listeners.click, click) : click
    });
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

var Base =
/*#__PURE__*/
function () {
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
    this._urlRouter = new URLRouter(this._routes);
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

var PathRouter =
/*#__PURE__*/
function (_Base) {
  _inheritsLoose(PathRouter, _Base);

  function PathRouter(args) {
    var _this;

    _this = _Base.call(this, args) || this;
    _this._history = new PathHistory({
      base: args.base,
      beforeChange: _this._beforeChange.bind(_assertThisInitialized(_this)),
      afterChange: _this._afterChange.bind(_assertThisInitialized(_this))
    });
    return _this;
  }

  return PathRouter;
}(Base);

var HashRouter =
/*#__PURE__*/
function (_Base) {
  _inheritsLoose(HashRouter, _Base);

  function HashRouter(args) {
    var _this;

    _this = _Base.call(this, args) || this;
    _this._history = new HashHistory({
      beforeChange: _this._beforeChange.bind(_assertThisInitialized(_this)),
      afterChange: _this._afterChange.bind(_assertThisInitialized(_this))
    });
    return _this;
  }

  return HashRouter;
}(Base);

export { HashRouter, PathRouter, RouterLink, RouterView };
