(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["react"], factory);
	else if(typeof exports === 'object')
		exports["Reaptcha"] = factory(require("react"));
	else
		root["Reaptcha"] = factory(root["React"]);
})(global, function(__WEBPACK_EXTERNAL_MODULE__0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__0__;

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: external {"amd":"react","commonjs":"react","commonjs2":"react","root":"React"}
var external_amd_react_commonjs_react_commonjs2_react_root_React_ = __webpack_require__(0);
var external_amd_react_commonjs_react_commonjs2_react_root_React_default = /*#__PURE__*/__webpack_require__.n(external_amd_react_commonjs_react_commonjs2_react_root_React_);

// CONCATENATED MODULE: ./utils/injectScript.js
/* harmony default export */ var injectScript = (function (scriptSrc) {
  var script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = scriptSrc;

  if (document.head) {
    document.head.appendChild(script);
  }
});
// CONCATENATED MODULE: ./utils/isAnyScriptPresent.js
/* harmony default export */ var isAnyScriptPresent = (function (regex) {
  return Array.from(document.scripts).reduce(function (isPresent, script) {
    return isPresent ? isPresent : regex.test(script.src);
  }, false);
});
// CONCATENATED MODULE: ./index.js
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




var RECAPTCHA_SCRIPT_URL = 'https://recaptcha.net/recaptcha/api.js';
var RECAPTCHA_SCRIPT_REGEX = /(http|https):\/\/(www)?.+\/recaptcha/;

var index_Reaptcha =
/*#__PURE__*/
function (_Component) {
  _inherits(Reaptcha, _Component);

  function Reaptcha(props) {
    var _this;

    _classCallCheck(this, Reaptcha);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Reaptcha).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "container", null);

    _defineProperty(_assertThisInitialized(_this), "_isAvailable", function () {
      return Boolean(window && window.grecaptcha && window.grecaptcha.ready);
    });

    _defineProperty(_assertThisInitialized(_this), "_inject", function () {
      if (_this.props.inject && !isAnyScriptPresent(RECAPTCHA_SCRIPT_REGEX)) {
        var hlParam = _this.props.hl ? "&hl=".concat(_this.props.hl) : '';
        var src = "".concat(RECAPTCHA_SCRIPT_URL, "?render=explicit").concat(hlParam);
        injectScript(src);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_prepare", function () {
      var _this$props = _this.props,
          explicit = _this$props.explicit,
          onLoad = _this$props.onLoad;
      window.grecaptcha.ready(function () {
        _this.setState({
          ready: true
        }, function () {
          if (!explicit) {
            _this.renderExplicitly();
          }

          if (onLoad) {
            onLoad();
          }
        });
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_renderRecaptcha", function (container, config) {
      return window.grecaptcha.render(container, config);
    });

    _defineProperty(_assertThisInitialized(_this), "_resetRecaptcha", function () {
      return window.grecaptcha.reset(_this.state.instanceId);
    });

    _defineProperty(_assertThisInitialized(_this), "_executeRecaptcha", function () {
      return window.grecaptcha.execute(_this.state.instanceId);
    });

    _defineProperty(_assertThisInitialized(_this), "_getResponseRecaptcha", function () {
      return window.grecaptcha.getResponse(_this.state.instanceId);
    });

    _defineProperty(_assertThisInitialized(_this), "_stopTimer", function () {
      if (_this.state.timer) {
        clearInterval(_this.state.timer);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "componentDidMount", function () {
      _this._inject();

      if (_this._isAvailable()) {
        _this._prepare();
      } else {
        var timer = setInterval(function () {
          if (_this._isAvailable()) {
            _this._prepare();

            _this._stopTimer();
          }
        }, 500);

        _this.setState({
          timer: timer
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "shouldComponentUpdate", function (nextProps) {
      return _this.props.className !== nextProps.className || !_this.state.rendered;
    });

    _defineProperty(_assertThisInitialized(_this), "componentWillUnmount", function () {
      _this._stopTimer();

      if (_this.state.rendered) {
        _this._resetRecaptcha();
      }
    });

    _defineProperty(_assertThisInitialized(_this), "renderExplicitly", function () {
      return new Promise(function (resolve, reject) {
        if (_this.state.rendered) {
          return reject(new Error('This recaptcha instance has been already rendered.'));
        }

        if (_this.state.ready && _this.container) {
          var instanceId = _this._renderRecaptcha(_this.container, {
            sitekey: _this.props.sitekey,
            theme: _this.props.theme,
            size: _this.props.size,
            badge: _this.state.invisible ? _this.props.badge : null,
            tabindex: _this.props.tabindex,
            callback: _this.props.onVerify,
            'expired-callback': _this.props.onExpire,
            'error-callback': _this.props.onError,
            isolated: _this.state.invisible ? _this.props.isolated : null,
            hl: _this.state.invisible ? null : _this.props.hl
          });

          _this.setState({
            instanceId: instanceId,
            rendered: true
          }, function () {
            if (_this.props.onRender) {
              _this.props.onRender();
            }

            resolve();
          });
        } else {
          return reject(new Error('Recaptcha is not ready for rendering yet.'));
        }
      });
    });

    _defineProperty(_assertThisInitialized(_this), "reset", function () {
      return new Promise(function (resolve, reject) {
        if (_this.state.rendered) {
          _this._resetRecaptcha();

          return resolve();
        }

        reject(new Error('This recaptcha instance did not render yet.'));
      });
    });

    _defineProperty(_assertThisInitialized(_this), "execute", function () {
      return new Promise(function (resolve, reject) {
        if (!_this.state.invisible) {
          return reject(new Error('Manual execution is only available for invisible size.'));
        }

        if (_this.state.rendered) {
          _this._executeRecaptcha();

          resolve();
        }

        return reject(new Error('This recaptcha instance did not render yet.'));
      });
    });

    _defineProperty(_assertThisInitialized(_this), "getResponse", function () {
      return new Promise(function (resolve, reject) {
        if (_this.state.rendered) {
          var _response = _this._getResponseRecaptcha();

          return resolve(_response);
        }

        reject(new Error('This recaptcha instance did not render yet.'));
      });
    });

    _defineProperty(_assertThisInitialized(_this), "render", function () {
      var container = external_amd_react_commonjs_react_commonjs2_react_root_React_default.a.createElement("div", {
        id: _this.props.id,
        className: _this.props.className,
        ref: function ref(e) {
          return _this.container = e;
        }
      });
      return _this.props.children ? _this.props.children({
        renderExplicitly: _this.renderExplicitly,
        reset: _this.reset,
        execute: _this.execute,
        getResponse: _this.getResponse,
        recaptchaComponent: container
      }) : container;
    });

    _this.state = {
      instanceId: null,
      ready: false,
      rendered: false,
      invisible: _this.props.size === 'invisible',
      timer: null
    };
    return _this;
  }

  return Reaptcha;
}(external_amd_react_commonjs_react_commonjs2_react_root_React_["Component"]);

_defineProperty(index_Reaptcha, "defaultProps", {
  id: '',
  className: 'g-recaptcha',
  theme: 'light',
  size: 'normal',
  badge: 'bottomright',
  tabindex: 0,
  explicit: false,
  inject: true,
  isolated: false,
  hl: ''
});

/* harmony default export */ var index = __webpack_exports__["default"] = (index_Reaptcha);

/***/ })
/******/ ])["default"];
});