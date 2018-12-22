import { PathHistory, HashHistory } from 'spa-history';
import UrlRouter from 'url-router';

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

var _default =
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

  function _default(_ref) {
    var routes = _ref.routes;
    this._routes = this._parseRoutes(routes);
    this._urlRouter = new UrlRouter(this._routes);
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
      promise.catch(function (e) {
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
      }).catch(function (e) {
        return _this4._handleError(e);
      });
    }).catch(function (e) {
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
            return v.component = m.__esModule ? m.default : m;
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

var _default$1 =
/*#__PURE__*/
function (_Base) {
  _inheritsLoose(_default$$1, _Base);

  function _default$$1(args) {
    var _this;

    _this = _Base.call(this, args) || this;
    _this._history = new PathHistory({
      base: args.base,
      beforeChange: _this._beforeChange.bind(_assertThisInitialized(_assertThisInitialized(_this))),
      change: _this._change.bind(_assertThisInitialized(_assertThisInitialized(_this)))
    });
    return _this;
  }

  return _default$$1;
}(_default);

var _default$2 =
/*#__PURE__*/
function (_Base) {
  _inheritsLoose(_default$$1, _Base);

  function _default$$1(args) {
    var _this;

    _this = _Base.call(this, args) || this;
    _this._history = new HashHistory({
      beforeChange: _this._beforeChange.bind(_assertThisInitialized(_assertThisInitialized(_this))),
      change: _this._change.bind(_assertThisInitialized(_assertThisInitialized(_this)))
    });
    return _this;
  }

  return _default$$1;
}(_default);

export { _default$1 as PathRouter, _default$2 as HashRouter };
