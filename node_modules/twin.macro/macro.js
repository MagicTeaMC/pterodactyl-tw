function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var babylon = _interopDefault(require('@babel/parser'));
var get = _interopDefault(require('lodash.get'));
var createColor = _interopDefault(require('color'));
var chalk = _interopDefault(require('chalk'));
var path = require('path');
var fs = require('fs');
var resolveTailwindConfig = _interopDefault(require('tailwindcss/lib/util/resolveConfig'));
var defaultTailwindConfig = _interopDefault(require('tailwindcss/stubs/defaultConfig.stub'));
var flatMap = _interopDefault(require('lodash.flatmap'));
var template = _interopDefault(require('@babel/template'));
var cleanSet = _interopDefault(require('clean-set'));
var timSort = _interopDefault(require('timsort'));
var babelPluginMacros = require('babel-plugin-macros');
var stringSimilarity = _interopDefault(require('string-similarity'));
var processPlugins = _interopDefault(require('tailwindcss/lib/util/processPlugins'));
var deepMerge = _interopDefault(require('lodash.merge'));

var throwIf = function (expression, callBack) {
  if (!expression) { return; }
  throw new babelPluginMacros.MacroError(callBack());
};

var isEmpty = function (value) { return value === undefined || value === null || typeof value === 'object' && Object.keys(value).length === 0 || typeof value === 'string' && value.trim().length === 0; };

var addPxTo0 = function (string) { return Number(string) === 0 ? (string + "px") : string; };

function transformThemeValue(themeSection) {
  if (['fontSize', 'outline'].includes(themeSection)) {
    return function (value) { return Array.isArray(value) ? value[0] : value; };
  }

  if (['fontFamily', 'boxShadow', 'transitionProperty', 'transitionDuration', 'transitionDelay', 'transitionTimingFunction', 'backgroundImage', 'backgroundSize', 'backgroundColor', 'cursor', 'animation'].includes(themeSection)) {
    return function (value) { return Array.isArray(value) ? value.join(', ') : value; };
  }

  if (themeSection === 'colors') {
    return function (value) { return typeof value === 'function' ? value({}) : value; };
  }

  return function (value) { return value; };
}

var objectToStringValues = function (obj) {
  if (typeof obj === 'object' && !Array.isArray(obj)) { return Object.entries(obj).reduce(function (result, ref) {
    var obj;

    var key = ref[0];
    var value = ref[1];
    return deepMerge(result, ( obj = {}, obj[key] = objectToStringValues(value), obj ));
    }, {}); }
  if (Array.isArray(obj)) { return obj.map(function (i) { return objectToStringValues(i); }); }
  if (typeof obj === 'number') { return String(obj); } // typeof obj = string / function

  return obj;
};

var getTheme = function (configTheme) { return function (grab) {
  if (!grab) { return configTheme; } // Allow theme`` which gets supplied as an array

  var value = Array.isArray(grab) ? grab[0] : grab; // Get the theme key so we can apply certain rules in transformThemeValue

  var themeKey = value.split('.')[0]; // Get the resulting value from the config

  var themeValue = get(configTheme, value);
  return objectToStringValues(transformThemeValue(themeKey)(themeValue));
}; };

var stripNegative = function (string) { return string && string.length > 1 && string.slice(0, 1) === '-' ? string.slice(1, string.length) : string; };

var camelize = function (string) { return string && string.replace(/\W+(.)/g, function (_, chr) { return chr.toUpperCase(); }); };

var isNumeric = function (str) {
  /* eslint-disable-next-line eqeqeq */
  if (typeof str != 'string') { return false; }
  return !Number.isNaN(str) && !Number.isNaN(Number.parseFloat(str));
};

var isClass = function (str) { return new RegExp(/(\s*\.|{{)\w/).test(str); };

var isMediaQuery = function (str) { return str.startsWith('@media'); };

var isShortCss = function (className) { return new RegExp(/[^/-]\[/).test(className); };

var isArbitraryCss = function (className) { return new RegExp(/-\[/).test(className); }; // Split a string at a value


function splitOnFirst(input, delim) {
  return (function (ref) {
    var first = ref[0];
    var rest = ref.slice(1);

    return [first, rest.join(delim)];
  })(input.split(delim));
}

function hasAlpha(color) {
  return color.startsWith('rgba(') || color.startsWith('hsla(') || color.startsWith('#') && color.length === 9 || color.startsWith('#') && color.length === 5;
}

function toRgba(color) {
  var ref = createColor(color).rgb().array();
  var r = ref[0];
  var g = ref[1];
  var b = ref[2];
  var a = ref[3];
  return [r, g, b, a === undefined && hasAlpha(color) ? 1 : a];
}

function toHsla(color) {
  var ref = createColor(color).hsl().array();
  var h = ref[0];
  var s = ref[1];
  var l = ref[2];
  var a = ref[3];
  return [h, s, l, a === undefined && hasAlpha(color) ? 1 : a];
}

var toPercent = function (value) { return value > 0 ? (value + "%") : value; };

var colorMap = {
  hsl: function (color) {
    var ref = toHsla(color);
    var h = ref[0];
    var s = ref[1];
    var l = ref[2];
    var a = ref[3];
    return {
      values: [h, toPercent(s), toPercent(l)].join(', '),
      alpha: a,
      prefix: a ? 'hsla' : 'hsla',
      alphaPrefix: 'hsla'
    };
  },
  rgb: function (color) {
    var ref = toRgba(color);
    var r = ref[0];
    var g = ref[1];
    var b = ref[2];
    var a = ref[3];
    return {
      values: [r, g, b].join(', '),
      alpha: a,
      prefix: a ? 'rgba' : 'rgba',
      alphaPrefix: 'rgba'
    };
  }
};

var makeColorValue = function (color) {
  var type = color.slice(0, 3);
  var colorType = colorMap[type] || colorMap.rgb;
  var alphaValue;

  var colorValue = function (ref) {
    var a = ref.a;

    var ref$1 = colorType(color);
    var alphaPrefix = ref$1.alphaPrefix;
    var prefix = ref$1.prefix;
    var values = ref$1.values;
    var alpha = ref$1.alpha;
    alphaValue = alpha !== undefined ? alpha : a;
    var finalColor = [values, alphaValue].filter(function (i) { return i !== undefined; });
    var finalPrefix = alphaValue !== undefined ? alphaPrefix : prefix;
    return (finalPrefix + "(" + (finalColor.join(', ')) + ")");
  };

  return [colorValue, alphaValue];
};

var withAlpha = function (ref) {
  var obj, obj$1, obj$2, obj$3, obj$4, obj$5;

  var color = ref.color;
  var property = ref.property;
  var variable = ref.variable;
  var pieces = ref.pieces; if ( pieces === void 0 ) pieces = {};
  var useSlashAlpha = ref.useSlashAlpha; if ( useSlashAlpha === void 0 ) useSlashAlpha = variable ? !variable : true;
  var hasFallback = ref.hasFallback; if ( hasFallback === void 0 ) hasFallback = true;
  if (!color) { return; } // Validate the slash opacity and show an error that was generated earlier

  throwIf(useSlashAlpha && pieces.alphaError, pieces.alphaError);

  if (typeof color === 'function') {
    if (variable && property) {
      var value = color({
        opacityVariable: variable,
        opacityValue: ("var(" + variable + ")")
      });
      return ( obj = {}, obj[variable] = '1', obj[property] = value, obj );
    }

    color = color({
      opacityVariable: variable
    });
  }

  if (!property && !useSlashAlpha) { return ("" + color + (pieces.important)); }

  try {
    var ref$1 = makeColorValue(color);
    var colorValue = ref$1[0];
    var a = ref$1[1];

    if (!useSlashAlpha) {
      if (!variable || color.startsWith('var(')) // a !== undefined ||
        { return ( obj$1 = {}, obj$1[property] = ("" + color + (pieces.important)), obj$1 ); }
      var value$1 = colorValue({
        a: ("var(" + variable + ")")
      });
      return Object.assign({}, (value$1.includes('var(') && ( obj$2 = {}, obj$2[variable] = '1', obj$2 )),
        ( obj$3 = {}, obj$3[property] = ("" + value$1 + (pieces.important)), obj$3 ));
    }

    var value$2 = "" + (pieces.hasAlpha && colorValue({
      a: pieces.alpha
    }) || a && colorValue() || colorValue()) + (pieces.important);
    return property ? ( obj$4 = {}, obj$4[property] = value$2, obj$4 ) : value$2;
  } catch (_) {
    if (!hasFallback) { return; }
    return ( obj$5 = {}, obj$5[property] = ("" + color + (pieces.important)), obj$5 );
  }
};

var transparentTo = function (value) {
  if (typeof value === 'function') {
    value = value({
      opacityValue: 0
    });
  }

  try {
    var ref = toRgba(value);
    var r = ref[0];
    var g = ref[1];
    var b = ref[2];
    return ("rgba(" + r + ", " + g + ", " + b + ", 0)");
  } catch (_) {
    return "rgba(255, 255, 255, 0)";
  }
};

var dynamicStyles = {
  /**
   * ===========================================
   * Layout
   */
  // https://tailwindcss.com/docs/animation
  animate: {
    prop: 'animation',
    plugin: 'animation'
  },
  // https://tailwindcss.com/docs/container
  container: {
    hasArbitrary: false,
    plugin: 'container'
  },
  // https://tailwindcss.com/docs/just-in-time-mode#content-utilities
  content: {
    prop: 'content'
  },
  // https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
  caret: {
    plugin: 'caretColor',
    value: ['color'],
    coerced: {
      color: function (value) { return ({
        caretColor: value
      }); }
    }
  },
  // https://tailwindcss.com/docs/box-sizing
  // https://tailwindcss.com/docs/display
  // https://tailwindcss.com/docs/float
  // https://tailwindcss.com/docs/clear
  // https://tailwindcss.com/docs/object-fit
  // See staticStyles.js
  // https://tailwindcss.com/docs/object-position
  object: {
    prop: 'objectPosition',
    config: 'objectPosition'
  },
  // https://tailwindcss.com/docs/overflow
  // https://tailwindcss.com/docs/position
  // See staticStyles.js
  // https://tailwindcss.com/docs/top-right-bottom-left
  top: {
    prop: 'top',
    config: 'inset'
  },
  bottom: {
    prop: 'bottom',
    config: 'inset'
  },
  right: {
    prop: 'right',
    config: 'inset'
  },
  left: {
    prop: 'left',
    config: 'inset'
  },
  'inset-y': {
    prop: ['top', 'bottom'],
    config: 'inset'
  },
  'inset-x': {
    prop: ['left', 'right'],
    config: 'inset'
  },
  inset: {
    prop: ['top', 'right', 'bottom', 'left'],
    config: 'inset'
  },
  // https://tailwindcss.com/docs/visibility
  // See staticStyles.js
  // https://tailwindcss.com/docs/z-index
  z: {
    prop: 'zIndex',
    config: 'zIndex'
  },
  // https://tailwindcss.com/docs/space
  // space-x-reverse + space-y-reverse are in staticStyles
  'space-y': {
    plugin: 'space',
    value: function (ref) {
      var value = ref.value;

      return ({
      '> :not([hidden]) ~ :not([hidden])': {
        '--tw-space-y-reverse': '0',
        marginTop: ("calc(" + value + " * calc(1 - var(--tw-space-y-reverse)))"),
        marginBottom: ("calc(" + value + " * var(--tw-space-y-reverse))")
      }
    });
}
  },
  'space-x': {
    plugin: 'space',
    value: function (ref) {
      var value = ref.value;

      return ({
      '> :not([hidden]) ~ :not([hidden])': {
        '--tw-space-x-reverse': '0',
        marginRight: ("calc(" + value + " * var(--tw-space-x-reverse))"),
        marginLeft: ("calc(" + value + " * calc(1 - var(--tw-space-x-reverse)))")
      }
    });
}
  },
  // https://tailwindcss.com/docs/divide-width/
  'divide-opacity': {
    prop: '--tw-divide-opacity',
    plugin: 'divide'
  },
  'divide-y': {
    plugin: 'divide',
    value: function (ref) {
      var value = ref.value;

      return ({
      '> :not([hidden]) ~ :not([hidden])': {
        '--tw-divide-y-reverse': '0',
        borderTopWidth: ("calc(" + value + " * calc(1 - var(--tw-divide-y-reverse)))"),
        borderBottomWidth: ("calc(" + value + " * var(--tw-divide-y-reverse))")
      }
    });
}
  },
  'divide-x': {
    plugin: 'divide',
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-divide-x-reverse': '0',
      borderRightWidth: ("calc(" + value + " * var(--tw-divide-x-reverse))"),
      borderLeftWidth: ("calc(" + value + " * calc(1 - var(--tw-divide-x-reverse)))")
    });
}
  },
  divide: {
    plugin: 'divide',
    value: ['color'],
    coerced: {
      color: {
        property: 'borderColor',
        variable: '--tw-divide-opacity',
        useSlashAlpha: false
      }
    }
  },

  /**
   * ===========================================
   * Flexbox
   */
  // https://tailwindcss.com/docs/flex-direction
  // https://tailwindcss.com/docs/flex-wrap
  // https://tailwindcss.com/docs/align-items
  // https://tailwindcss.com/docs/align-content
  // https://tailwindcss.com/docs/align-self
  // https://tailwindcss.com/docs/justify-content
  // See staticStyles.js
  // https://tailwindcss.com/docs/flex-grow
  'flex-grow': {
    prop: 'flexGrow',
    config: 'flexGrow'
  },
  // https://tailwindcss.com/docs/flex-shrink
  'flex-shrink': {
    prop: 'flexShrink',
    config: 'flexShrink'
  },
  // https://tailwindcss.com/docs/flex
  flex: {
    prop: 'flex',
    config: 'flex'
  },
  // https://tailwindcss.com/docs/order
  order: {
    prop: 'order',
    config: 'order'
  },

  /**
   * ===========================================
   * Grid
   */
  // https://tailwindcss.com/docs/grid-template-columns
  'grid-cols': {
    prop: 'gridTemplateColumns',
    config: 'gridTemplateColumns'
  },
  // https://tailwindcss.com/docs/grid-column
  col: {
    prop: 'gridColumn',
    config: 'gridColumn'
  },
  'col-start': {
    prop: 'gridColumnStart',
    config: 'gridColumnStart'
  },
  'col-end': {
    prop: 'gridColumnEnd',
    config: 'gridColumnEnd'
  },
  // https://tailwindcss.com/docs/grid-template-rows
  'grid-rows': {
    prop: 'gridTemplateRows',
    config: 'gridTemplateRows'
  },
  // https://tailwindcss.com/docs/grid-row
  row: {
    prop: 'gridRow',
    config: 'gridRow'
  },
  'row-start': {
    prop: 'gridRowStart',
    config: 'gridRowStart'
  },
  'row-end': {
    prop: 'gridRowEnd',
    config: 'gridRowEnd'
  },
  // https://tailwindcss.com/docs/grid-auto-columns
  'auto-cols': {
    prop: 'gridAutoColumns',
    config: 'gridAutoColumns'
  },
  // https://tailwindcss.com/docs/grid-auto-rows
  'auto-rows': {
    prop: 'gridAutoRows',
    config: 'gridAutoRows'
  },
  // https://tailwindcss.com/docs/gap
  gap: {
    prop: 'gap',
    config: 'gap'
  },
  'gap-x': {
    prop: 'columnGap',
    config: 'gap',
    configFallback: 'spacing'
  },
  'gap-y': {
    prop: 'rowGap',
    config: 'gap',
    configFallback: 'spacing'
  },
  // Deprecated since tailwindcss v1.7.0
  'col-gap': {
    hasArbitrary: false,
    prop: 'columnGap',
    config: 'gap'
  },
  'row-gap': {
    hasArbitrary: false,
    prop: 'rowGap',
    config: 'gap'
  },

  /**
   * ===========================================
   * Spacing
   */
  // https://tailwindcss.com/docs/padding
  pt: {
    prop: 'paddingTop',
    config: 'padding'
  },
  pr: {
    prop: 'paddingRight',
    config: 'padding'
  },
  pb: {
    prop: 'paddingBottom',
    config: 'padding'
  },
  pl: {
    prop: 'paddingLeft',
    config: 'padding'
  },
  px: {
    prop: ['paddingLeft', 'paddingRight'],
    config: 'padding'
  },
  py: {
    prop: ['paddingTop', 'paddingBottom'],
    config: 'padding'
  },
  p: {
    prop: 'padding',
    config: 'padding'
  },
  // https://tailwindcss.com/docs/margin
  mt: {
    prop: 'marginTop',
    config: 'margin'
  },
  mr: {
    prop: 'marginRight',
    config: 'margin'
  },
  mb: {
    prop: 'marginBottom',
    config: 'margin'
  },
  ml: {
    prop: 'marginLeft',
    config: 'margin'
  },
  mx: {
    prop: ['marginLeft', 'marginRight'],
    config: 'margin'
  },
  my: {
    prop: ['marginTop', 'marginBottom'],
    config: 'margin'
  },
  m: {
    prop: 'margin',
    config: 'margin'
  },

  /**
   * ===========================================
   * Sizing
   */
  // https://tailwindcss.com/docs/width
  w: {
    prop: 'width',
    config: 'width'
  },
  // https://tailwindcss.com/docs/min-width
  'min-w': {
    prop: 'minWidth',
    config: 'minWidth'
  },
  // https://tailwindcss.com/docs/max-width
  'max-w': {
    prop: 'maxWidth',
    config: 'maxWidth'
  },
  // https://tailwindcss.com/docs/height
  h: {
    prop: 'height',
    config: 'height'
  },
  // https://tailwindcss.com/docs/min-height
  'min-h': {
    prop: 'minHeight',
    config: 'minHeight'
  },
  // https://tailwindcss.com/docs/max-height
  'max-h': {
    prop: 'maxHeight',
    config: 'maxHeight'
  },

  /**
   * ===========================================
   * Typography
   */
  font: [// https://tailwindcss.com/docs/font-family
  {
    prop: 'fontFamily',
    config: 'fontFamily'
  }, // https://tailwindcss.com/docs/font-weight
  {
    prop: 'fontWeight',
    config: 'fontWeight'
  }],
  // https://tailwindcss.com/docs/font-smoothing
  // https://tailwindcss.com/docs/font-style
  // See staticStyles.js
  // https://tailwindcss.com/docs/letter-spacing
  tracking: {
    prop: 'letterSpacing',
    config: 'letterSpacing'
  },
  // https://tailwindcss.com/docs/line-height
  leading: {
    prop: 'lineHeight',
    config: 'lineHeight'
  },
  // https://tailwindcss.com/docs/list-style-type
  list: {
    prop: 'listStyleType',
    config: 'listStyleType'
  },
  // https://tailwindcss.com/docs/list-style-position
  // See staticStyles.js
  // https://tailwindcss.com/docs/placeholder-opacity
  'placeholder-opacity': {
    plugin: 'placeholder',
    value: function (ref) {
      var value = ref.value;

      return ({
      '::placeholder': {
        '--tw-placeholder-opacity': value
      }
    });
}
  },
  // https://tailwindcss.com/docs/placeholder-color
  placeholder: {
    plugin: 'placeholder',
    value: function (ref) {
      var color = ref.color;

      return ({
      '::placeholder': color({
        property: 'color',
        variable: '--tw-placeholder-opacity',
        useSlashAlpha: false
      })
    });
}
  },
  // https://tailwindcss.com/docs/text-align
  // See staticStyles.js
  // https://tailwindcss.com/docs/text-color
  // https://tailwindcss.com/docs/font-size
  'text-opacity': {
    prop: '--tw-text-opacity',
    config: 'textOpacity',
    configFallback: 'opacity'
  },
  text: {
    value: ['color', 'length'],
    plugin: 'text',
    coerced: {
      color: {
        property: 'color',
        variable: '--tw-text-opacity'
      },
      length: {
        property: 'fontSize'
      }
    }
  },
  // https://tailwindcss.com/docs/text-decoration
  // https://tailwindcss.com/docs/text-transform
  // https://tailwindcss.com/docs/vertical-align
  // https://tailwindcss.com/docs/whitespace
  // https://tailwindcss.com/docs/word-break
  // See staticStyles.js

  /**
   * ===========================================
   * Backgrounds
   */
  // https://tailwindcss.com/docs/background-attachment
  // See staticStyles.js
  // https://tailwindcss.com/docs/background-repeat
  // See staticStyles.js
  // https://tailwindcss.com/docs/background-opacity
  'bg-opacity': {
    prop: '--tw-bg-opacity',
    config: 'backgroundOpacity',
    configFallback: 'opacity'
  },
  // https://tailwindcss.com/docs/gradient-color-stops
  bg: {
    value: ['color'],
    plugin: 'bg',
    coerced: {
      color: {
        property: 'backgroundColor',
        variable: '--tw-bg-opacity',
        useSlashAlpha: false
      },
      lookup: function (value) { return ({
        backgroundImage: value,
        backgroundSize: value,
        backgroundPosition: value
      }); }
    }
  },
  // https://tailwindcss.com/docs/gradient-color-stops
  from: {
    value: function (ref) {
      var value = ref.value;
      var transparentTo = ref.transparentTo;

      return ({
      '--tw-gradient-from': value,
      '--tw-gradient-stops': ("var(--tw-gradient-from), var(--tw-gradient-to, " + (transparentTo(value)) + ")")
    });
},
    plugin: 'gradient'
  },
  via: {
    value: function (ref) {
      var value = ref.value;
      var transparentTo = ref.transparentTo;

      return ({
      '--tw-gradient-stops': ("var(--tw-gradient-from), " + value + ", var(--tw-gradient-to, " + (transparentTo(value)) + ")")
    });
},
    plugin: 'gradient'
  },
  to: {
    prop: '--tw-gradient-to',
    plugin: 'gradient'
  },

  /**
   * ===========================================
   * Borders
   */
  // https://tailwindcss.com/docs/border-style
  // See staticStyles.js
  // https://tailwindcss.com/docs/border-width
  'border-t': {
    value: ['color', 'length'],
    plugin: 'border',
    coerced: {
      color: {
        property: 'borderTopColor',
        variable: '--tw-border-opacity'
      },
      length: {
        property: 'borderTopWidth'
      }
    }
  },
  'border-b': {
    value: ['color', 'length'],
    plugin: 'border',
    coerced: {
      color: {
        property: 'borderBottomColor',
        variable: '--tw-border-opacity'
      },
      length: {
        property: 'borderBottomWidth'
      }
    }
  },
  'border-l': {
    value: ['color', 'length'],
    plugin: 'border',
    coerced: {
      color: {
        property: 'borderLeftColor',
        variable: '--tw-border-opacity'
      },
      length: {
        property: 'borderLeftWidth'
      }
    }
  },
  'border-r': {
    value: ['color', 'length'],
    plugin: 'border',
    coerced: {
      color: {
        property: 'borderRightColor',
        variable: '--tw-border-opacity'
      },
      length: {
        property: 'borderRightWidth'
      }
    }
  },
  'border-opacity': {
    prop: '--tw-border-opacity',
    config: 'borderOpacity',
    configFallback: 'opacity'
  },
  border: {
    value: ['color', 'length'],
    plugin: 'border',
    coerced: {
      color: {
        property: 'borderColor',
        variable: '--tw-border-opacity'
      },
      length: {
        property: 'borderWidth'
      }
    }
  },
  // https://tailwindcss.com/docs/border-radius
  'rounded-tl': {
    prop: 'borderTopLeftRadius',
    config: 'borderRadius'
  },
  'rounded-tr': {
    prop: 'borderTopRightRadius',
    config: 'borderRadius'
  },
  'rounded-br': {
    prop: 'borderBottomRightRadius',
    config: 'borderRadius'
  },
  'rounded-bl': {
    prop: 'borderBottomLeftRadius',
    config: 'borderRadius'
  },
  'rounded-t': {
    prop: ['borderTopLeftRadius', 'borderTopRightRadius'],
    config: 'borderRadius'
  },
  'rounded-r': {
    prop: ['borderTopRightRadius', 'borderBottomRightRadius'],
    config: 'borderRadius'
  },
  'rounded-b': {
    prop: ['borderBottomLeftRadius', 'borderBottomRightRadius'],
    config: 'borderRadius'
  },
  'rounded-l': {
    prop: ['borderTopLeftRadius', 'borderBottomLeftRadius'],
    config: 'borderRadius'
  },
  rounded: {
    prop: 'borderRadius',
    config: 'borderRadius'
  },
  // https://tailwindcss.com/docs/ring-opacity
  'ring-opacity': {
    prop: '--tw-ring-opacity',
    config: 'ringOpacity',
    configFallback: 'opacity'
  },
  // https://tailwindcss.com/docs/ring-offset-width
  // https://tailwindcss.com/docs/ring-offset-color
  'ring-offset': {
    prop: '--tw-ring-offset-width',
    value: ['length', 'color'],
    plugin: 'ringOffset',
    coerced: {
      color: function (value) { return ({
        '--tw-ring-offset-color': value
      }); },
      length: {
        property: '--tw-ring-offset-width'
      }
    }
  },
  // https://tailwindcss.com/docs/ring-width
  // https://tailwindcss.com/docs/ring-color
  ring: {
    plugin: 'ring',
    value: ['color', 'length'],
    coerced: {
      color: {
        property: '--tw-ring-color',
        variable: '--tw-ring-opacity'
      },
      length: function (value) { return ({
        '--tw-ring-offset-shadow': 'var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
        '--tw-ring-shadow': ("var(--tw-ring-inset) 0 0 0 calc(" + value + " + var(--tw-ring-offset-width)) var(--tw-ring-color)"),
        boxShadow: ["var(--tw-ring-offset-shadow)", "var(--tw-ring-shadow)", "var(--tw-shadow, 0 0 #0000)"].join(', ')
      }); }
    }
  },

  /**
   * ===========================================
   * Tables
   */
  // https://tailwindcss.com/docs/border-collapse
  // https://tailwindcss.com/docs/table-layout
  // See staticStyles.js

  /**
   * ===========================================
   * Effects
   */
  // https://tailwindcss.com/docs/box-shadow
  // Note: Tailwind doesn't allow an arbitrary value but it's likely just an accident so it's been added here
  shadow: {
    plugin: 'boxShadow',
    value: ['lookup'],
    coerced: {
      lookup: function (value) { return ({
        '--tw-shadow': value,
        boxShadow: ["var(--tw-ring-offset-shadow, 0 0 #0000)", "var(--tw-ring-shadow, 0 0 #0000)", "var(--tw-shadow)"].join(', ')
      }); }
    }
  },
  // https://tailwindcss.com/docs/opacity
  opacity: {
    prop: 'opacity',
    config: 'opacity'
  },

  /**
   * ===========================================
   * Filters
   */
  // https://tailwindcss.com/docs/filter
  // See staticStyles.js
  // https://tailwindcss.com/docs/blur
  blur: {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-blur': ("blur(" + value + ")"),
      filter: 'var(--tw-filter)'
    });
},
    plugin: 'blur'
  },
  // https://tailwindcss.com/docs/brightness
  brightness: {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-brightness': ("brightness(" + value + ")"),
      filter: 'var(--tw-filter)'
    });
},
    plugin: 'brightness'
  },
  // https://tailwindcss.com/docs/contrast
  contrast: {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-contrast': ("contrast(" + value + ")"),
      filter: 'var(--tw-filter)'
    });
},
    plugin: 'contrast'
  },
  // https://tailwindcss.com/docs/drop-shadow
  'drop-shadow': {
    hasArbitrary: false,
    plugin: 'dropShadow'
  },
  // https://tailwindcss.com/docs/grayscale
  grayscale: {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-grayscale': ("grayscale(" + value + ")"),
      filter: 'var(--tw-filter)'
    });
},
    plugin: 'grayscale'
  },
  // https://tailwindcss.com/docs/hue-rotate
  'hue-rotate': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-hue-rotate': ("hue-rotate(" + value + ")"),
      filter: 'var(--tw-filter)'
    });
},
    plugin: 'hueRotate'
  },
  // https://tailwindcss.com/docs/invert
  invert: {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-invert': ("invert(" + value + ")"),
      filter: 'var(--tw-filter)'
    });
},
    plugin: 'invert'
  },
  // https://tailwindcss.com/docs/saturate
  saturate: {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-saturate': ("saturate(" + value + ")"),
      filter: 'var(--tw-filter)'
    });
},
    plugin: 'saturate'
  },
  // https://tailwindcss.com/docs/sepia
  sepia: {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-sepia': ("sepia(" + value + ")"),
      filter: 'var(--tw-filter)'
    });
},
    plugin: 'sepia'
  },
  // https://tailwindcss.com/docs/backdrop-filter
  // https://tailwindcss.com/docs/backdrop-blur
  'backdrop-blur': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-backdrop-blur': ("blur(" + value + ")"),
      backdropFilter: 'var(--tw-backdrop-filter)'
    });
},
    plugin: 'backdropBlur'
  },
  // https://tailwindcss.com/docs/backdrop-brightness
  'backdrop-brightness': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-backdrop-brightness': ("brightness(" + value + ")"),
      backdropFilter: 'var(--tw-backdrop-filter)'
    });
},
    plugin: 'backdropBrightness'
  },
  // https://tailwindcss.com/docs/backdrop-contrast
  'backdrop-contrast': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-backdrop-contrast': ("contrast(" + value + ")"),
      backdropFilter: 'var(--tw-backdrop-filter)'
    });
},
    plugin: 'backdropContrast'
  },
  // https://tailwindcss.com/docs/backdrop-grayscale
  'backdrop-grayscale': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-backdrop-grayscale': ("grayscale(" + value + ")"),
      backdropFilter: 'var(--tw-backdrop-filter)'
    });
},
    plugin: 'backdropGrayscale'
  },
  // https://tailwindcss.com/docs/backdrop-hue-rotate
  'backdrop-hue-rotate': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-backdrop-hue-rotate': ("hue-rotate(" + value + ")"),
      backdropFilter: 'var(--tw-backdrop-filter)'
    });
},
    plugin: 'backdropHueRotate'
  },
  // https://tailwindcss.com/docs/backdrop-invert
  'backdrop-invert': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-backdrop-invert': ("invert(" + value + ")"),
      backdropFilter: 'var(--tw-backdrop-filter)'
    });
},
    plugin: 'backdropInvert'
  },
  // https://tailwindcss.com/docs/backdrop-opacity
  'backdrop-opacity': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-backdrop-opacity': ("opacity(" + value + ")"),
      backdropFilter: 'var(--tw-backdrop-filter)'
    });
},
    plugin: 'backdropOpacity'
  },
  // https://tailwindcss.com/docs/backdrop-saturate
  'backdrop-saturate': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-backdrop-saturate': ("saturate(" + value + ")"),
      backdropFilter: 'var(--tw-backdrop-filter)'
    });
},
    plugin: 'backdropSaturate'
  },
  // https://tailwindcss.com/docs/backdrop-sepia
  'backdrop-sepia': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-backdrop-sepia': ("sepia(" + value + ")"),
      backdropFilter: 'var(--tw-backdrop-filter)'
    });
},
    plugin: 'backdropSepia'
  },

  /**
   * ===========================================
   * Transitions
   */
  // https://tailwindcss.com/docs/transtiion-property
  // Note: Tailwind doesn't allow an arbitrary value but it's likely just an accident so it's been added here
  transition: {
    plugin: 'transition',
    value: ['lookup'],
    coerced: {
      lookup: function (value, theme) { return ({
        transitionProperty: value,
        transitionTimingFunction: theme('transitionTimingFunction.DEFAULT'),
        transitionDuration: theme('transitionDuration.DEFAULT')
      }); }
    }
  },
  // https://tailwindcss.com/docs/transition-duration
  duration: {
    prop: 'transitionDuration',
    config: 'transitionDuration'
  },
  // https://tailwindcss.com/docs/transition-timing-function
  ease: {
    prop: 'transitionTimingFunction',
    config: 'transitionTimingFunction'
  },
  // https://tailwindcss.com/docs/transition-delay
  delay: {
    prop: 'transitionDelay',
    config: 'transitionDelay'
  },

  /**
   * ===========================================
   * Transforms
   */
  // https://tailwindcss.com/docs/scale
  'scale-x': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-scale-x': value,
      transform: 'var(--tw-transform)'
    });
},
    config: 'scale'
  },
  'scale-y': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-scale-y': value,
      transform: 'var(--tw-transform)'
    });
},
    config: 'scale'
  },
  scale: {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-scale-x': value,
      '--tw-scale-y': value,
      transform: 'var(--tw-transform)'
    });
},
    config: 'scale'
  },
  // https://tailwindcss.com/docs/rotate
  rotate: {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-rotate': value,
      transform: 'var(--tw-transform)'
    });
},
    config: 'rotate'
  },
  // https://tailwindcss.com/docs/translate
  'translate-x': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-translate-x': value,
      transform: 'var(--tw-transform)'
    });
},
    config: 'translate'
  },
  'translate-y': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-translate-y': value,
      transform: 'var(--tw-transform)'
    });
},
    config: 'translate'
  },
  // https://tailwindcss.com/docs/skew
  'skew-x': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-skew-x': value,
      transform: 'var(--tw-transform)'
    });
},
    config: 'skew'
  },
  'skew-y': {
    value: function (ref) {
      var value = ref.value;

      return ({
      '--tw-skew-y': value,
      transform: 'var(--tw-transform)'
    });
},
    config: 'skew'
  },
  // https://tailwindcss.com/docs/transform-origin
  origin: {
    prop: 'transformOrigin',
    config: 'transformOrigin'
  },

  /**
   * ===========================================
   * Interactivity
   */
  // https://tailwindcss.com/docs/appearance
  // See staticStyles.js
  // https://tailwindcss.com/docs/cursor
  cursor: {
    prop: 'cursor',
    config: 'cursor'
  },
  // https://tailwindcss.com/docs/outline
  outline: {
    plugin: 'outline',
    value: function (ref) {
      var value = ref.value;

      return ({
      outline: value,
      outlineOffset: '0'
    });
}
  },
  // https://tailwindcss.com/docs/pointer-events
  // https://tailwindcss.com/docs/resize
  // https://tailwindcss.com/docs/user-select
  // See staticStyles.js

  /**
   * ===========================================
   * Svg
   */
  // https://tailwindcss.com/docs/fill
  fill: {
    prop: 'fill',
    plugin: 'fill'
  },
  // https://tailwindcss.com/docs/stroke
  stroke: {
    prop: 'stroke',
    value: ['length', 'color'],
    plugin: 'stroke',
    coerced: {
      color: function (value) { return ({
        stroke: value
      }); },
      length: {
        property: 'strokeWidth'
      }
    }
  }
  /**
   * ===========================================
   * Accessibility
   */
  // https://tailwindcss.com/docs/screen-readers
  // See staticStyles.js

};

// https://tailwindcss.com/docs/font-variant-numeric
// This feature uses var+comment hacks to get around property stripping:
// https://github.com/tailwindlabs/tailwindcss.com/issues/522#issuecomment-687667238
var fontVariants = {
  '--tw-ordinal': 'var(--tw-empty,/*!*/ /*!*/)',
  '--tw-slashed-zero': 'var(--tw-empty,/*!*/ /*!*/)',
  '--tw-numeric-figure': 'var(--tw-empty,/*!*/ /*!*/)',
  '--tw-numeric-spacing': 'var(--tw-empty,/*!*/ /*!*/)',
  '--tw-numeric-fraction': 'var(--tw-empty,/*!*/ /*!*/)',
  fontVariantNumeric: 'var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction)'
};
var staticStyles = {
  /**
   * ===========================================
   * Layout
   */
  // https://tailwindcss.com/docs/container
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/box-decoration-break
  'decoration-slice': {
    output: {
      boxDecorationBreak: 'slice'
    }
  },
  'decoration-clone': {
    output: {
      boxDecorationBreak: 'clone'
    }
  },
  // https://tailwindcss.com/docs/box-sizing
  'box-border': {
    output: {
      boxSizing: 'border-box'
    }
  },
  'box-content': {
    output: {
      boxSizing: 'content-box'
    }
  },
  // https://tailwindcss.com/docs/display
  hidden: {
    output: {
      display: 'none'
    }
  },
  block: {
    output: {
      display: 'block'
    }
  },
  contents: {
    output: {
      display: 'contents'
    }
  },
  'list-item': {
    output: {
      display: 'list-item'
    }
  },
  'inline-block': {
    output: {
      display: 'inline-block'
    }
  },
  inline: {
    output: {
      display: 'inline'
    }
  },
  'flow-root': {
    output: {
      display: 'flow-root'
    }
  },
  flex: {
    output: {
      display: 'flex'
    }
  },
  'inline-flex': {
    output: {
      display: 'inline-flex'
    }
  },
  grid: {
    output: {
      display: 'grid'
    }
  },
  'inline-grid': {
    output: {
      display: 'inline-grid'
    }
  },
  table: {
    output: {
      display: 'table'
    }
  },
  'inline-table': {
    output: {
      display: 'inline-table'
    }
  },
  'table-caption': {
    output: {
      display: 'table-caption'
    }
  },
  'table-cell': {
    output: {
      display: 'table-cell'
    }
  },
  'table-column': {
    output: {
      display: 'table-column'
    }
  },
  'table-column-group': {
    output: {
      display: 'table-column-group'
    }
  },
  'table-footer-group': {
    output: {
      display: 'table-footer-group'
    }
  },
  'table-header-group': {
    output: {
      display: 'table-header-group'
    }
  },
  'table-row-group': {
    output: {
      display: 'table-row-group'
    }
  },
  'table-row': {
    output: {
      display: 'table-row'
    }
  },
  // https://tailwindcss.com/docs/float
  'float-right': {
    output: {
      float: 'right'
    }
  },
  'float-left': {
    output: {
      float: 'left'
    }
  },
  'float-none': {
    output: {
      float: 'none'
    }
  },
  // https://tailwindcss.com/docs/clear
  'clear-left': {
    output: {
      clear: 'left'
    }
  },
  'clear-right': {
    output: {
      clear: 'right'
    }
  },
  'clear-both': {
    output: {
      clear: 'both'
    }
  },
  'clear-none': {
    output: {
      clear: 'none'
    }
  },
  // https://tailwindcss.com/docs/isolation
  isolate: {
    output: {
      isolation: 'isolate'
    }
  },
  'isolation-auto': {
    output: {
      isolation: 'auto'
    }
  },
  // https://tailwindcss.com/docs/object-fit
  'object-contain': {
    output: {
      objectFit: 'contain'
    }
  },
  'object-cover': {
    output: {
      objectFit: 'cover'
    }
  },
  'object-fill': {
    output: {
      objectFit: 'fill'
    }
  },
  'object-none': {
    output: {
      objectFit: 'none'
    }
  },
  'object-scale-down': {
    output: {
      objectFit: 'scale-down'
    }
  },
  // https://tailwindcss.com/docs/object-position
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/overflow
  'overflow-auto': {
    output: {
      overflow: 'auto'
    },
    config: 'overflow'
  },
  'overflow-hidden': {
    output: {
      overflow: 'hidden'
    },
    config: 'overflow'
  },
  'overflow-visible': {
    output: {
      overflow: 'visible'
    },
    config: 'overflow'
  },
  'overflow-scroll': {
    output: {
      overflow: 'scroll'
    },
    config: 'overflow'
  },
  'overflow-x-auto': {
    output: {
      overflowX: 'auto'
    },
    config: 'overflow'
  },
  'overflow-y-auto': {
    output: {
      overflowY: 'auto'
    },
    config: 'overflow'
  },
  'overflow-x-hidden': {
    output: {
      overflowX: 'hidden'
    },
    config: 'overflow'
  },
  'overflow-y-hidden': {
    output: {
      overflowY: 'hidden'
    },
    config: 'overflow'
  },
  'overflow-x-visible': {
    output: {
      overflowX: 'visible'
    },
    config: 'overflow'
  },
  'overflow-y-visible': {
    output: {
      overflowY: 'visible'
    },
    config: 'overflow'
  },
  'overflow-x-scroll': {
    output: {
      overflowX: 'scroll'
    },
    config: 'overflow'
  },
  'overflow-y-scroll': {
    output: {
      overflowY: 'scroll'
    },
    config: 'overflow'
  },
  // https://tailwindcss.com/docs/position
  static: {
    output: {
      position: 'static'
    }
  },
  fixed: {
    output: {
      position: 'fixed'
    }
  },
  absolute: {
    output: {
      position: 'absolute'
    }
  },
  relative: {
    output: {
      position: 'relative'
    }
  },
  sticky: {
    output: {
      position: 'sticky'
    }
  },
  // https://tailwindcss.com/docs/top-right-bottom-left
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/visibility
  visible: {
    output: {
      visibility: 'visible'
    }
  },
  invisible: {
    output: {
      visibility: 'hidden'
    }
  },
  // https://tailwindcss.com/docs/z-index
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/space
  // See dynamicStyles.js for the rest
  'space-x-reverse': {
    output: {
      '> :not([hidden]) ~ :not([hidden])': {
        '--tw-space-x-reverse': '1'
      }
    }
  },
  'space-y-reverse': {
    output: {
      '> :not([hidden]) ~ :not([hidden])': {
        '--tw-space-y-reverse': '1'
      }
    }
  },
  // https://tailwindcss.com/docs/divide-width
  // See dynamicStyles.js for the rest
  'divide-x-reverse': {
    output: {
      '> :not([hidden]) ~ :not([hidden])': {
        '--tw-divide-x-reverse': '1'
      }
    }
  },
  'divide-y-reverse': {
    output: {
      '> :not([hidden]) ~ :not([hidden])': {
        '--tw-divide-y-reverse': '1'
      }
    }
  },
  // https://tailwindcss.com/docs/divide-style
  'divide-solid': {
    output: {
      '> :not([hidden]) ~ :not([hidden])': {
        borderStyle: 'solid'
      }
    }
  },
  'divide-dashed': {
    output: {
      '> :not([hidden]) ~ :not([hidden])': {
        borderStyle: 'dashed'
      }
    }
  },
  'divide-dotted': {
    output: {
      '> :not([hidden]) ~ :not([hidden])': {
        borderStyle: 'dotted'
      }
    }
  },
  'divide-double': {
    output: {
      '> :not([hidden]) ~ :not([hidden])': {
        borderStyle: 'double'
      }
    }
  },
  'divide-none': {
    output: {
      '> :not([hidden]) ~ :not([hidden])': {
        borderStyle: 'none'
      }
    }
  },

  /**
   * ===========================================
   * Flexbox
   */
  // https://tailwindcss.com/docs/flexbox-direction
  'flex-row': {
    output: {
      flexDirection: 'row'
    }
  },
  'flex-row-reverse': {
    output: {
      flexDirection: 'row-reverse'
    }
  },
  'flex-col': {
    output: {
      flexDirection: 'column'
    }
  },
  'flex-col-reverse': {
    output: {
      flexDirection: 'column-reverse'
    }
  },
  // https://tailwindcss.com/docs/flex-wrap
  'flex-nowrap': {
    output: {
      flexWrap: 'nowrap'
    }
  },
  'flex-wrap': {
    output: {
      flexWrap: 'wrap'
    }
  },
  'flex-wrap-reverse': {
    output: {
      flexWrap: 'wrap-reverse'
    }
  },
  // https://tailwindcss.com/docs/align-items
  'items-stretch': {
    output: {
      alignItems: 'stretch'
    }
  },
  'items-start': {
    output: {
      alignItems: 'flex-start'
    }
  },
  'items-center': {
    output: {
      alignItems: 'center'
    }
  },
  'items-end': {
    output: {
      alignItems: 'flex-end'
    }
  },
  'items-baseline': {
    output: {
      alignItems: 'baseline'
    }
  },
  // https://tailwindcss.com/docs/align-content
  'content-start': {
    output: {
      alignContent: 'flex-start'
    }
  },
  'content-center': {
    output: {
      alignContent: 'center'
    }
  },
  'content-end': {
    output: {
      alignContent: 'flex-end'
    }
  },
  'content-between': {
    output: {
      alignContent: 'space-between'
    }
  },
  'content-around': {
    output: {
      alignContent: 'space-around'
    }
  },
  // https://tailwindcss.com/docs/align-self
  'self-auto': {
    output: {
      alignSelf: 'auto'
    }
  },
  'self-baseline': {
    output: {
      alignSelf: 'baseline'
    }
  },
  'self-start': {
    output: {
      alignSelf: 'flex-start'
    }
  },
  'self-center': {
    output: {
      alignSelf: 'center'
    }
  },
  'self-end': {
    output: {
      alignSelf: 'flex-end'
    }
  },
  'self-stretch': {
    output: {
      alignSelf: 'stretch'
    }
  },
  // https://tailwindcss.com/docs/justify-content
  'justify-start': {
    output: {
      justifyContent: 'flex-start'
    }
  },
  'justify-center': {
    output: {
      justifyContent: 'center'
    }
  },
  'justify-end': {
    output: {
      justifyContent: 'flex-end'
    }
  },
  'justify-between': {
    output: {
      justifyContent: 'space-between'
    }
  },
  'justify-around': {
    output: {
      justifyContent: 'space-around'
    }
  },
  'justify-evenly': {
    output: {
      justifyContent: 'space-evenly'
    }
  },
  // https://tailwindcss.com/docs/flex
  // https://tailwindcss.com/docs/flex-grow
  // https://tailwindcss.com/docs/flex-shrink
  // https://tailwindcss.com/docs/order
  // See dynamicStyles.js

  /**
   * ===========================================
   * Grid
   */
  // https://tailwindcss.com/docs/grid-template-columns
  // https://tailwindcss.com/docs/grid-column
  // https://tailwindcss.com/docs/grid-template-rows
  // https://tailwindcss.com/docs/grid-row
  // https://tailwindcss.com/docs/gap
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/grid-auto-flow
  'grid-flow-row': {
    output: {
      gridAutoFlow: 'row'
    }
  },
  'grid-flow-col': {
    output: {
      gridAutoFlow: 'column'
    }
  },
  'grid-flow-row-dense': {
    output: {
      gridAutoFlow: 'row dense'
    }
  },
  'grid-flow-col-dense': {
    output: {
      gridAutoFlow: 'column dense'
    }
  },
  // https://tailwindcss.com/docs/grid-auto-columns
  // https://tailwindcss.com/docs/grid-auto-rows#app
  // See dynamicStyles.js

  /**
   * ===========================================
   * Spacing
   */
  // https://tailwindcss.com/docs/padding
  // https://tailwindcss.com/docs/margin
  // See dynamicStyles.js

  /**
   * ===========================================
   * Sizing
   */
  // https://tailwindcss.com/docs/width
  // https://tailwindcss.com/docs/min-width
  // https://tailwindcss.com/docs/max-width
  // https://tailwindcss.com/docs/height
  // https://tailwindcss.com/docs/min-height
  // https://tailwindcss.com/docs/max-height
  // See dynamicStyles.js

  /**
   * ===========================================
   * Typography
   */
  // https://tailwindcss.com/docs/font-family
  // https://tailwindcss.com/docs/font-size
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/font-smoothing
  antialiased: {
    output: {
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }
  },
  'subpixel-antialiased': {
    output: {
      WebkitFontSmoothing: 'auto',
      MozOsxFontSmoothing: 'auto'
    }
  },
  // https://tailwindcss.com/docs/font-style
  italic: {
    output: {
      fontStyle: 'italic'
    }
  },
  'not-italic': {
    output: {
      fontStyle: 'normal'
    }
  },
  // https://tailwindcss.com/docs/font-weight
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/font-variant-numeric
  ordinal: {
    output: Object.assign({}, fontVariants,
      {'--tw-ordinal': 'ordinal'})
  },
  'slashed-zero': {
    output: Object.assign({}, fontVariants,
      {'--tw-slashed-zero': 'slashed-zero'})
  },
  'lining-nums': {
    output: Object.assign({}, fontVariants,
      {'--tw-numeric-figure': 'lining-nums'})
  },
  'oldstyle-nums': {
    output: Object.assign({}, fontVariants,
      {'--tw-numeric-figure': 'oldstyle-nums'})
  },
  'proportional-nums': {
    output: Object.assign({}, fontVariants,
      {'--tw-numeric-spacing': 'proportional-nums'})
  },
  'tabular-nums': {
    output: Object.assign({}, fontVariants,
      {'--tw-numeric-spacing': 'tabular-nums'})
  },
  'diagonal-fractions': {
    output: Object.assign({}, fontVariants,
      {'--tw-numeric-fraction': 'diagonal-fractions'})
  },
  'stacked-fractions': {
    output: Object.assign({}, fontVariants,
      {'--tw-numeric-fraction': 'stacked-fractions'})
  },
  'normal-nums': {
    output: {
      fontVariantNumeric: 'normal'
    }
  },
  // https://tailwindcss.com/docs/letter-spacing
  // https://tailwindcss.com/docs/line-height
  // https://tailwindcss.com/docs/list-style-type
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/list-style-position
  'list-inside': {
    output: {
      listStylePosition: 'inside'
    }
  },
  'list-outside': {
    output: {
      listStylePosition: 'outside'
    }
  },
  // https://tailwindcss.com/docs/placeholder-color
  // https://tailwindcss.com/docs/placeholder-opacity
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/text-align
  'text-left': {
    output: {
      textAlign: 'left'
    }
  },
  'text-center': {
    output: {
      textAlign: 'center'
    }
  },
  'text-right': {
    output: {
      textAlign: 'right'
    }
  },
  'text-justify': {
    output: {
      textAlign: 'justify'
    }
  },
  // https://tailwindcss.com/docs/text-color
  // https://tailwindcss.com/docs/text-opacity
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/text-decoration
  underline: {
    output: {
      textDecoration: 'underline'
    }
  },
  'line-through': {
    output: {
      textDecoration: 'line-through'
    }
  },
  'no-underline': {
    output: {
      textDecoration: 'none'
    }
  },
  // https://tailwindcss.com/docs/text-transform
  uppercase: {
    output: {
      textTransform: 'uppercase'
    }
  },
  lowercase: {
    output: {
      textTransform: 'lowercase'
    }
  },
  capitalize: {
    output: {
      textTransform: 'capitalize'
    }
  },
  'normal-case': {
    output: {
      textTransform: 'none'
    }
  },
  // https://tailwindcss.com/docs/vertical-align
  'align-baseline': {
    output: {
      verticalAlign: 'baseline'
    }
  },
  'align-top': {
    output: {
      verticalAlign: 'top'
    }
  },
  'align-middle': {
    output: {
      verticalAlign: 'middle'
    }
  },
  'align-bottom': {
    output: {
      verticalAlign: 'bottom'
    }
  },
  'align-text-top': {
    output: {
      verticalAlign: 'text-top'
    }
  },
  'align-text-bottom': {
    output: {
      verticalAlign: 'text-bottom'
    }
  },
  // https://tailwindcss.com/docs/whitespace
  'whitespace-normal': {
    output: {
      whiteSpace: 'normal'
    }
  },
  'whitespace-nowrap': {
    output: {
      whiteSpace: 'nowrap'
    }
  },
  'whitespace-pre': {
    output: {
      whiteSpace: 'pre'
    }
  },
  'whitespace-pre-line': {
    output: {
      whiteSpace: 'pre-line'
    }
  },
  'whitespace-pre-wrap': {
    output: {
      whiteSpace: 'pre-wrap'
    }
  },
  // https://tailwindcss.com/docs/word-break
  'break-normal': {
    output: {
      wordBreak: 'normal',
      overflowWrap: 'normal'
    },
    config: 'wordbreak'
  },
  'break-words': {
    output: {
      overflowWrap: 'break-word'
    },
    config: 'wordbreak'
  },
  'break-all': {
    output: {
      wordBreak: 'break-all'
    },
    config: 'wordbreak'
  },
  // https://tailwindcss.com/docs/text-overflow
  truncate: {
    output: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  },
  'overflow-ellipsis': {
    output: {
      textOverflow: 'ellipsis'
    }
  },
  'overflow-clip': {
    output: {
      textOverflow: 'clip'
    }
  },

  /**
   * ===========================================
   * Backgrounds
   */
  // https://tailwindcss.com/docs/background-attachment
  'bg-fixed': {
    output: {
      backgroundAttachment: 'fixed'
    }
  },
  'bg-local': {
    output: {
      backgroundAttachment: 'local'
    }
  },
  'bg-scroll': {
    output: {
      backgroundAttachment: 'scroll'
    }
  },
  // https://tailwindcss.com/docs/background-clip
  'bg-clip-border': {
    output: {
      WebkitBackgroundClip: 'border-box',
      backgroundClip: 'border-box'
    }
  },
  'bg-clip-padding': {
    output: {
      WebkitBackgroundClip: 'padding-box',
      backgroundClip: 'padding-box'
    }
  },
  'bg-clip-content': {
    output: {
      WebkitBackgroundClip: 'content-box',
      backgroundClip: 'content-box'
    }
  },
  'bg-clip-text': {
    output: {
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text'
    }
  },
  // https://tailwindcss.com/docs/background-origin
  'bg-origin-border': {
    output: {
      backgroundOrigin: 'border-box'
    }
  },
  'bg-origin-padding': {
    output: {
      backgroundOrigin: 'padding-box'
    }
  },
  'bg-origin-content': {
    output: {
      backgroundOrigin: 'content-box'
    }
  },
  // https://tailwindcss.com/docs/background-color
  // https://tailwindcss.com/docs/background-size
  // https://tailwindcss.com/docs/background-position
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/background-repeat
  'bg-repeat': {
    output: {
      backgroundRepeat: 'repeat'
    }
  },
  'bg-no-repeat': {
    output: {
      backgroundRepeat: 'no-repeat'
    }
  },
  'bg-repeat-x': {
    output: {
      backgroundRepeat: 'repeat-x'
    }
  },
  'bg-repeat-y': {
    output: {
      backgroundRepeat: 'repeat-y'
    }
  },
  'bg-repeat-round': {
    output: {
      backgroundRepeat: 'round'
    }
  },
  'bg-repeat-space': {
    output: {
      backgroundRepeat: 'space'
    }
  },
  // https://tailwindcss.com/docs/background-size
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/gradient-color-stops
  // See dynamicStyles.js

  /**
   * ===========================================
   * Borders
   */
  // https://tailwindcss.com/docs/border-radius
  // https://tailwindcss.com/docs/border-width
  // https://tailwindcss.com/docs/border-color
  // https://tailwindcss.com/docs/border-opacity
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/border-style
  'border-solid': {
    output: {
      borderStyle: 'solid'
    }
  },
  'border-dashed': {
    output: {
      borderStyle: 'dashed'
    }
  },
  'border-dotted': {
    output: {
      borderStyle: 'dotted'
    }
  },
  'border-double': {
    output: {
      borderStyle: 'double'
    }
  },
  'border-none': {
    output: {
      borderStyle: 'none'
    }
  },

  /**
   * ===========================================
   * Effects
   */
  // https://tailwindcss.com/docs/box-shadow/
  // https://tailwindcss.com/docs/opacity
  // See dynamicStyles.js

  /**
   * ===========================================
   * Filters
   */
  // https://tailwindcss.com/docs/filter
  'filter-none': {
    output: {
      filter: 'none'
    }
  },
  filter: {
    output: {
      filter: 'var(--tw-filter)'
    }
  },
  // https://tailwindcss.com/docs/blur
  // https://tailwindcss.com/docs/brightness
  // https://tailwindcss.com/docs/contrast
  // https://tailwindcss.com/docs/drop-shadow
  // https://tailwindcss.com/docs/grayscale
  // https://tailwindcss.com/docs/hue-rotate
  // https://tailwindcss.com/docs/invert
  // https://tailwindcss.com/docs/saturate
  // https://tailwindcss.com/docs/sepia
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/backdrop-filter
  'backdrop-filter-none': {
    output: {
      backdropFilter: 'none'
    }
  },
  'backdrop-filter': {
    output: {
      backdropFilter: 'var(--tw-backdrop-filter)'
    }
  },
  // https://tailwindcss.com/docs/backdrop-blur
  // https://tailwindcss.com/docs/backdrop-brightness
  // https://tailwindcss.com/docs/backdrop-contrast
  // https://tailwindcss.com/docs/backdrop-grayscale
  // https://tailwindcss.com/docs/backdrop-hue-rotate
  // https://tailwindcss.com/docs/backdrop-invert
  // https://tailwindcss.com/docs/backdrop-opacity
  // https://tailwindcss.com/docs/backdrop-saturate
  // https://tailwindcss.com/docs/backdrop-sepia
  // See dynamicStyles.js

  /**
   * ===========================================
   * Tables
   */
  // https://tailwindcss.com/docs/border-collapse
  'border-collapse': {
    output: {
      borderCollapse: 'collapse'
    }
  },
  'border-separate': {
    output: {
      borderCollapse: 'separate'
    }
  },
  // https://tailwindcss.com/docs/table-layout
  'table-auto': {
    output: {
      tableLayout: 'auto'
    }
  },
  'table-fixed': {
    output: {
      tableLayout: 'fixed'
    }
  },

  /**
   * ===========================================
   * Effects
   */
  // https://tailwindcss.com/docs/box-shadow/
  // https://tailwindcss.com/docs/opacity
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/mix-blend-mode
  'mix-blend-normal': {
    output: {
      mixBlendMode: 'normal'
    }
  },
  'mix-blend-multiply': {
    output: {
      mixBlendMode: 'multiply'
    }
  },
  'mix-blend-screen': {
    output: {
      mixBlendMode: 'screen'
    }
  },
  'mix-blend-overlay': {
    output: {
      mixBlendMode: 'overlay'
    }
  },
  'mix-blend-darken': {
    output: {
      mixBlendMode: 'darken'
    }
  },
  'mix-blend-lighten': {
    output: {
      mixBlendMode: 'lighten'
    }
  },
  'mix-blend-color-dodge': {
    output: {
      mixBlendMode: 'color-dodge'
    }
  },
  'mix-blend-color-burn': {
    output: {
      mixBlendMode: 'color-burn'
    }
  },
  'mix-blend-hard-light': {
    output: {
      mixBlendMode: 'hard-light'
    }
  },
  'mix-blend-soft-light': {
    output: {
      mixBlendMode: 'soft-light'
    }
  },
  'mix-blend-difference': {
    output: {
      mixBlendMode: 'difference'
    }
  },
  'mix-blend-exclusion': {
    output: {
      mixBlendMode: 'exclusion'
    }
  },
  'mix-blend-hue': {
    output: {
      mixBlendMode: 'hue'
    }
  },
  'mix-blend-saturation': {
    output: {
      mixBlendMode: 'saturation'
    }
  },
  'mix-blend-color': {
    output: {
      mixBlendMode: 'color'
    }
  },
  'mix-blend-luminosity': {
    output: {
      mixBlendMode: 'luminosity'
    }
  },
  // https://tailwindcss.com/docs/background-blend-mode
  'bg-blend-normal': {
    output: {
      backgroundBlendMode: 'normal'
    }
  },
  'bg-blend-multiply': {
    output: {
      backgroundBlendMode: 'multiply'
    }
  },
  'bg-blend-screen': {
    output: {
      backgroundBlendMode: 'screen'
    }
  },
  'bg-blend-overlay': {
    output: {
      backgroundBlendMode: 'overlay'
    }
  },
  'bg-blend-darken': {
    output: {
      backgroundBlendMode: 'darken'
    }
  },
  'bg-blend-lighten': {
    output: {
      backgroundBlendMode: 'lighten'
    }
  },
  'bg-blend-color-dodge': {
    output: {
      backgroundBlendMode: 'color-dodge'
    }
  },
  'bg-blend-color-burn': {
    output: {
      backgroundBlendMode: 'color-burn'
    }
  },
  'bg-blend-hard-light': {
    output: {
      backgroundBlendMode: 'hard-light'
    }
  },
  'bg-blend-soft-light': {
    output: {
      backgroundBlendMode: 'soft-light'
    }
  },
  'bg-blend-difference': {
    output: {
      backgroundBlendMode: 'difference'
    }
  },
  'bg-blend-exclusion': {
    output: {
      backgroundBlendMode: 'exclusion'
    }
  },
  'bg-blend-hue': {
    output: {
      backgroundBlendMode: 'hue'
    }
  },
  'bg-blend-saturation': {
    output: {
      backgroundBlendMode: 'saturation'
    }
  },
  'bg-blend-color': {
    output: {
      backgroundBlendMode: 'color'
    }
  },
  'bg-blend-luminosity': {
    output: {
      backgroundBlendMode: 'luminosity'
    }
  },

  /**
   * ===========================================
   * Transitions
   */
  // https://tailwindcss.com/docs/transition-property
  // https://tailwindcss.com/docs/transition-duration
  // https://tailwindcss.com/docs/transition-timing-function
  // See dynamicStyles.js

  /**
   * ===========================================
   * Transforms
   */
  // https://tailwindcss.com/docs/scale
  // https://tailwindcss.com/docs/rotate
  // https://tailwindcss.com/docs/translate
  // https://tailwindcss.com/docs/skew
  // https://tailwindcss.com/docs/transform-origin
  // See dynamicStyles.js

  /**
   * ===========================================
   * Interactivity
   */
  // https://tailwindcss.com/docs/appearance
  'appearance-none': {
    output: {
      appearance: 'none'
    }
  },
  // https://tailwindcss.com/docs/cursor
  // https://tailwindcss.com/docs/outline
  // See dynamicStyles.js
  // https://tailwindcss.com/docs/pointer-events
  'pointer-events-none': {
    output: {
      pointerEvents: 'none'
    }
  },
  'pointer-events-auto': {
    output: {
      pointerEvents: 'auto'
    }
  },
  // https://tailwindcss.com/docs/resize
  'resize-none': {
    output: {
      resize: 'none'
    }
  },
  'resize-y': {
    output: {
      resize: 'vertical'
    }
  },
  'resize-x': {
    output: {
      resize: 'horizontal'
    }
  },
  resize: {
    output: {
      resize: 'both'
    }
  },
  // https://tailwindcss.com/docs/user-select
  'select-none': {
    output: {
      userSelect: 'none'
    }
  },
  'select-text': {
    output: {
      userSelect: 'text'
    }
  },
  'select-all': {
    output: {
      userSelect: 'all'
    }
  },
  'select-auto': {
    output: {
      userSelect: 'auto'
    }
  },

  /**
   * ===========================================
   * Svg
   */
  // https://tailwindcss.com/docs/fill
  // https://tailwindcss.com/docs/stroke
  // https://tailwindcss.com/docs/stroke
  // See dynamicStyles.js

  /**
   * ===========================================
   * Accessibility
   */
  // https://tailwindcss.com/docs/screen-readers
  'sr-only': {
    output: {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: '0'
    },
    config: 'accessibility'
  },
  'not-sr-only': {
    output: {
      position: 'static',
      width: 'auto',
      height: 'auto',
      padding: '0',
      margin: '0',
      overflow: 'visible',
      clip: 'auto',
      whiteSpace: 'normal'
    },
    config: 'accessibility'
  },
  // Overscroll
  'overscroll-auto': {
    output: {
      overscrollBehavior: 'auto'
    }
  },
  'overscroll-contain': {
    output: {
      overscrollBehavior: 'contain'
    }
  },
  'overscroll-none': {
    output: {
      overscrollBehavior: 'none'
    }
  },
  'overscroll-y-auto': {
    output: {
      overscrollBehaviorY: 'auto'
    }
  },
  'overscroll-y-contain': {
    output: {
      overscrollBehaviorY: 'contain'
    }
  },
  'overscroll-y-none': {
    output: {
      overscrollBehaviorY: 'none'
    }
  },
  'overscroll-x-auto': {
    output: {
      overscrollBehaviorX: 'auto'
    }
  },
  'overscroll-x-contain': {
    output: {
      overscrollBehaviorX: 'contain'
    }
  },
  'overscroll-x-none': {
    output: {
      overscrollBehaviorX: 'none'
    }
  },
  // Grid alignment utilities
  // https://github.com/tailwindlabs/tailwindcss/pull/2306
  'justify-items-auto': {
    output: {
      justifyItems: 'auto'
    }
  },
  'justify-items-start': {
    output: {
      justifyItems: 'start'
    }
  },
  'justify-items-end': {
    output: {
      justifyItems: 'end'
    }
  },
  'justify-items-center': {
    output: {
      justifyItems: 'center'
    }
  },
  'justify-items-stretch': {
    output: {
      justifyItems: 'stretch'
    }
  },
  'justify-self-auto': {
    output: {
      justifySelf: 'auto'
    }
  },
  'justify-self-start': {
    output: {
      justifySelf: 'start'
    }
  },
  'justify-self-end': {
    output: {
      justifySelf: 'end'
    }
  },
  'justify-self-center': {
    output: {
      justifySelf: 'center'
    }
  },
  'justify-self-stretch': {
    output: {
      justifySelf: 'stretch'
    }
  },
  'place-content-center': {
    output: {
      placeContent: 'center'
    }
  },
  'place-content-start': {
    output: {
      placeContent: 'start'
    }
  },
  'place-content-end': {
    output: {
      placeContent: 'end'
    }
  },
  'place-content-between': {
    output: {
      placeContent: 'space-between'
    }
  },
  'place-content-around': {
    output: {
      placeContent: 'space-around'
    }
  },
  'place-content-evenly': {
    output: {
      placeContent: 'space-evenly'
    }
  },
  'place-content-stretch': {
    output: {
      placeContent: 'stretch'
    }
  },
  'place-items-auto': {
    output: {
      placeItems: 'auto'
    }
  },
  'place-items-start': {
    output: {
      placeItems: 'start'
    }
  },
  'place-items-end': {
    output: {
      placeItems: 'end'
    }
  },
  'place-items-center': {
    output: {
      placeItems: 'center'
    }
  },
  'place-items-stretch': {
    output: {
      placeItems: 'stretch'
    }
  },
  'place-self-auto': {
    output: {
      placeSelf: 'auto'
    }
  },
  'place-self-start': {
    output: {
      placeSelf: 'start'
    }
  },
  'place-self-end': {
    output: {
      placeSelf: 'end'
    }
  },
  'place-self-center': {
    output: {
      placeSelf: 'center'
    }
  },
  'place-self-stretch': {
    output: {
      placeSelf: 'stretch'
    }
  },

  /**
   * ===========================================
   * Special classes
   */
  transform: {
    output: {
      transform: 'var(--tw-transform)'
    }
  },
  'transform-gpu': {
    output: {
      '--tw-transform': 'translate3d(var(--tw-translate-x), var(--tw-translate-y), 0) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))'
    }
  },
  'transform-cpu': {
    output: {
      '--tw-transform': 'translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))'
    }
  },
  'transform-none': {
    output: {
      transform: 'none'
    }
  },

  /**
   * ===========================================
   * Extras
   * Extra styles that aren't part of Tailwind
   */
  content: {
    output: {
      content: '""'
    }
  }
};

/**
 * Pseudo-classes (Variants)
 * In Twin, these are always available on just about any class
 *
 * See MDN web docs for more information
 * https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
 */
var variantConfig = function (ref) {
  var variantDarkMode = ref.variantDarkMode;
  var variantLightMode = ref.variantLightMode;
  var prefixDarkLightModeClass = ref.prefixDarkLightModeClass;
  var createPeer = ref.createPeer;

  return ({
  // Before/after pseudo elements
  // Usage: tw`before:(block w-10 h-10 bg-black)`
  before: ':before',
  after: ':after',
  // Interactive links/buttons
  hover: ':hover',
  focus: ':focus',
  active: ':active',
  visited: ':visited',
  hocus: ':hover, :focus',
  link: ':link',
  target: ':target',
  'focus-visible': ':focus-visible',
  'focus-within': ':focus-within',
  // Form element states
  autofill: ':autofill',
  disabled: ':disabled',
  checked: ':checked',
  'not-checked': ':not(:checked)',
  default: ':default',
  enabled: ':enabled',
  indeterminate: ':indeterminate',
  'in-range': ':in-range',
  invalid: ':invalid',
  valid: ':valid',
  optional: ':optional',
  'out-of-range': ':out-of-range',
  required: ':required',
  'placeholder-shown': ':placeholder-shown',
  placeholder: '::placeholder',
  'read-only': ':read-only',
  'read-write': ':read-write',
  // Child selectors
  'not-disabled': ':not(:disabled)',
  'first-of-type': ':first-of-type',
  'not-first-of-type': ':not(:first-of-type)',
  'last-of-type': ':last-of-type',
  'not-last-of-type': ':not(:last-of-type)',
  'first-letter': '::first-letter',
  'first-line': '::first-line',
  first: ':first-child',
  'not-first': ':not(:first-child)',
  last: ':last-child',
  'not-last': ':not(:last-child)',
  only: ':only-child',
  'not-only': ':not(:only-child)',
  'only-of-type': ':only-of-type',
  'not-only-of-type': ':not(:only-of-type)',
  even: ':nth-child(even)',
  odd: ':nth-child(odd)',
  'even-of-type': ':nth-of-type(even)',
  'odd-of-type': ':nth-of-type(odd)',
  svg: 'svg',
  all: '*',
  'all-child': '> *',
  sibling: '~ *',
  // Content
  empty: ':empty',
  // Group states
  // You'll need to add className="group" to an ancestor to make these work
  // https://github.com/ben-rogerson/twin.macro/blob/master/docs/group.md
  'group-hocus': function (variantData) { return prefixDarkLightModeClass('.group:hover &, .group:focus &', variantData); },
  'group-first': function (variantData) { return prefixDarkLightModeClass('.group:first-child &', variantData); },
  'group-last': function (variantData) { return prefixDarkLightModeClass('.group:last-child &', variantData); },
  'group-only': function (variantData) { return prefixDarkLightModeClass('.group:only-child &', variantData); },
  'group-even': function (variantData) { return prefixDarkLightModeClass('.group:nth-child(even) &', variantData); },
  'group-odd': function (variantData) { return prefixDarkLightModeClass('.group:nth-child(odd) &', variantData); },
  'group-first-of-type': function (variantData) { return prefixDarkLightModeClass('.group:first-of-type &', variantData); },
  'group-last-of-type': function (variantData) { return prefixDarkLightModeClass('.group:last-of-type &', variantData); },
  'group-only-of-type': function (variantData) { return prefixDarkLightModeClass('.group:not(:first-of-type) &', variantData); },
  'group-hover': function (variantData) { return prefixDarkLightModeClass('.group:hover &', variantData); },
  'group-focus': function (variantData) { return prefixDarkLightModeClass('.group:focus &', variantData); },
  'group-disabled': function (variantData) { return prefixDarkLightModeClass('.group:disabled &', variantData); },
  'group-active': function (variantData) { return prefixDarkLightModeClass('.group:active &', variantData); },
  'group-target': function (variantData) { return prefixDarkLightModeClass('.group:target &', variantData); },
  'group-visited': function (variantData) { return prefixDarkLightModeClass('.group:visited &', variantData); },
  'group-default': function (variantData) { return prefixDarkLightModeClass('.group:default &', variantData); },
  'group-checked': function (variantData) { return prefixDarkLightModeClass('.group:checked &', variantData); },
  'group-indeterminate': function (variantData) { return prefixDarkLightModeClass('.group:indeterminate &', variantData); },
  'group-placeholder-shown': function (variantData) { return prefixDarkLightModeClass('.group:placeholder-shown &', variantData); },
  'group-autofill': function (variantData) { return prefixDarkLightModeClass('.group:autofill &', variantData); },
  'group-focus-within': function (variantData) { return prefixDarkLightModeClass('.group:focus-within &', variantData); },
  'group-focus-visible': function (variantData) { return prefixDarkLightModeClass('.group:focus-visible &', variantData); },
  'group-required': function (variantData) { return prefixDarkLightModeClass('.group:required &', variantData); },
  'group-valid': function (variantData) { return prefixDarkLightModeClass('.group:valid &', variantData); },
  'group-invalid': function (variantData) { return prefixDarkLightModeClass('.group:invalid &', variantData); },
  'group-in-range': function (variantData) { return prefixDarkLightModeClass('.group:in-range &', variantData); },
  'group-out-of-range': function (variantData) { return prefixDarkLightModeClass('.group:out-of-range &', variantData); },
  'group-read-only': function (variantData) { return prefixDarkLightModeClass('.group:read-only &', variantData); },
  'group-empty': function (variantData) { return prefixDarkLightModeClass('.group:empty &', variantData); },
  // Media types
  print: '@media print',
  screen: '@media screen',
  // Direction variants
  rtl: '[dir="rtl"] &',
  ltr: '[dir="ltr"] &',
  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
  'motion-safe': '@media (prefers-reduced-motion: no-preference)',
  'motion-reduce': '@media (prefers-reduced-motion: reduce)',
  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/any-pointer
  'any-pointer-none': '@media (any-pointer: none)',
  'any-pointer-fine': '@media (any-pointer: fine)',
  'any-pointer-coarse': '@media (any-pointer: coarse)',
  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer
  'pointer-none': '@media (pointer: none)',
  'pointer-fine': '@media (pointer: fine)',
  'pointer-coarse': '@media (pointer: coarse)',
  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/any-hover
  'any-hover-none': '@media (any-hover: none)',
  'any-hover': '@media (any-hover: hover)',
  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover
  'can-hover': '@media (hover: hover)',
  'cant-hover': '@media (hover: none)',
  // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/orientation
  landscape: '@media (orientation: landscape)',
  portrait: '@media (orientation: portrait)',
  // Dark mode / Light mode
  dark: variantDarkMode,
  light: variantLightMode,
  // Peer variants
  'peer-first': createPeer('first-child'),
  'peer-last': createPeer('last-child'),
  'peer-only': createPeer('only-child'),
  'peer-even': createPeer('nth-child(even)'),
  'peer-odd': createPeer('nth-child(odd)'),
  'peer-first-of-type': createPeer('first-of-type'),
  'peer-last-of-type': createPeer('last-of-type'),
  'peer-only-of-type': createPeer('only-of-type'),
  'peer-hover': createPeer('hover'),
  'peer-focus': createPeer('focus'),
  'peer-disabled': createPeer('disabled'),
  'peer-active': createPeer('active'),
  'peer-target': createPeer('target'),
  'peer-visited': createPeer('visited'),
  'peer-default': createPeer('default'),
  'peer-checked': createPeer('checked'),
  'peer-indeterminate': createPeer('indeterminate'),
  'peer-placeholder-shown': createPeer('placeholder-shown'),
  'peer-autofill': createPeer('autofill'),
  'peer-focus-within': createPeer('focus-within'),
  'peer-focus-visible': createPeer('focus-visible'),
  'peer-required': createPeer('required'),
  'peer-valid': createPeer('valid'),
  'peer-invalid': createPeer('invalid'),
  'peer-in-range': createPeer('in-range'),
  'peer-out-of-range': createPeer('out-of-range'),
  'peer-read-only': createPeer('read-only'),
  'peer-empty': createPeer('empty'),
  // Selection
  selection: '::selection',
  // Lists
  marker: '::marker, *::marker'
});
};

function objectWithoutProperties (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }

var getCustomSuggestions = function (className) {
  var suggestions = {
    'flex-center': 'items-center / justify-center',
    'display-none': 'hidden',
    'display-inline': 'inline-block',
    'display-flex': 'flex',
    'border-radius': 'rounded',
    'flex-column': 'flex-col',
    'flex-column-reverse': 'flex-col-reverse',
    'text-italic': 'italic',
    'text-normal': 'font-normal / not-italic',
    ellipsis: 'overflow-ellipsis',
    'flex-no-wrap': 'flex-nowrap'
  }[className];
  if (suggestions) { return suggestions; }
};

var flattenObject = function (object, prefix) {
  if ( prefix === void 0 ) prefix = '';

  return Object.keys(object).reduce(function (result, k) {
  var pre = prefix.length > 0 ? prefix + '-' : '';
  var value = object[k];
  var fullKey = pre + k;

  if (Array.isArray(value)) {
    result[fullKey] = value;
  } else if (typeof value === 'object') {
    Object.assign(result, flattenObject(value, fullKey));
  } else {
    result[fullKey] = value;
  }

  return result;
}, {});
};

var targetTransforms = [function (ref) {
  var target = ref.target;

  return target === 'DEFAULT' ? '' : target;
}, function (ref) {
  var dynamicKey = ref.dynamicKey;
  var target = ref.target;

  var prefix = target !== stripNegative(target) ? '-' : '';
  return ("" + prefix + ([dynamicKey, stripNegative(target)].filter(Boolean).join('-')));
}];

var filterKeys = function (object, negativesOnly) { return Object.entries(object).reduce(function (result, ref) {
  var obj;

  var k = ref[0];
  var v = ref[1];
  return (Object.assign({}, result,
  ((negativesOnly ? k.startsWith('-') : !k.startsWith('-')) && ( obj = {}, obj[k.replace('-DEFAULT', '')] = v, obj ))));
  }, {}); };

var normalizeDynamicConfig = function (ref) {
  var config = ref.config;
  var input = ref.input;
  var dynamicKey = ref.dynamicKey;
  var hasNegative = ref.hasNegative;

  var results = Object.entries(filterKeys(flattenObject(config), hasNegative)).map(function (ref) {
    var target = ref[0];
    var value = ref[1];

    return (Object.assign({}, (input && {
      rating: stringSimilarity.compareTwoStrings(("-" + target), input)
    }),
    {target: targetTransforms.reduce(function (result, transformer) { return transformer({
      dynamicKey: dynamicKey,
      target: result
    }); }, target),
    value: JSON.stringify(value)}));
  });
  var filteredResults = results.filter(function (item) { return !item.target.includes('-array-') && (input.rating ? typeof item.rating !== 'undefined' : true); });
  return filteredResults;
};

var matchConfig = function (ref) {
  var config = ref.config;
  var theme = ref.theme;
  var className = ref.className;
  var rest$1 = objectWithoutProperties( ref, ["config", "theme", "className"] );
  var rest = rest$1;

  return [].concat( config ).reduce(function (results, item) { return results.concat(normalizeDynamicConfig(Object.assign({}, {config: theme(item),
  input: className},
  rest))); }, []).sort(function (a, b) { return b.rating - a.rating; });
};

var getConfig = function (properties) { return matchConfig(Object.assign({}, properties,
  {className: null})).slice(0, 20); };

var getSuggestions = function (ref) {
  var ref_pieces = ref.pieces;
  var className = ref_pieces.className;
  var hasNegative = ref_pieces.hasNegative;
  var state = ref.state;
  var config = ref.config;
  var dynamicKey = ref.dynamicKey;

  var customSuggestions = getCustomSuggestions(className);
  if (customSuggestions) { return customSuggestions; }

  if (config) {
    var theme = getTheme(state.config.theme);
    var properties = {
      config: config,
      theme: theme,
      dynamicKey: dynamicKey,
      className: className,
      hasNegative: hasNegative
    };
    var dynamicMatches = matchConfig(properties);
    if (dynamicMatches.length === 0) { return getConfig(properties); } // Check if the user means to select a default class

    var defaultFound = dynamicMatches.find(function (match) { return match.target.endsWith('-default') && match.target.replace('-default', '') === className; });
    if (defaultFound) { return defaultFound.target; } // If there's a high rated suggestion then return it

    var trumpMatches = dynamicMatches.filter(function (match) { return match.rating >= 0.5; });
    if (!isEmpty(trumpMatches)) { return trumpMatches; }
    return dynamicMatches;
  } // Static or unmatched className


  var staticClassNames = Object.keys(staticStyles);
  var dynamicClassMatches = Object.entries(dynamicStyles).map(function (ref) {
    var k = ref[0];
    var v = ref[1];

    return typeof v === 'object' ? v.default ? [k, v].join('-') : (k + "-...") : null;
  }).filter(Boolean);
  var matches = stringSimilarity.findBestMatch(className, staticClassNames.concat( dynamicClassMatches)).ratings.filter(function (item) { return item.rating > 0.25; });
  var hasNoMatches = matches.every(function (match) { return match.rating === 0; });
  if (hasNoMatches) { return []; }
  var sortedMatches = matches.sort(function (a, b) { return b.rating - a.rating; });
  var trumpMatch = sortedMatches.find(function (match) { return match.rating >= 0.6; });
  if (trumpMatch) { return trumpMatch.target; }
  return sortedMatches.slice(0, 6);
};

var SPACE_ID = '__SPACE_ID__';

var color = {
  error: chalk.hex('#ff8383'),
  errorLight: chalk.hex('#ffd3d3'),
  success: chalk.greenBright,
  highlight: chalk.yellowBright,
  highlight2: chalk.blue,
  subdued: chalk.hex('#999')
};

var spaced = function (string) { return ("\n\n" + string + "\n"); };

var warning = function (string) { return color.error(("✕ " + string)); };

var inOutPlugins = function (input, output) { return ((color.highlight2('→')) + " " + input + " " + (color.highlight2(JSON.stringify(output)))); };

var inOut = function (input, output) { return ((color.success('✓')) + " " + input + " " + (color.success(JSON.stringify(output)))); };

var logNoVariant = function (variant, validVariants) { return spaced(((warning(("The variant “" + variant + ":” was not found"))) + "\n\n" + (Object.entries(validVariants).map(function (ref) {
  var k = ref[0];
  var v = ref[1];

  return (k + "\n" + (v.map(function (item, index) { return ("" + (v.length > 6 && index % 6 === 0 && index > 0 ? '\n' : '') + (color.highlight(item)) + ":"); }).join(color.subdued(' / '))));
  }).join('\n\n')) + "\n\nRead more at https://twinredirect.page.link/variantList")); };

var logNotAllowed = function (ref) {
  var className = ref.className;
  var error = ref.error;

  return spaced(warning(((color.errorLight(("" + className))) + " " + error)));
};

var logBadGood = function (bad, good) { return good ? spaced(((color.error('✕ Bad:')) + " " + bad + "\n" + (color.success('✓ Good:')) + " " + good)) : logGeneralError(bad); };

var logErrorFix = function (error, good) { return ((color.error(error)) + "\n" + (color.success('Fix:')) + " " + good); };

var logGeneralError = function (error) { return spaced(warning(error)); };

var debug = function (className, log) { return console.log(inOut(className, log)); };

var formatPluginKey = function (key) { return key.replace(/(\\|(}}))/g, '').replace(/{{/g, '.'); };

var debugPlugins = function (processedPlugins) {
  console.log(Object.entries(processedPlugins).map(function (ref) {
    var group = ref[1];

    return Object.entries(group).map(function (ref) {
    var className = ref[0];
    var styles = ref[1];

    return inOutPlugins(formatPluginKey(className), styles);
    }).join('\n');
  }).join("\n"));
};

var formatSuggestions = function (suggestions, lineLength, maxLineLength) {
  if ( lineLength === void 0 ) lineLength = 0;
  if ( maxLineLength === void 0 ) maxLineLength = 60;

  return suggestions.map(function (s, index) {
  lineLength = lineLength + ("" + (s.target) + (s.value)).length;
  var divider = lineLength > maxLineLength ? '\n' : index !== suggestions.length - 1 ? color.subdued(' / ') : '';
  if (lineLength > maxLineLength) { lineLength = 0; }
  return ("" + (color.highlight(s.target)) + (s.value ? color.subdued((" [" + (s.value) + "]")) : '') + divider);
}).join('');
};

var logNoClass = function (properties) {
  var classNameRawNoVariants = properties.pieces.classNameRawNoVariants;
  var text = warning(((classNameRawNoVariants ? color.errorLight(classNameRawNoVariants.replace(new RegExp(SPACE_ID, 'g'), ' ')) : 'Class') + " was not found"));
  return text;
};

var logDeeplyNestedClass = function (properties) {
  var classNameRawNoVariants = properties.pieces.classNameRawNoVariants;
  var text = warning(((classNameRawNoVariants ? color.errorLight(classNameRawNoVariants) : 'Class') + " is too deeply nested in your tailwind.config.js"));
  return text;
};

var checkDarkLightClasses = function (className) { return throwIf(['dark', 'light'].includes(className), function () { return ("\n\n\"" + className + "\" must be added as className:" + (logBadGood(("tw`" + className + "`"), ("<div className=\"" + className + "\">"))) + "\nRead more at https://twinredirect.page.link/darkLightMode\n"); }); };

var errorSuggestions = function (properties) {
  var properties_state = properties.state;
  var hasSuggestions = properties_state.configTwin.hasSuggestions;
  var prefix = properties_state.config.prefix;
  var className = properties.pieces.className;
  var isCsOnly = properties.isCsOnly;
  if (isCsOnly) { return spaced(((color.highlight(className)) + " isn’t valid “short css”.\n\nThe syntax is like this: max-width[100vw]\nRead more at https://twinredirect.page.link/cs-classes")); }
  checkDarkLightClasses(className);
  var textNotFound = logNoClass(properties);
  if (!hasSuggestions) { return spaced(textNotFound); }
  var suggestions = getSuggestions(properties);
  if (suggestions.length === 0) { return spaced(textNotFound); }

  if (typeof suggestions === 'string') {
    if (suggestions === className) {
      return spaced(logDeeplyNestedClass(properties));
    } // Provide a suggestion for the default key update


    if (suggestions.endsWith('-default')) {
      return spaced((textNotFound + "\n\n" + (color.highlight(("To fix this, rename the 'default' key to 'DEFAULT' in your tailwind config or use the class '" + className + "-default'"))) + "\nRead more at https://twinredirect.page.link/default-to-DEFAULT"));
    }

    return spaced((textNotFound + "\n\nDid you mean " + (color.highlight([prefix, suggestions].filter(Boolean).join(''))) + "?"));
  }

  var suggestionText = suggestions.length === 1 ? ("Did you mean " + (color.highlight([prefix, suggestions.shift().target].filter(Boolean).join(''))) + "?") : ("Try one of these classes:\n" + (formatSuggestions(suggestions)));
  return spaced((textNotFound + "\n\n" + suggestionText));
};

var themeErrorNotFound = function (ref) {
  var theme = ref.theme;
  var input = ref.input;
  var trimInput = ref.trimInput;

  if (typeof theme === 'string') {
    return logBadGood(input, trimInput);
  }

  var textNotFound = warning(((color.errorLight(input)) + " was not found in your theme"));

  if (!theme) {
    return spaced(textNotFound);
  }

  var suggestionText = "Try one of these values:\n" + (formatSuggestions(Object.entries(theme).map(function (ref) {
    var k = ref[0];
    var v = ref[1];

    return ({
    target: k.includes && k.includes('.') ? ("[" + k + "]") : k,
    value: typeof v === 'string' ? v : '...'
  });
  })));
  return spaced((textNotFound + "\n\n" + suggestionText));
};

var opacityErrorNotFound = function (ref) {
  var className = ref.className;
  var opacity = ref.opacity;
  var theme = ref.theme;

  var textNotFound = warning(("The opacity " + (color.errorLight(opacity)) + " was not found in your tailwind config"));
  var suggestionText = "Try one of these values:\n" + (formatSuggestions(Object.entries(theme).map(function (ref) {
    var k = ref[0];
    var v = ref[1];

    return ({
    target: [className, k].join('/'),
    value: typeof v === 'string' ? v : '...'
  });
  })));
  return spaced((textNotFound + "\n\n" + suggestionText));
};

var logNotFoundVariant = function (ref) {
  var classNameRaw = ref.classNameRaw;

  return logBadGood(("" + classNameRaw), [(classNameRaw + "flex"), (classNameRaw + "(flex bg-black)")].join(color.subdued(' / ')));
};

var logNotFoundClass = logGeneralError('That class was not found');
var logStylePropertyError = spaced(logErrorFix('Styles shouldn’t be added within a `style={...}` prop', 'Use the tw or css prop instead: <div tw="" /> or <div css={tw``} />\n\nDisable this error by adding this in your twin config: `{ "allowStyleProp": true }`\nRead more at https://twinredirect.page.link/style-prop'));

var SPREAD_ID = '__spread__';
var COMPUTED_ID = '__computed__';

function addImport(ref) {
  var t = ref.types;
  var program = ref.program;
  var mod = ref.mod;
  var name = ref.name;
  var identifier = ref.identifier;

  var importName = name === 'default' ? [t.importDefaultSpecifier(identifier)] : name ? [t.importSpecifier(identifier, t.identifier(name))] : [];
  program.unshiftContainer('body', t.importDeclaration(importName, t.stringLiteral(mod)));
}

function objectExpressionElements(literal, t, spreadType) {
  return Object.keys(literal).filter(function (k) {
    return typeof literal[k] !== 'undefined';
  }).map(function (k) {
    if (k.startsWith(SPREAD_ID)) {
      return t[spreadType](babylon.parseExpression(literal[k]));
    }

    var computed = k.startsWith(COMPUTED_ID);
    var key = computed ? babylon.parseExpression(k.slice(12)) : t.stringLiteral(k);
    return t.objectProperty(key, astify(literal[k], t), computed);
  });
}
/**
 * Convert plain js into babel ast
 */


function astify(literal, t) {
  if (literal === null) {
    return t.nullLiteral();
  }

  switch (typeof literal) {
    case 'function':
      return t.unaryExpression('void', t.numericLiteral(0), true);

    case 'number':
      return t.numericLiteral(literal);

    case 'boolean':
      return t.booleanLiteral(literal);

    case 'undefined':
      return t.unaryExpression('void', t.numericLiteral(0), true);

    case 'string':
      if (literal.startsWith(COMPUTED_ID)) {
        return babylon.parseExpression(literal.slice(COMPUTED_ID.length));
      }

      return t.stringLiteral(literal);

    default:
      // Assuming literal is an object
      if (Array.isArray(literal)) {
        return t.arrayExpression(literal.map(function (x) { return astify(x, t); }));
      }

      try {
        return t.objectExpression(objectExpressionElements(literal, t, 'spreadElement'));
      } catch (_) {
        return t.objectExpression(objectExpressionElements(literal, t, 'spreadProperty'));
      }

  }
}

var setStyledIdentifier = function (ref) {
  var state = ref.state;
  var path$$1 = ref.path;
  var styledImport = ref.styledImport;

  var importFromStitches = state.isStitches && styledImport.from.includes(path$$1.node.source.value);
  var importFromLibrary = path$$1.node.source.value === styledImport.from;
  if (!importFromLibrary && !importFromStitches) { return; } // Look for an existing import that matches the config,
  // if found then reuse it for the rest of the function calls

  path$$1.node.specifiers.some(function (specifier) {
    if (specifier.type === 'ImportDefaultSpecifier' && styledImport.import === 'default' && // fixes an issue in gatsby where the styled-components plugin has run
    // before twin. fix is to ignore import aliases which babel creates
    // https://github.com/ben-rogerson/twin.macro/issues/192
    !specifier.local.name.startsWith('_')) {
      state.styledIdentifier = specifier.local;
      state.existingStyledIdentifier = true;
      return true;
    }

    if (specifier.imported && specifier.imported.name === styledImport.import) {
      state.styledIdentifier = specifier.local;
      state.existingStyledIdentifier = true;
      return true;
    }

    state.existingStyledIdentifier = false;
    return false;
  });
};

var setCssIdentifier = function (ref) {
  var state = ref.state;
  var path$$1 = ref.path;
  var cssImport = ref.cssImport;

  var importFromStitches = state.isStitches && cssImport.from.includes(path$$1.node.source.value);
  var isLibraryImport = path$$1.node.source.value === cssImport.from;
  if (!isLibraryImport && !importFromStitches) { return; } // Look for an existing import that matches the config,
  // if found then reuse it for the rest of the function calls

  path$$1.node.specifiers.some(function (specifier) {
    if (specifier.type === 'ImportDefaultSpecifier' && cssImport.import === 'default') {
      state.cssIdentifier = specifier.local;
      state.existingCssIdentifier = true;
      return true;
    }

    if (specifier.imported && specifier.imported.name === cssImport.import) {
      state.cssIdentifier = specifier.local;
      state.existingCssIdentifier = true;
      return true;
    }

    state.existingCssIdentifier = false;
    return false;
  });
};
/**
 * Parse tagged template arrays (``)
 */


function parseTte(ref) {
  var path$$1 = ref.path;
  var t = ref.types;
  var styledIdentifier = ref.styledIdentifier;
  var state = ref.state;

  var cloneNode = t.cloneNode || t.cloneDeep;
  var tagType = path$$1.node.tag.type;
  if (tagType !== 'Identifier' && tagType !== 'MemberExpression' && tagType !== 'CallExpression') { return null; } // Convert *very* basic interpolated variables

  var string = path$$1.get('quasi').evaluate().value; // Grab the path location before changing it

  var stringLoc = path$$1.get('quasi').node.loc;

  if (tagType === 'CallExpression') {
    replaceWithLocation(path$$1.get('tag').get('callee'), cloneNode(styledIdentifier));
    state.isImportingStyled = true;
  } else if (tagType === 'MemberExpression') {
    replaceWithLocation(path$$1.get('tag').get('object'), cloneNode(styledIdentifier));
    state.isImportingStyled = true;
  }

  if (tagType === 'CallExpression' || tagType === 'MemberExpression') {
    replaceWithLocation(path$$1, t.callExpression(cloneNode(path$$1.node.tag), [t.identifier('__twPlaceholder')]));
    path$$1 = path$$1.get('arguments')[0];
  } // Restore the original path location


  path$$1.node.loc = stringLoc;
  return {
    string: string,
    path: path$$1
  };
}

function replaceWithLocation(path$$1, replacement) {
  var ref = path$$1.node;
  var loc = ref.loc;
  var newPaths = replacement ? path$$1.replaceWith(replacement) : [];

  if (Array.isArray(newPaths) && newPaths.length > 0) {
    newPaths.forEach(function (p) {
      p.node.loc = loc;
    });
  }

  return newPaths;
}

var validImports = new Set(['default', 'styled', 'css', 'theme', 'screen', 'TwStyle', 'ThemeStyle', 'GlobalStyles', 'globalStyles']);

var validateImports = function (imports) {
  var unsupportedImport = Object.keys(imports).find(function (reference) { return !validImports.has(reference); });
  var importTwAsNamedNotDefault = Object.keys(imports).find(function (reference) { return reference === 'tw'; });
  throwIf(importTwAsNamedNotDefault, function () {
    logGeneralError("Please use the default export for twin.macro, i.e:\nimport tw from 'twin.macro'\nNOT import { tw } from 'twin.macro'");
  });
  throwIf(unsupportedImport, function () { return logGeneralError(("Twin doesn't recognize { " + unsupportedImport + " }\n\nTry one of these imports:\nimport tw, { styled, css, theme, screen, GlobalStyles, globalStyles } from 'twin.macro'")); });
};

var generateUid = function (name, program) { return program.scope.generateUidIdentifier(name); };

var getParentJSX = function (path$$1) { return path$$1.findParent(function (p) { return p.isJSXOpeningElement(); }); };

var getAttributeNames = function (jsxPath) {
  var attributes = jsxPath.get('attributes');
  var attributeNames = attributes.map(function (p) { return p.node.name && p.node.name.name; });
  return attributeNames;
};

var getCssAttributeData = function (attributes) {
  if (!String(attributes)) { return {}; }
  var index = attributes.findIndex(function (attribute) { return attribute.isJSXAttribute() && attribute.get('name.name').node === 'css'; });
  return {
    index: index,
    hasCssAttribute: index >= 0,
    attribute: attributes[index]
  };
};

var getFunctionValue = function (path$$1) {
  if (path$$1.parent.type !== 'CallExpression') { return; }
  var parent = path$$1.findParent(function (x) { return x.isCallExpression(); });
  if (!parent) { return; }
  var argument = parent.get('arguments')[0] || '';
  return {
    parent: parent,
    input: argument.evaluate && argument.evaluate().value
  };
};

var getTaggedTemplateValue = function (path$$1) {
  if (path$$1.parent.type !== 'TaggedTemplateExpression') { return; }
  var parent = path$$1.findParent(function (x) { return x.isTaggedTemplateExpression(); });
  if (!parent) { return; }
  if (parent.node.tag.type !== 'Identifier') { return; }
  return {
    parent: parent,
    input: parent.get('quasi').evaluate().value
  };
};

var getMemberExpression = function (path$$1) {
  if (path$$1.parent.type !== 'MemberExpression') { return; }
  var parent = path$$1.findParent(function (x) { return x.isMemberExpression(); });
  if (!parent) { return; }
  return {
    parent: parent,
    input: parent.get('property').node.name
  };
};

var generateTaggedTemplateExpression = function (ref) {
  var identifier = ref.identifier;
  var t = ref.t;
  var styles = ref.styles;

  var backtickStyles = t.templateElement({
    raw: ("" + styles),
    cooked: ("" + styles)
  });
  var ttExpression = t.taggedTemplateExpression(identifier, t.templateLiteral([backtickStyles], []));
  return ttExpression;
};

var isComponent = function (name) { return name.slice(0, 1).toUpperCase() === name.slice(0, 1); };

var jsxElementNameError = function () { return logGeneralError("The css prop + tw props can only be added to jsx elements with a single dot in their name (or no dot at all)."); };

var getFirstStyledArgument = function (jsxPath, t) {
  var path$$1 = get(jsxPath, 'node.name.name');
  if (path$$1) { return isComponent(path$$1) ? t.identifier(path$$1) : t.stringLiteral(path$$1); }
  var dotComponent = get(jsxPath, 'node.name');
  throwIf(!dotComponent, jsxElementNameError); // Element name has dots in it

  var objectName = get(dotComponent, 'object.name');
  throwIf(!objectName, jsxElementNameError);
  var propertyName = get(dotComponent, 'property.name');
  throwIf(!propertyName, jsxElementNameError);
  return t.memberExpression(t.identifier(objectName), t.identifier(propertyName));
};

var makeStyledComponent = function (ref) {
  var secondArg = ref.secondArg;
  var jsxPath = ref.jsxPath;
  var t = ref.t;
  var program = ref.program;
  var state = ref.state;

  var constName = program.scope.generateUidIdentifier('TwComponent');

  if (!state.styledIdentifier) {
    state.styledIdentifier = generateUid('styled', program);
    state.isImportingStyled = true;
  }

  var firstArg = getFirstStyledArgument(jsxPath, t);
  var args = [firstArg, secondArg].filter(Boolean);
  var identifier = t.callExpression(state.styledIdentifier, args);
  var styledProps = [t.variableDeclarator(constName, identifier)];
  var styledDefinition = t.variableDeclaration('const', styledProps);
  var rootParentPath = jsxPath.findParent(function (p) { return p.parentPath.isProgram(); });
  rootParentPath.insertBefore(styledDefinition);

  if (t.isMemberExpression(firstArg)) {
    // Replace components with a dot, eg: Dialog.blah
    var id = t.jsxIdentifier(constName.name);
    jsxPath.get('name').replaceWith(id);
    if (jsxPath.node.selfClosing) { return; }
    jsxPath.parentPath.get('closingElement.name').replaceWith(id);
  } else {
    jsxPath.node.name.name = constName.name;
    if (jsxPath.node.selfClosing) { return; }
    jsxPath.parentPath.node.closingElement.name.name = constName.name;
  }
};

// Defaults for different css-in-js libraries
var configDefaultsGoober = {
  sassyPseudo: true
}; // Sets selectors like hover to &:hover

var configDefaultsStitches = {
  sassyPseudo: true,
  // Sets selectors like hover to &:hover
  convertStyledDot: true,
  // Convert styled.[element] to a default syntax
  moveTwPropToStyled: true,
  // Move the tw prop to a styled definition
  convertHtmlElementToStyled: true // For packages like stitches, add a styled definition on css prop elements

};

var configDefaultsTwin = function (ref) {
  var isGoober = ref.isGoober;
  var isStitches = ref.isStitches;
  var isDev = ref.isDev;

  return (Object.assign({}, {allowStyleProp: false,
  // Allows styles within style="blah" without throwing an error
  autoCssProp: false,
  // Automates the import of styled-components when you use their css prop
  dataTwProp: isDev,
  // During development, add a data-tw="" prop containing your tailwind classes for backtracing
  disableColorVariables: false,
  // Disable css variables in colors (except gradients) to support older browsers/react native
  hasSuggestions: true,
  // Switch suggestions on/off when you use a tailwind class that's not found
  sassyPseudo: false,
  // Sets selectors like hover to &:hover
  debug: false,
  // Show the output of the classes twin converts
  includeClassNames: false,
  // Look in the className props for tailwind classes to convert
  dataCsProp: isDev,
  // During development, add a data-cs="" prop containing your short css classes for backtracing
  disableCsProp: false,
  // Disable converting css styles in the cs prop
  disableShortCss: false,
  // Disable converting css written using short css
  stitchesConfig: undefined,
  // Set the path to the stitches config (stitches only)
  config: undefined,
  // Set the path to the tailwind config
  convertStyledDot: false,
  // Convert styled.[element] to a default syntax (only used for stitches so far)
  moveTwPropToStyled: false,
  // Move the tw prop to a styled definition (only used for stitches so far)
  convertHtmlElementToStyled: false},
  // For packages like stitches, add a styled definition on css prop elements
  (isGoober && configDefaultsGoober),
  (isStitches && configDefaultsStitches)));
};

var isBoolean = function (value) { return typeof value === 'boolean'; };

var allowedPresets = ['styled-components', 'emotion', 'goober', 'stitches'];
var configTwinValidators = {
  preset: [function (value) { return value === undefined || allowedPresets.includes(value); }, ("The config “preset” can only be:\n" + (allowedPresets.map(function (p) { return ("'" + p + "'"); }).join(', ')))],
  allowStyleProp: [isBoolean, 'The config “allowStyleProp” can only be true or false'],
  autoCssProp: [function (value) { return value !== true; }, 'The “autoCssProp” feature has been removed from twin.macro@2.8.2+\nThis means the css prop must be added by styled-components instead.\nSetup info at https://twinredirect.page.link/auto-css-prop\n\nRemove the “autoCssProp” item from your config to avoid this message.'],
  disableColorVariables: [isBoolean, 'The config “disableColorVariables” can only be true or false'],
  hasSuggestions: [isBoolean, 'The config “hasSuggestions” can only be true or false'],
  sassyPseudo: [isBoolean, 'The config “sassyPseudo” can only be true or false'],
  dataTwProp: [function (value) { return isBoolean(value) || value === 'all'; }, 'The config “dataTwProp” can only be true, false or "all"'],
  dataCsProp: [function (value) { return isBoolean(value) || value === 'all'; }, 'The config “dataCsProp” can only be true, false or "all"'],
  debugProp: [function (value) { return value === undefined; }, "The “debugProp” option was renamed to “dataTwProp”, please rename it in your twin config"],
  includeClassNames: [isBoolean, 'The config “includeClassNames” can only be true or false'],
  disableCsProp: [isBoolean, 'The config “disableCsProp” can only be true or false'],
  convertStyledDot: [isBoolean, 'The config “convertStyledDot” can only be true or false'],
  moveTwPropToStyled: [isBoolean, 'The config “moveTwPropToStyled” can only be true or false'],
  convertHtmlElementToStyled: [isBoolean, 'The config “convertHtmlElementToStyled” can only be true or false']
};

var getAllConfigs = function (config) {
  var configs = flatMap([].concat( get(config, 'presets', [defaultTailwindConfig]) ).reverse(), function (preset) {
    var config = typeof preset === 'function' ? preset() : preset;
    return getAllConfigs(config);
  });
  return [config ].concat( configs);
};

var getConfigTailwindProperties = function (state, config) {
  var sourceRoot = state.file.opts.sourceRoot || '.';
  var configFile = config && config.config;
  var configPath = path.resolve(sourceRoot, configFile || "./tailwind.config.js");
  var configExists = fs.existsSync(configPath);
  var path$$1 = configExists ? require(configPath) : defaultTailwindConfig;
  var configTailwind = resolveTailwindConfig([].concat( getAllConfigs(path$$1) ));
  throwIf(!configTailwind, function () { return logGeneralError(("Couldn’t find the Tailwind config.\nLooked in " + config)); });
  return {
    configExists: configExists,
    configTailwind: configTailwind,
    configPath: configPath
  };
};

var checkExists = function (fileName, sourceRoot) {
  var fileNames = Array.isArray(fileName) ? fileName : [fileName];
  var configPath;
  fileNames.find(function (fileName) {
    var resolved = path.resolve(sourceRoot, ("./" + fileName));
    var exists = fs.existsSync(resolved);
    if (exists) { configPath = resolved; }
    return exists;
  });
  return configPath;
};

var getRelativePath = function (ref) {
  var comparePath = ref.comparePath;
  var state = ref.state;

  var ref$1 = state.file.opts;
  var filename = ref$1.filename;
  var pathName = path.parse(filename).dir;
  return path.relative(pathName, comparePath);
};

var getStitchesPath = function (state, config) {
  var sourceRoot = state.file.opts.sourceRoot || '.';
  var configPathCheck = config.stitchesConfig || ['stitches.config.ts', 'stitches.config.js'];
  var configPath = checkExists(configPathCheck, sourceRoot);
  throwIf(!configPath, function () { return logGeneralError(("Couldn’t find the Stitches config at " + (config.stitchesConfig ? ("“" + (config.stitchesConfig) + "”") : 'the project root') + ".\nUse the twin config: stitchesConfig=\"PATH_FROM_PROJECT_ROOT\" to set the location.")); });
  return getRelativePath({
    comparePath: configPath,
    state: state
  });
};

var runConfigValidator = function (ref) {
  var item = ref[0];
  var value = ref[1];

  var validatorConfig = configTwinValidators[item];
  if (!validatorConfig) { return true; }
  var validator = validatorConfig[0];
  var errorMessage = validatorConfig[1];
  throwIf(validator(value) !== true, function () { return logGeneralError(errorMessage); });
  return true;
};

var getConfigTwin = function (config, state) { return (Object.assign({}, configDefaultsTwin(state),
  config)); };

var getConfigTwinValidated = function (config, state) { return Object.entries(getConfigTwin(config, state)).reduce(function (result, item) {
  var obj;

  return (Object.assign({}, result,
  (runConfigValidator(item) && ( obj = {}, obj[item[0]] = item[1], obj ))));
  }, {}); };

/**
 * Config presets
 *
 * To use, add the preset in package.json/babel macro config:
 *
 * styled-components
 * { "babelMacros": { "twin": { "preset": "styled-components" } } }
 * module.exports = { twin: { preset: "styled-components" } }
 *
 * emotion
 * { "babelMacros": { "twin": { "preset": "emotion" } } }
 * module.exports = { twin: { preset: "emotion" } }
 *
 * goober
 * { "babelMacros": { "twin": { "preset": "goober" } } }
 * module.exports = { twin: { preset: "goober" } }
 */
var userPresets = {
  'styled-components': {
    styled: {
      import: 'default',
      from: 'styled-components'
    },
    css: {
      import: 'css',
      from: 'styled-components'
    },
    global: {
      import: 'createGlobalStyle',
      from: 'styled-components'
    }
  },
  emotion: {
    styled: {
      import: 'default',
      from: '@emotion/styled'
    },
    css: {
      import: 'css',
      from: '@emotion/react'
    },
    global: {
      import: 'Global',
      from: '@emotion/react'
    }
  },
  goober: {
    styled: {
      import: 'styled',
      from: 'goober'
    },
    css: {
      import: 'css',
      from: 'goober'
    },
    global: {
      import: 'createGlobalStyles',
      from: 'goober/global'
    }
  },
  stitches: {
    styled: {
      import: 'styled',
      from: 'stitches.config'
    },
    css: {
      import: 'css',
      from: 'stitches.config'
    },
    global: {
      import: 'global',
      from: 'stitches.config'
    }
  }
};

var getCssConfig = function (ref) {
  var state = ref.state;
  var config = ref.config;

  var usedConfig = config.css && config || userPresets[config.preset] || userPresets.emotion;

  if (typeof usedConfig.css === 'string') {
    return {
      import: 'css',
      from: usedConfig.css
    };
  }

  if (config.preset === 'stitches') {
    var stitchesPath = getStitchesPath(state, config);

    if (stitchesPath) {
      // Overwrite the stitches import data with the path from the current file
      usedConfig.css.from = stitchesPath;
    }
  }

  return usedConfig.css;
};

var updateCssReferences = function (ref) {
  var references = ref.references;
  var state = ref.state;

  if (state.existingCssIdentifier) { return; }
  var cssReferences = references.css;
  if (isEmpty(cssReferences)) { return; }
  cssReferences.forEach(function (path$$1) {
    path$$1.node.name = state.cssIdentifier.name;
  });
};

var addCssImport = function (ref) {
  var references = ref.references;
  var program = ref.program;
  var t = ref.t;
  var cssImport = ref.cssImport;
  var state = ref.state;

  if (!state.isImportingCss) {
    var shouldImport = !isEmpty(references.css) && !state.existingCssIdentifier;
    if (!shouldImport) { return; }
  }

  if (state.existingCssIdentifier) { return; }
  addImport({
    types: t,
    program: program,
    name: cssImport.import,
    mod: cssImport.from,
    identifier: state.cssIdentifier
  });
};

var convertHtmlElementToStyled = function (props) {
  var path$$1 = props.path;
  var t = props.t;
  var state = props.state;
  if (!state.configTwin.convertHtmlElementToStyled) { return; }
  var jsxPath = path$$1.parentPath;
  makeStyledComponent(Object.assign({}, props,
    {jsxPath: jsxPath,
    secondArg: t.objectExpression([])}));
};

var getStyledConfig = function (ref) {
  var state = ref.state;
  var config = ref.config;

  var usedConfig = config.styled && config || userPresets[config.preset] || userPresets.emotion;

  if (typeof usedConfig.styled === 'string') {
    return {
      import: 'default',
      from: usedConfig.styled
    };
  }

  if (config.preset === 'stitches') {
    var stitchesPath = getStitchesPath(state, config);

    if (stitchesPath) {
      // Overwrite the stitches import data with the path from the current file
      usedConfig.styled.from = stitchesPath;
    }
  }

  return usedConfig.styled;
};

var updateStyledReferences = function (ref) {
  var references = ref.references;
  var state = ref.state;

  if (state.existingStyledIdentifier) { return; }
  var styledReferences = references.styled;
  if (isEmpty(styledReferences)) { return; }
  styledReferences.forEach(function (path$$1) {
    path$$1.node.name = state.styledIdentifier.name;
  });
};

var addStyledImport = function (ref) {
  var references = ref.references;
  var program = ref.program;
  var t = ref.t;
  var styledImport = ref.styledImport;
  var state = ref.state;

  if (!state.isImportingStyled) {
    var shouldImport = !isEmpty(references.styled) && !state.existingStyledIdentifier;
    if (!shouldImport) { return; }
  }

  if (state.existingStyledIdentifier) { return; }
  addImport({
    types: t,
    program: program,
    name: styledImport.import,
    mod: styledImport.from,
    identifier: state.styledIdentifier
  });
};

var moveDotElementToParam = function (ref) {
  var path$$1 = ref.path;
  var t = ref.t;

  if (path$$1.parent.type !== 'MemberExpression') { return; }
  var parentCallExpression = path$$1.findParent(function (x) { return x.isCallExpression(); });
  if (!parentCallExpression) { return; }
  var styledName = get(path$$1, 'parentPath.node.property.name');
  var styledArgs = get(parentCallExpression, 'node.arguments.0');
  var args = [t.stringLiteral(styledName), styledArgs].filter(Boolean);
  var replacement = t.callExpression(path$$1.node, args);
  replaceWithLocation(parentCallExpression, replacement);
};

var handleStyledFunction = function (ref) {
  var references = ref.references;
  var t = ref.t;
  var state = ref.state;

  if (!state.configTwin.convertStyledDot) { return; }
  if (isEmpty(references)) { return; }
  (references.default || []).concat( (references.styled || [])).filter(Boolean).forEach(function (path$$1) {
    // convert tw.div`` & styled.div`` to styled('div', {})
    moveDotElementToParam({
      path: path$$1,
      t: t
    });
  });
};

var trimInput = function (themeValue) {
  var arrayValues = themeValue // Split at dots outside of square brackets
  .split(/\.(?=(((?!]).)*\[)|[^[\]]*$)/).filter(Boolean);

  if (arrayValues.length === 1) {
    return arrayValues[0];
  }

  return arrayValues.slice(0, -1).join('.');
};

var handleThemeFunction = function (ref) {
  var references = ref.references;
  var t = ref.t;
  var state = ref.state;

  if (!references.theme) { return; }
  var theme = getTheme(state.config.theme);
  references.theme.forEach(function (path$$1) {
    var ref = getTaggedTemplateValue(path$$1) || getFunctionValue(path$$1) || '';
    var input = ref.input;
    var parent = ref.parent;
    throwIf(!parent, function () { return logGeneralError("The theme value doesn’t look right\n\nTry using it like this: theme`colors.black` or theme('colors.black')"); });
    var themeValue = theme(input);
    if (themeValue && themeValue.DEFAULT) { themeValue = themeValue.DEFAULT; }
    throwIf(!themeValue, function () { return themeErrorNotFound({
      theme: input.includes('.') ? get(theme(), trimInput(input)) : theme(),
      input: input,
      trimInput: trimInput(input)
    }); });
    return replaceWithLocation(parent, astify(themeValue, t));
  });
};

var getDirectReplacement = function (ref) {
  var mediaQuery = ref.mediaQuery;
  var parent = ref.parent;
  var t = ref.t;

  return ({
  newPath: parent,
  replacement: astify(mediaQuery, t)
});
};

var handleDefinition = function (ref) {
  var mediaQuery = ref.mediaQuery;
  var parent = ref.parent;
  var type = ref.type;
  var t = ref.t;

  return ({
  TaggedTemplateExpression: function () {
    var newPath = parent.findParent(function (x) { return x.isTaggedTemplateExpression(); });
    var query = [(mediaQuery + " { "), " }"];
    var quasis = [t.templateElement({
      raw: query[0],
      cooked: query[0]
    }, false), t.templateElement({
      raw: query[1],
      cooked: query[1]
    }, true)];
    var expressions = [newPath.get('quasi').node];
    var replacement = t.templateLiteral(quasis, expressions);
    return {
      newPath: newPath,
      replacement: replacement
    };
  },
  CallExpression: function () {
    var newPath = parent.findParent(function (x) { return x.isCallExpression(); });
    var value = newPath.get('arguments')[0].node;
    var replacement = t.objectExpression([t.objectProperty(t.stringLiteral(mediaQuery), value)]);
    return {
      newPath: newPath,
      replacement: replacement
    };
  },
  ObjectProperty: function () {
    // Remove brackets around keys so merges work with tailwind screens
    // styled.div({ [screen`2xl`]: tw`block`, ...tw`2xl:inline` })
    // https://github.com/ben-rogerson/twin.macro/issues/379
    parent.parent.computed = false;
    return getDirectReplacement({
      mediaQuery: mediaQuery,
      parent: parent,
      t: t
    });
  },
  ExpressionStatement: function () { return getDirectReplacement({
    mediaQuery: mediaQuery,
    parent: parent,
    t: t
  }); },
  ArrowFunctionExpression: function () { return getDirectReplacement({
    mediaQuery: mediaQuery,
    parent: parent,
    t: t
  }); },
  ArrayExpression: function () { return getDirectReplacement({
    mediaQuery: mediaQuery,
    parent: parent,
    t: t
  }); },
  BinaryExpression: function () { return getDirectReplacement({
    mediaQuery: mediaQuery,
    parent: parent,
    t: t
  }); },
  LogicalExpression: function () { return getDirectReplacement({
    mediaQuery: mediaQuery,
    parent: parent,
    t: t
  }); },
  ConditionalExpression: function () { return getDirectReplacement({
    mediaQuery: mediaQuery,
    parent: parent,
    t: t
  }); },
  VariableDeclarator: function () { return getDirectReplacement({
    mediaQuery: mediaQuery,
    parent: parent,
    t: t
  }); },
  TemplateLiteral: function () { return getDirectReplacement({
    mediaQuery: mediaQuery,
    parent: parent,
    t: t
  }); },
  TSAsExpression: function () { return getDirectReplacement({
    mediaQuery: mediaQuery,
    parent: parent,
    t: t
  }); }
})[type];
};

var validateScreenValue = function (ref) {
  var screen = ref.screen;
  var screens = ref.screens;
  var value = ref.value;

  return throwIf(!screen, function () { return logBadGood(((value ? ("“" + value + "” wasn’t found in your") : 'Specify a screen value from your') + " tailwind config"), ("Try one of these:\n\n" + (Object.entries(screens).map(function (ref) {
  var k = ref[0];
  var v = ref[1];

  return ("screen." + k + "`...` (" + v + ")");
  }).join('\n')))); });
};

var getMediaQuery = function (ref) {
  var input = ref.input;
  var screens = ref.screens;

  validateScreenValue({
    screen: screens[input],
    screens: screens,
    value: input
  });
  var mediaQuery = "@media (min-width: " + (screens[input]) + ")";
  return {
    mediaQuery: mediaQuery
  };
};

var handleScreenFunction = function (ref) {
  var references = ref.references;
  var t = ref.t;
  var state = ref.state;

  if (!references.screen) { return; }
  var theme = getTheme(state.config.theme);
  var screens = theme('screens');
  references.screen.forEach(function (path$$1) {
    var ref = getTaggedTemplateValue(path$$1) || // screen.lg``
    getFunctionValue(path$$1) || // screen.lg({ })
    getMemberExpression(path$$1) || // screen`lg`
    '';
    var input = ref.input;
    var parent = ref.parent;
    var ref$1 = getMediaQuery({
      input: input,
      screens: screens
    });
    var mediaQuery = ref$1.mediaQuery;
    var hasStyles = ref$1.hasStyles;
    var definition = handleDefinition({
      type: parent.parent.type,
      hasStyles: hasStyles,
      mediaQuery: mediaQuery,
      parent: parent,
      t: t
    });
    throwIf(!definition, function () { return logBadGood("The screen import doesn’t support that syntax", ("Try something like this:\n\n" + ([].concat( Object.keys(screens) ).map(function (f) { return ("screen." + f); }).join(', ')))); });
    var ref$2 = definition();
    var newPath = ref$2.newPath;
    var replacement = ref$2.replacement;
    replaceWithLocation(newPath, replacement);
  });
};

/**
 * Embedding modern-normalize here is the best option right now as converting
 * the css file to a string causes syntax errors.
 * So these styles must be kept in sync with the remote package for now.
 * https://github.com/sindresorhus/modern-normalize/blob/main/modern-normalize.css
 */
var templateObject$3 = Object.freeze(["fontFamily.mono"]);
var templateObject$2 = Object.freeze(["colors.gray.400"]);
var templateObject$1 = Object.freeze(["borderColor.DEFAULT"]);
var templateObject = Object.freeze(["fontFamily.sans"]);
var modernNormalizeStyles = {
  '*, ::before, ::after': {
    boxSizing: 'border-box'
  },
  html: {
    lineHeight: '1.15',
    WebkitTextSizeAdjust: '100%',
    MozTabSize: '4',
    tabSize: '4'
  },
  body: {
    margin: '0',
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'"
  },
  hr: {
    height: '0',
    color: 'inherit'
  },
  'abbr[title]': {
    textDecoration: 'underline dotted'
  },
  'b, strong': {
    fontWeight: 'bolder'
  },
  'code, kbd, samp, pre': {
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace",
    fontSize: '1em'
  },
  small: {
    fontSize: '80%'
  },
  'sub, sup': {
    fontSize: '75%',
    lineHeight: '0',
    position: 'relative',
    verticalAlign: 'baseline'
  },
  sub: {
    bottom: '-0.25em'
  },
  sup: {
    top: '-0.5em'
  },
  table: {
    textIndent: '0',
    borderColor: 'inherit'
  },
  'button, input, optgroup, select, textarea': {
    fontFamily: 'inherit',
    fontSize: '100%',
    lineHeight: '1.15',
    margin: '0'
  },
  'button, select': {
    textTransform: 'none'
  },
  "button, [type='button'], [type='reset'], [type='submit']": {
    WebkitAppearance: 'button'
  },
  '::-moz-focus-inner': {
    borderStyle: 'none',
    padding: '0'
  },
  ':-moz-focusring': {
    outline: '1px dotted ButtonText'
  },
  ':-moz-ui-invalid': {
    boxShadow: 'none'
  },
  legend: {
    padding: '0'
  },
  progress: {
    verticalAlign: 'baseline'
  },
  '::-webkit-inner-spin-button, ::-webkit-outer-spin-button': {
    height: 'auto'
  },
  "[type='search']": {
    WebkitAppearance: 'textfield',
    outlineOffset: '-2px'
  },
  '::-webkit-search-decoration': {
    WebkitAppearance: 'none'
  },
  '::-webkit-file-upload-button': {
    WebkitAppearance: 'button',
    font: 'inherit'
  },
  summary: {
    display: 'list-item'
  }
};
/**
 * These are the same base styles tailwindcss uses.
 * I've stripped the comments as there were too many syntax errors after
 * converting it from css to a string.
 * https://raw.githubusercontent.com/tailwindlabs/tailwindcss/master/src/plugins/css/preflight.css
 */

var globalPreflightStyles = function (ref) {
  var theme = ref.theme;
  var withAlpha = ref.withAlpha;

  return ({
  'blockquote, dl, dd, h1, h2, h3, h4, h5, h6, hr, figure, p, pre': {
    margin: '0'
  },
  button: {
    backgroundColor: 'transparent',
    backgroundImage: 'none'
  },
  fieldset: {
    margin: '0',
    padding: '0'
  },
  'ol, ul': {
    listStyle: 'none',
    margin: '0',
    padding: '0'
  },
  html: {
    fontFamily: theme(templateObject) || "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"",
    lineHeight: '1.5'
  },
  body: {
    fontFamily: 'inherit',
    lineHeight: 'inherit'
  },
  '*, ::before, ::after': Object.assign({}, {boxSizing: 'border-box',
    borderWidth: '0',
    borderStyle: 'solid'},
    withAlpha({
      color: theme(templateObject$1) || 'currentColor',
      property: 'borderColor',
      pieces: {
        important: ''
      },
      variable: '--tw-border-opacity'
    })),
  hr: {
    borderTopWidth: '1px'
  },
  img: {
    borderStyle: 'solid'
  },
  textarea: {
    resize: 'vertical'
  },
  'input::placeholder, textarea::placeholder': {
    color: theme(templateObject$2) || '#a1a1aa'
  },
  'button, [role="button"]': {
    cursor: 'pointer'
  },
  table: {
    borderCollapse: 'collapse'
  },
  'h1, h2, h3, h4, h5, h6': {
    fontSize: 'inherit',
    fontWeight: 'inherit'
  },
  a: {
    color: 'inherit',
    textDecoration: 'inherit'
  },
  'button, input, optgroup, select, textarea': {
    padding: '0',
    lineHeight: 'inherit',
    color: 'inherit'
  },
  'pre, code, kbd, samp': {
    fontFamily: theme(templateObject$3) || "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace"
  },
  'img, svg, video, canvas, audio, iframe, embed, object': {
    display: 'block',
    verticalAlign: 'middle'
  },
  'img, video': {
    maxWidth: '100%',
    height: 'auto'
  },
  '[hidden]': {
    display: 'none'
  }
});
};

var templateObject$4 = Object.freeze(["keyframes"]);
var animation = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(animate)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var animationConfig = configValue('animation');

  if (!animationConfig) {
    errorSuggestions({
      config: ['animation']
    });
  }

  return {
    animation: ("" + animationConfig + important)
  };
});
var globalKeyframeStyles = function (ref) {
  var theme = ref.theme;

  var keyframes = theme(templateObject$4);
  if (!keyframes) { return; }
  var output = Object.entries(keyframes).reduce(function (result, ref) {
    var obj;

    var name = ref[0];
    var frames = ref[1];
    return (Object.assign({}, result,
    ( obj = {}, obj[("@keyframes " + name)] = frames, obj )));
  }, {});
  return output;
};

var templateObject$1$1 = Object.freeze(["ringColor.DEFAULT"]);
var templateObject$5 = Object.freeze(["ringOpacity.DEFAULT"]);

function safeCall(callback, defaultValue) {
  try {
    return callback();
  } catch (_) {
    return defaultValue;
  }
}

var globalRingStyles = function (ref) {
  var theme = ref.theme;

  var ringColorDefault = (function (ref) {
    var r = ref[0];
    var g = ref[1];
    var b = ref[2];

    return ("rgba(" + r + ", " + g + ", " + b + ", " + (theme(templateObject$5) || '0.5') + ")");
  })(safeCall(function () { return toRgba(theme(templateObject$1$1)); }, ['147', '197', '253']));

  return {
    '*, ::before, ::after': {
      '--tw-ring-inset': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-ring-offset-width': theme('ringOffsetWidth.DEFAULT') || '0px',
      '--tw-ring-offset-color': theme('ringOffsetColor.DEFAULT') || '#fff',
      '--tw-ring-color': ringColorDefault,
      '--tw-ring-offset-shadow': '0 0 #0000',
      '--tw-ring-shadow': '0 0 #0000'
    }
  };
};

var handleWidth = function (ref) {
  var configValue = ref.configValue;
  var important = ref.important;

  var value = configValue('ringWidth');
  if (!value) { return; }
  return {
    '--tw-ring-offset-shadow': "var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)",
    '--tw-ring-shadow': ("var(--tw-ring-inset) 0 0 0 calc(" + value + " + var(--tw-ring-offset-width)) var(--tw-ring-color)"),
    boxShadow: ("" + (["var(--tw-ring-offset-shadow)", "var(--tw-ring-shadow)", "var(--tw-shadow, 0 0 #0000)"].join(', ')) + important)
  };
};

var handleColor = function (ref) {
  var toColor = ref.toColor;

  var common = {
    matchStart: 'ring',
    property: '--tw-ring-color',
    configSearch: 'ringColor'
  };
  return toColor([Object.assign({}, common,
    {opacityVariable: '--tw-ring-opacity'}), common]);
};

var ring = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var toColor = properties.toColor;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(ring)-)([^]*)/);
  if (classValue === 'inset') { return {
    '--tw-ring-inset': 'inset'
  }; }
  var width = handleWidth({
    configValue: function (config) { return getConfigValue(theme(config), classValue); },
    important: important
  });
  if (width) { return width; }
  var color = handleColor({
    toColor: toColor
  });
  if (color) { return color; }
  errorSuggestions({
    config: ['ringWidth', 'ringColor']
  });
});

var globalBoxShadowStyles = {
  '*, ::before, ::after': {
    '--tw-shadow': '0 0 #0000'
  }
};
var boxShadow = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(shadow)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('boxShadow');

  if (!value) {
    return errorSuggestions({
      config: 'boxShadow'
    });
  }

  return {
    '--tw-shadow': value === 'none' ? '0 0 #0000' : value,
    boxShadow: ("" + (["var(--tw-ring-offset-shadow, 0 0 #0000)", "var(--tw-ring-shadow, 0 0 #0000)", "var(--tw-shadow)"].join(', ')) + important)
  };
});

var globalTransformStyles = {
  '*, ::before, ::after': {
    '--tw-translate-x': '0',
    '--tw-translate-y': '0',
    '--tw-rotate': '0',
    '--tw-skew-x': '0',
    '--tw-skew-y': '0',
    '--tw-scale-x': '1',
    '--tw-scale-y': '1',
    '--tw-transform': ['translateX(var(--tw-translate-x))', 'translateY(var(--tw-translate-y))', 'rotate(var(--tw-rotate))', 'skewX(var(--tw-skew-x))', 'skewY(var(--tw-skew-y))', 'scaleX(var(--tw-scale-x))', 'scaleY(var(--tw-scale-y))'].join(' ')
  }
};
var globalFilterStyles = {
  '*, ::before, ::after': {
    '--tw-blur': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-brightness': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-contrast': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-grayscale': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-hue-rotate': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-invert': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-saturate': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-sepia': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-drop-shadow': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-filter': ['var(--tw-blur)', 'var(--tw-brightness)', 'var(--tw-contrast)', 'var(--tw-grayscale)', 'var(--tw-hue-rotate)', 'var(--tw-invert)', 'var(--tw-saturate)', 'var(--tw-sepia)', 'var(--tw-drop-shadow)'].join(' ')
  }
};
var globalBackdropStyles = {
  '*, ::before, ::after': {
    '--tw-backdrop-blur': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-backdrop-brightness': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-backdrop-contrast': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-backdrop-grayscale': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-backdrop-hue-rotate': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-backdrop-invert': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-backdrop-opacity': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-backdrop-saturate': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-backdrop-sepia': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-backdrop-filter': ['var(--tw-backdrop-blur)', 'var(--tw-backdrop-brightness)', 'var(--tw-backdrop-contrast)', 'var(--tw-backdrop-grayscale)', 'var(--tw-backdrop-hue-rotate)', 'var(--tw-backdrop-invert)', 'var(--tw-backdrop-opacity)', 'var(--tw-backdrop-saturate)', 'var(--tw-backdrop-sepia)'].join(' ')
  }
};
var globalStyles = [modernNormalizeStyles, globalPreflightStyles, globalKeyframeStyles, globalTransformStyles, globalRingStyles, globalBoxShadowStyles, globalFilterStyles, globalBackdropStyles];

var getGlobalConfig = function (config) {
  var usedConfig = config.global && config || userPresets[config.preset] || userPresets.emotion;
  return usedConfig.global;
};

var addGlobalStylesImport = function (ref) {
  var program = ref.program;
  var t = ref.t;
  var identifier = ref.identifier;
  var config = ref.config;

  var globalConfig = getGlobalConfig(config);
  return addImport({
    types: t,
    program: program,
    identifier: identifier,
    name: globalConfig.import,
    mod: globalConfig.from
  });
};

var getGlobalDeclarationTte = function (ref) {
  var t = ref.t;
  var stylesUid = ref.stylesUid;
  var globalUid = ref.globalUid;
  var styles = ref.styles;

  return t.variableDeclaration('const', [t.variableDeclarator(globalUid, generateTaggedTemplateExpression({
  t: t,
  identifier: stylesUid,
  styles: styles
}))]);
};

var getGlobalDeclarationProperty = function (props) {
  var t = props.t;
  var stylesUid = props.stylesUid;
  var globalUid = props.globalUid;
  var state = props.state;
  var styles = props.styles;
  var ttExpression = generateTaggedTemplateExpression({
    t: t,
    identifier: state.cssIdentifier,
    styles: styles
  });
  var openingElement = t.jsxOpeningElement(t.jsxIdentifier(stylesUid.name), [t.jsxAttribute(t.jsxIdentifier('styles'), t.jsxExpressionContainer(ttExpression))], true);
  var closingElement = t.jsxClosingElement(t.jsxIdentifier('close'));
  var arrowFunctionExpression = t.arrowFunctionExpression([], t.jsxElement(openingElement, closingElement, [], true));
  var code = t.variableDeclaration('const', [t.variableDeclarator(globalUid, arrowFunctionExpression)]);
  return code;
};

var kebabize = function (string) { return string.replace(/([\da-z]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase(); };

var convertCssObjectToString = function (cssObject) {
  if (!cssObject) { return; }
  return Object.entries(cssObject).map(function (ref) {
    var k = ref[0];
    var v = ref[1];

    return typeof v === 'string' ? ((kebabize(k)) + ": " + v + ";") : (k + " {\n" + (convertCssObjectToString(v)) + "\n        }");
  }).join('\n');
};
/**
 * Trim out classes defined within the selector
 * @param {object} data Input object from userPluginData
 * @returns {object} An object containing unpacked selectors
 */


var filterClassSelectors = function (ruleset) {
  if (isEmpty(ruleset)) { return; }
  return Object.entries(ruleset).reduce(function (result, ref) {
    var obj;

    var selector = ref[0];
    var value = ref[1];
    // Trim out the classes defined within the selector
    // Classes added using addBase have already been grabbed so they get filtered to avoid duplication
    var filteredSelectorSet = selector.split(',').filter(function (s) {
      if (isClass(s)) { return false; } // Remove sub selectors with a class as one of their keys

      var subSelectors = Object.keys(value);
      var hasSubClasses = subSelectors.some(function (selector) { return isClass(selector); });
      if (hasSubClasses) { return false; }
      return true;
    }).join(',');
    if (!filteredSelectorSet) { return result; }
    return Object.assign({}, result,
      ( obj = {}, obj[filteredSelectorSet] = value, obj ));
  }, {});
};

var handleGlobalStylesFunction = function (props) {
  var references = props.references;
  references.GlobalStyles && handleGlobalStylesJsx(props);
  references.globalStyles && handleGlobalStylesVariable(props);
};

var getGlobalStyles = function (ref) {
  var state = ref.state;

  // Create the magic theme function
  var theme = getTheme(state.config.theme); // Filter out classes as they're extracted as usable classes

  var strippedPlugins = filterClassSelectors(state.userPluginData && state.userPluginData.base);
  var resolvedStyles = globalStyles.map(function (gs) { return typeof gs === 'function' ? gs({
    theme: theme,
    withAlpha: withAlpha
  }) : gs; });
  if (strippedPlugins) { resolvedStyles.push(strippedPlugins); }
  var styles = resolvedStyles.reduce(function (result, item) { return deepMerge(result, item); }, {});
  return styles;
};

var handleGlobalStylesVariable = function (ref) {
  var references = ref.references;
  var state = ref.state;

  if (references.globalStyles.length === 0) { return; }
  var styles = getGlobalStyles({
    state: state
  });
  references.globalStyles.forEach(function (path$$1) {
    var templateStyles = "(" + (JSON.stringify(styles)) + ")"; // `template` requires () wrapping

    var convertedStyles = template(templateStyles, {
      placeholderPattern: false
    })();
    path$$1.replaceWith(convertedStyles);
  });
}; // TODO: Deprecate GlobalStyles in v3
// Replaced with globalStyles import as it's more adaptable


var handleGlobalStylesJsx = function (props) {
  var references = props.references;
  var program = props.program;
  var t = props.t;
  var state = props.state;
  var config = props.config;
  if (references.GlobalStyles.length === 0) { return; }
  throwIf(references.GlobalStyles.length > 1, function () { return logGeneralError('Only one GlobalStyles import can be used'); });
  var path$$1 = references.GlobalStyles[0];
  var parentPath = path$$1.findParent(function (x) { return x.isJSXElement(); });
  throwIf(!parentPath, function () { return logGeneralError('GlobalStyles must be added as a JSX element, eg: <GlobalStyles />'); });
  var styles = convertCssObjectToString(getGlobalStyles({
    state: state,
    props: props
  }));
  var globalUid = generateUid('GlobalStyles', program);
  var stylesUid = generateUid('globalImport', program);
  var declarationData = {
    t: t,
    globalUid: globalUid,
    stylesUid: stylesUid,
    styles: styles,
    state: state
  };

  if (state.isStyledComponents) {
    var declaration = getGlobalDeclarationTte(declarationData);
    program.unshiftContainer('body', declaration);
    path$$1.replaceWith(t.jSXIdentifier(globalUid.name));
  }

  if (state.isEmotion) {
    var declaration$1 = getGlobalDeclarationProperty(declarationData);
    program.unshiftContainer('body', declaration$1);
    path$$1.replaceWith(t.jSXIdentifier(globalUid.name)); // Check if the css import has already been imported
    // https://github.com/ben-rogerson/twin.macro/issues/313

    state.isImportingCss = !state.existingCssIdentifier;
  }

  if (state.isGoober) {
    var declaration$2 = getGlobalDeclarationTte(declarationData);
    program.unshiftContainer('body', declaration$2);
    path$$1.replaceWith(t.jSXIdentifier(globalUid.name));
  }

  throwIf(state.isStitches, function () { return logGeneralError('Use the “globalStyles” import with stitches'); });
  addGlobalStylesImport({
    identifier: stylesUid,
    t: t,
    program: program,
    config: config
  });
};

var formatProp = function (classes) { return classes // Replace the "stand-in spaces" with real ones
.replace(new RegExp(SPACE_ID, 'g'), ' ') // Normalize spacing
.replace(/\s\s+/g, ' ') // Remove newline characters
.replace(/\n/g, ' ').trim(); };

var addDataTwPropToPath = function (ref) {
  var t = ref.t;
  var attributes = ref.attributes;
  var rawClasses = ref.rawClasses;
  var path$$1 = ref.path;
  var state = ref.state;
  var propName = ref.propName; if ( propName === void 0 ) propName = 'data-tw';

  var dataTwPropAllEnvironments = propName === 'data-tw' && state.configTwin.dataTwProp === 'all';
  var dataCsPropAllEnvironments = propName === 'data-cs' && state.configTwin.dataCsProp === 'all';
  if (state.isProd && !dataTwPropAllEnvironments && !dataCsPropAllEnvironments) { return; }
  if (propName === 'data-tw' && !state.configTwin.dataTwProp) { return; }
  if (propName === 'data-cs' && !state.configTwin.dataCsProp) { return; } // Remove the existing debug attribute if you happen to have it

  var dataProperty = attributes.filter( // TODO: Use @babel/plugin-proposal-optional-chaining
  function (p) { return p.node && p.node.name && p.node.name.name === propName; });
  dataProperty.forEach(function (path$$1) { return path$$1.remove(); });
  var classes = formatProp(rawClasses); // Add the attribute

  path$$1.insertAfter(t.jsxAttribute(t.jsxIdentifier(propName), t.stringLiteral(classes)));
};

var addDataPropToExistingPath = function (ref) {
  var t = ref.t;
  var attributes = ref.attributes;
  var rawClasses = ref.rawClasses;
  var path$$1 = ref.path;
  var state = ref.state;
  var propName = ref.propName; if ( propName === void 0 ) propName = 'data-tw';

  var dataTwPropAllEnvironments = propName === 'data-tw' && state.configTwin.dataTwProp === 'all';
  var dataCsPropAllEnvironments = propName === 'data-cs' && state.configTwin.dataCsProp === 'all';
  if (state.isProd && !dataTwPropAllEnvironments && !dataCsPropAllEnvironments) { return; }
  if (propName === 'data-tw' && !state.configTwin.dataTwProp) { return; }
  if (propName === 'data-cs' && !state.configTwin.dataCsProp) { return; } // Append to the existing debug attribute

  var dataProperty = attributes.find( // TODO: Use @babel/plugin-proposal-optional-chaining
  function (p) { return p.node && p.node.name && p.node.name.name === propName; });

  if (dataProperty) {
    try {
      // Existing data prop
      if (dataProperty.node.value.value) {
        dataProperty.node.value.value = "" + ([dataProperty.node.value.value, rawClasses].filter(Boolean).join(' | '));
        return;
      } // New data prop


      dataProperty.node.value.expression.value = "" + ([dataProperty.node.value.expression.value, rawClasses].filter(Boolean).join(' | '));
    } catch (_) {}

    return;
  }

  var classes = formatProp(rawClasses); // Add a new attribute

  path$$1.pushContainer('attributes', t.jSXAttribute(t.jSXIdentifier(propName), t.jSXExpressionContainer(t.stringLiteral(classes))));
};

var isStaticClass = function (className) {
  var staticConfig = get(staticStyles, [className, 'config']);
  var staticConfigOutput = get(staticStyles, [className, 'output']);
  var staticConfigKey = staticConfigOutput ? Object.keys(staticConfigOutput).shift() : null;
  return Boolean(staticConfig || staticConfigKey);
};

var getDynamicProperties = function (className) {
  // Get an array of matches (eg: ['col', 'col-span'])
  var dynamicKeyMatches = Object.keys(dynamicStyles).filter(function (k) { return className.startsWith(k + '-') || className === k; }) || []; // Get the best match from the match array

  var dynamicKey = dynamicKeyMatches.reduce(function (r, match) { return r.length < match.length ? match : r; }, []);
  var dynamicConfig = dynamicStyles[dynamicKey] || {}; // See if the config property is defined

  var isDynamicClass = Boolean(Array.isArray(dynamicConfig) ? dynamicConfig.map(function (item) { return get(item, 'config'); }) : get(dynamicStyles, [dynamicKey, 'config']));
  return {
    isDynamicClass: isDynamicClass,
    dynamicConfig: dynamicConfig,
    dynamicKey: dynamicKey
  };
};

var isEmpty$1 = function (value) { return value === undefined || value === null || typeof value === 'object' && Object.keys(value).length === 0 || typeof value === 'string' && value.trim().length === 0; };

var getProperties = function (className, state, ref) {
  var isCsOnly = ref.isCsOnly; if ( isCsOnly === void 0 ) isCsOnly = false;

  if (!className) { return; }
  var isCss = isShortCss(className);
  if (isCsOnly || isCss) { return {
    hasMatches: isCss,
    type: 'css'
  }; }
  if (isArbitraryCss(className)) { return {
    hasMatches: true,
    type: 'arbitraryCss'
  }; }
  var isStatic = isStaticClass(className);
  var ref$1 = getDynamicProperties(className);
  var isDynamicClass = ref$1.isDynamicClass;
  var dynamicConfig = ref$1.dynamicConfig;
  var dynamicKey = ref$1.dynamicKey;
  var corePlugin = dynamicConfig.plugin;
  var hasUserPlugins = !isEmpty$1(state.config.plugins);
  var type = isStatic && 'static' || isDynamicClass && 'dynamic' || corePlugin && 'corePlugin';
  return {
    type: type,
    corePlugin: corePlugin,
    hasMatches: Boolean(type),
    dynamicKey: dynamicKey,
    dynamicConfig: dynamicConfig,
    hasUserPlugins: hasUserPlugins
  };
};

var stringifyScreen = function (config, screenName) {
  var screen = get(config, ['theme', 'screens', screenName]);

  if (typeof screen === 'undefined') {
    throw new Error(("Couldn’t find Tailwind the screen \"" + screenName + "\" in the Tailwind config"));
  }

  if (typeof screen === 'string') { return ("@media (min-width: " + screen + ")"); }

  if (typeof screen.raw === 'string') {
    return ("@media " + (screen.raw));
  }

  var string = (Array.isArray(screen) ? screen : [screen]).map(function (range) {
    return [typeof range.min === 'string' ? ("(min-width: " + (range.min) + ")") : null, typeof range.max === 'string' ? ("(max-width: " + (range.max) + ")") : null].filter(Boolean).join(' and ');
  }).join(', ');
  return string ? ("@media " + string) : '';
};

var orderByScreens = function (className, state) {
  var classNames = className.match(/\S+/g) || [];
  var screens = Object.keys(state.config.theme.screens);

  var screenCompare = function (a, b) {
    var A = a.includes(':') ? a.split(':')[0] : a;
    var B = b.includes(':') ? b.split(':')[0] : b;
    return screens.indexOf(A) < screens.indexOf(B) ? -1 : 1;
  }; // Tim Sort provides accurate sorting in node < 11
  // https://github.com/ben-rogerson/twin.macro/issues/20


  timSort.sort(classNames, screenCompare);
  return classNames;
};

var variantDarkMode = function (ref) {
  var hasGroupVariant = ref.hasGroupVariant;
  var config = ref.config;
  var errorCustom = ref.errorCustom;

  var styles = {
    // Media strategy: The default when you prepend with dark, tw`dark:block`
    media: '@media (prefers-color-scheme: dark)',
    // Class strategy: In your tailwind.config.js, add `{ dark: 'class' }
    // then add a `className="dark"` on a parent element.
    class: !hasGroupVariant && '.dark &'
  }[config('darkMode') || 'media'] || null;

  if (!styles && !hasGroupVariant) {
    errorCustom("The `darkMode` config option must be either `{ darkMode: 'media' }` (default) or `{ darkMode: 'class' }`");
  }

  return styles;
};

var variantLightMode = function (ref) {
  var hasGroupVariant = ref.hasGroupVariant;
  var config = ref.config;
  var errorCustom = ref.errorCustom;

  var styles = {
    // Media strategy: The default when you prepend with light, tw`light:block`
    media: '@media (prefers-color-scheme: light)',
    // Class strategy: In your tailwind.config.js, add `{ light: 'class' }
    // then add a `className="light"` on a parent element.
    class: !hasGroupVariant && '.light &'
  }[config('lightMode') || config('darkMode') || 'media'] || null;

  if (!styles && !hasGroupVariant) {
    if (config('lightMode')) {
      errorCustom("The `lightMode` config option must be either `{ lightMode: 'media' }` (default) or `{ lightMode: 'class' }`");
    }

    errorCustom("The `darkMode` config option must be either `{ darkMode: 'media' }` (default) or `{ darkMode: 'class' }`");
  }

  return styles;
};

var prefixDarkLightModeClass = function (className, ref) {
  var hasDarkVariant = ref.hasDarkVariant;
  var hasLightVariant = ref.hasLightVariant;
  var config = ref.config;

  var themeVariant = hasDarkVariant && config('darkMode') === 'class' && ['dark ', 'dark'] || hasLightVariant && (config('lightMode') === 'class' || config('darkMode') === 'class') && ['light ', 'light'];
  if (!themeVariant) { return className; }
  return themeVariant.map(function (v) { return className.split(', ').map(function (cn) { return ("." + v + cn); }).join(', '); }).join(', ');
};

/* eslint-disable @typescript-eslint/restrict-plus-operands */
function objectWithoutProperties$1 (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }

var createPeer = function (selector) {
  var selectors = Array.isArray(selector) ? selector : [selector];
  return selectors.map(function (s) { return (".peer:" + s + " ~ &"); }).join(', ');
};

var fullVariantConfig = variantConfig({
  variantDarkMode: variantDarkMode,
  variantLightMode: variantLightMode,
  prefixDarkLightModeClass: prefixDarkLightModeClass,
  createPeer: createPeer
});
/**
 * Validate variants against the variants config key
 */

var validateVariants = function (ref) {
  var variants = ref.variants;
  var state = ref.state;
  var rest$1 = objectWithoutProperties$1( ref, ["variants", "state"] );
  var rest = rest$1;

  if (!variants) { return []; }
  var screens = get(state.config, ['theme', 'screens']);
  var screenNames = Object.keys(screens);
  return variants.map(function (variant) {
    var isResponsive = screenNames && screenNames.includes(variant);
    if (isResponsive) { return stringifyScreen(state.config, variant); }
    var foundVariant = fullVariantConfig[variant];

    if (!foundVariant) {
      var arbitraryVariant = variant.match(/^\[(.+)]/);
      if (arbitraryVariant) { foundVariant = arbitraryVariant[1]; }
    }

    if (!foundVariant) {
      if (variant === 'only-child') {
        throw new babelPluginMacros.MacroError(logGeneralError('The "only-child:" variant was deprecated in favor of "only:"'));
      }

      if (variant === 'not-only-child') {
        throw new babelPluginMacros.MacroError(logGeneralError('The "not-only-child:" variant was deprecated in favor of "not-only:"'));
      }

      var validVariants = Object.assign({}, (screenNames.length > 0 && {
          'Screen breakpoints': screenNames
        }),
        {'Built-in variants': Object.keys(fullVariantConfig)});
      throw new babelPluginMacros.MacroError(logNoVariant(variant, validVariants));
    }

    if (typeof foundVariant === 'function') {
      var context = Object.assign({}, rest,
        {config: function (item) { return state.config[item] || null; },
        errorCustom: function (message) {
          throw new babelPluginMacros.MacroError(logGeneralError(message));
        }});
      foundVariant = foundVariant(context);
    }

    return foundVariant;
  }).filter(Boolean);
};
/**
 * Split the variant(s) from the className
 */


var splitVariants = function (ref) {
  var classNameRaw = ref.classNameRaw;
  var state = ref.state;

  var variantsList = [];
  var variant;
  var className = classNameRaw;

  while (variant !== null) {
    // Match arbitrary variants
    variant = className.match(/^([\d_a-z-]+):|^\[.*?]:/);

    if (variant) {
      className = className.slice(variant[0].length);
      variantsList.push(variant[0].slice(0, -1).replace(new RegExp(SPACE_ID, 'g'), ' '));
    }
  } // dark: and light: variants


  var hasDarkVariant = variantsList.some(function (v) { return v === 'dark'; });
  var hasLightVariant = variantsList.some(function (v) { return v === 'light'; });

  if (hasDarkVariant && hasLightVariant) {
    throw new babelPluginMacros.MacroError(logGeneralError('The light: and dark: variants can’t be used on the same element'));
  }

  var hasGroupVariant = variantsList.some(function (v) { return v.startsWith('group-'); }); // Match the filtered variants

  var variants = validateVariants({
    variants: variantsList,
    state: state,
    hasDarkVariant: hasDarkVariant,
    hasLightVariant: hasLightVariant,
    hasGroupVariant: hasGroupVariant
  });
  var hasVariants = variants.length > 0;
  return {
    classNameRawNoVariants: className,
    className: className,
    // TODO: Hoist the definition for className up, it's buried here
    variants: variants,
    hasVariants: hasVariants
  };
};

var getPeerValueFromVariant = function (variant) { return get(/\.peer:(.+) ~ &/.exec(variant), '1'); };
/**
 * Combine peers when they are used in succession
 */


var combinePeers = function (ref) {
  var variants = ref.variants;

  return variants.map(function (_, i) {
  var isPeer = false;
  var index = i;
  var returnVariant;
  var peerList = [];

  do {
    var peer = getPeerValueFromVariant(variants[index]);
    isPeer = Boolean(peer);

    if (isPeer) {
      peerList.push(peer);
      variants[index] = null;
      index = index + 1;
    } else {
      returnVariant = peerList.length === 0 ? variants[index] : (".peer:" + (peerList.join(':')) + " ~ &");
    }
  } while (isPeer);

  return returnVariant;
}).filter(Boolean);
};

var addSassyPseudo = function (ref) {
  var variants = ref.variants;
  var state = ref.state;

  if (!state.configTwin.sassyPseudo) { return variants; }
  return variants.map(function (v) { return v.replace(/(?<= ):|^:/g, '&:'); });
};

var formatTasks = [combinePeers, addSassyPseudo];

var addVariants = function (ref) {
  var results = ref.results;
  var style = ref.style;
  var pieces = ref.pieces;
  var state = ref.state;

  var variants = pieces.variants;
  var hasVariants = pieces.hasVariants;
  if (!hasVariants) { return style; }

  for (var i = 0, list = formatTasks; i < list.length; i += 1) {
    var task = list[i];

    variants = task({
      variants: variants,
      state: state
    });
  }

  var styleWithVariants = cleanSet(results, variants, Object.assign({}, get(styleWithVariants, variants, {}),
    style));
  return styleWithVariants;
};

function findRightBracket(classes, start, end, brackets) {
  if ( start === void 0 ) start = 0;
  if ( end === void 0 ) end = classes.length;
  if ( brackets === void 0 ) brackets = ['(', ')'];

  var stack = 0;

  for (var index = start; index < end; index++) {
    if (classes[index] === brackets[0]) {
      stack += 1;
    } else if (classes[index] === brackets[1]) {
      if (stack === 0) { return; }
      if (stack === 1) { return index; }
      stack -= 1;
    }
  }
} // eslint-disable-next-line max-params


function spreadVariantGroups(classes, context, importantContext, start, end) {
  if ( context === void 0 ) context = '';
  if ( importantContext === void 0 ) importantContext = false;
  if ( start === void 0 ) start = 0;

  if (classes === '') { return []; }
  var results = [];
  classes = classes.slice(start, end).trim(); // variant / class / group

  var reg = /(\[.*?]:|[\w-]+:)|([\w-./[\]]+!?)|\(|(\S+)/g;
  var match;
  var baseContext = context;

  while (match = reg.exec(classes)) {
    var variant = match[1];
    var className = match[2];
    var weird = match[3];

    if (variant) {
      // Replace arbitrary variant spaces with a placeholder to avoid incorrect splitting
      var spaceReplacedVariant = variant.replace(/\s+/g, SPACE_ID);
      context += spaceReplacedVariant; // Skip empty classes

      if (/\s/.test(classes[reg.lastIndex])) {
        context = baseContext;
        continue;
      }

      if (classes[reg.lastIndex] === '(') {
        var closeBracket = findRightBracket(classes, reg.lastIndex);
        throwIf(typeof closeBracket !== 'number', function () { return logGeneralError(("An ending bracket ')' wasn’t found for these classes:\n\n" + classes)); });
        var importantGroup = classes[closeBracket + 1] === '!';
        results.push.apply(results, spreadVariantGroups(classes, context, importantContext || importantGroup, reg.lastIndex + 1, closeBracket));
        reg.lastIndex = closeBracket + (importantGroup ? 2 : 1);
        context = baseContext;
      }
    } else if (className && className.includes('[')) {
      var closeBracket$1 = findRightBracket(classes, match.index, classes.length, ['[', ']']);
      throwIf(typeof closeBracket$1 !== 'number', function () { return logGeneralError(("An ending bracket ']' wasn’t found for these classes:\n\n" + classes)); });
      var importantGroup$1 = classes[closeBracket$1 + 1] === '!';
      var cssClass = classes.slice(match.index, closeBracket$1 + 1); // Convert spaces in classes to a temporary string so the css won't be
      // split into multiple classes

      var spaceReplacedClass = cssClass // Normalise the spacing - single spaces only
      // Replace spaces with the space id stand-in
      // Remove newlines within the brackets to allow multiline values
      .replace(/\s+/g, SPACE_ID);
      results.push(context + spaceReplacedClass + (importantGroup$1 || importantContext ? '!' : ''));
      reg.lastIndex = closeBracket$1 + (importantGroup$1 ? 2 : 1);
      context = baseContext;
    } else if (className) {
      var tail = !className.endsWith('!') && importantContext ? '!' : '';
      results.push(context + className + tail);
      context = baseContext;
    } else if (weird) {
      results.push(context + weird);
    } else {
      var closeBracket$2 = findRightBracket(classes, match.index);
      throwIf(typeof closeBracket$2 !== 'number', function () { return logGeneralError(("An ending bracket ')' wasn’t found for these classes:\n\n" + classes)); });
      var importantGroup$2 = classes[closeBracket$2 + 1] === '!';
      results.push.apply(results, spreadVariantGroups(classes, context, importantContext || importantGroup$2, match.index + 1, closeBracket$2));
      reg.lastIndex = closeBracket$2 + (importantGroup$2 ? 2 : 1);
    }
  }

  return results;
}

var handleVariantGroups = function (classes) { return spreadVariantGroups(classes).join(' '); };

/**
 * Add important to a value
 * Only used for static and dynamic styles - not core plugins
 */

var mergeImportant = function (style, hasImportant) {
  if (!hasImportant) { return style; } // Bail if the ruleset already has an important

  if (JSON.stringify(style).includes(' !important')) { return style; }
  return Object.entries(style).reduce(function (result, item) {
    var obj;

    var key = item[0];
    var value = item[1];
    if (typeof value === 'object') { return mergeImportant(value, hasImportant); } // Don't add important to css variables

    var newValue = key.startsWith('--') ? value : (value + " !important");
    return deepMerge(result, ( obj = {}, obj[key] = newValue, obj ));
  }, {});
};
/**
 * Split the important from the className
 */


var splitImportant = function (ref) {
  var className = ref.className;

  var hasPrefix = className.slice(0, 1) === '!';
  var hasSuffix = className.slice(-1) === '!';
  var hasImportant = hasSuffix || hasPrefix;

  if (hasImportant) {
    className = hasSuffix ? className.slice(0, -1) : className.slice(1);
  }

  var important = hasImportant ? ' !important' : '';
  return {
    className: className,
    hasImportant: hasImportant,
    important: important
  };
};

/**
 * Split the negative from the className
 */

var splitNegative = function (ref) {
  var className = ref.className;

  var hasNegative = !isShortCss(className) && !isArbitraryCss(className) && className.slice(0, 1) === '-'; // TODO: Look in deprecating the negative prefix removal

  if (hasNegative) {
    className = className.slice(1, className.length);
  }

  var negative = hasNegative ? '-' : '';
  return {
    className: className,
    hasNegative: hasNegative,
    negative: negative
  };
};

var splitPrefix = function (props) {
  var className = props.className;
  var state = props.state;
  var ref = state.config;
  var prefix = ref.prefix;
  if (!prefix) { return {
    className: className,
    hasPrefix: false
  }; }
  if (!className.startsWith(prefix)) { return {
    className: className,
    hasPrefix: false
  }; }
  var newClassName = className.slice(prefix.length);
  return {
    className: newClassName,
    hasPrefix: true
  };
};

var getAlphaValue = function (alpha) { return Number.isInteger(Number(alpha)) ? Number(alpha) / 100 : alpha; };

var splitAlpha = function (props) {
  var className = props.className;
  var slashIdx = className.lastIndexOf('/');
  throwIf(slashIdx === className.length - 1, function () { return logGeneralError(("The class “" + className + "” can’t end with a slash")); });
  if (slashIdx === -1) { return {
    className: className
  }; }
  var rawAlpha = className.slice(Number(slashIdx) + 1);
  var hasAlphaArbitrary = Boolean(rawAlpha[0] === '[' && rawAlpha[rawAlpha.length - 1] === ']');
  var shouldQueueOpacityError = !hasAlphaArbitrary && !get(props, 'state.config.theme.opacity')[rawAlpha];
  return {
    alpha: hasAlphaArbitrary ? rawAlpha.slice(1, -1) : getAlphaValue(rawAlpha),
    classNameNoSlashAlpha: className.slice(0, slashIdx),
    hasAlpha: true,
    hasAlphaArbitrary: hasAlphaArbitrary,
    // Queue a validation error for later if the class isn't directly matched
    alphaError: shouldQueueOpacityError && (function () { return opacityErrorNotFound({
      className: className.slice(0, slashIdx),
      theme: get(props, 'state.config.theme.opacity'),
      opacity: rawAlpha
    }); })
  };
};

var splitters = [splitVariants, splitPrefix, splitNegative, splitImportant, splitAlpha // Keep after splitImportant
];
var getPieces = (function (context) {
  var results = splitters.reduce(function (results, splitter) { return (Object.assign({}, results,
    splitter(results))); }, context);
  delete results.state;
  return results;
});

var precheckGroup = function (ref) {
  var classNameRaw = ref.classNameRaw;

  return throwIf(classNameRaw === 'group', function () { return ("\n\n\"group\" must be added as className:" + (logBadGood('tw`group`', '<div className="group">')) + "\nRead more at https://twinredirect.page.link/group\n"); });
};

var precheckPeer = function (ref) {
  var classNameRaw = ref.classNameRaw;

  return throwIf(classNameRaw === 'peer', function () { return ("\n\n\"peer\" must be added as className:" + (logBadGood('tw`peer`', '<div className="peer">')) + "\nRead more at https://twinredirect.page.link/peer\n"); });
};

var joinWithNoDoubleHyphens = function (arr) { return arr.join('-').replace(/-+/g, '-'); };

var preCheckPrefix = function (ref) {
  var ref_pieces = ref.pieces;
  var className = ref_pieces.className;
  var hasPrefix = ref_pieces.hasPrefix;
  var state = ref.state;

  if (isShortCss(className)) { return; }
  var ref$1 = state.config;
  var prefix = ref$1.prefix;
  if (hasPrefix === Boolean(prefix)) { return; }
  var classSuggestion = joinWithNoDoubleHyphens([prefix, className]);
  throwIf(!className.startsWith(prefix), function () { return ("\n\n“" + className + "” should have a prefix:" + (logBadGood(className, classSuggestion))); });
};

var preCheckNoHyphenSuffix = function (ref) {
  var ref_pieces = ref.pieces;
  var className = ref_pieces.className;
  var classNameRaw = ref_pieces.classNameRaw;

  if (isShortCss(className)) { return; }
  throwIf(classNameRaw.endsWith('-'), function () { return logBadGood(("“" + className + "” should not have a '-' suffix"), ("Change it to “" + (className.replace(/-*$/, '')) + "”")); });
};

var doPrechecks = function (prechecks, context) {
  for (var i = 0, list = prechecks; i < list.length; i += 1) {
    var precheck = list[i];

    precheck(context);
  }
};

var precheckExports = ({
  default: doPrechecks,
  precheckGroup: precheckGroup,
  precheckPeer: precheckPeer,
  preCheckPrefix: preCheckPrefix,
  preCheckNoHyphenSuffix: preCheckNoHyphenSuffix
});

var gridCompare = function (a, b) {
  // The order of grid properties matter when combined into a single object
  // So here we move col-span-x to the beginning to avoid being trumped
  // https://github.com/ben-rogerson/twin.macro/issues/363
  var A = /(^|:)col-span-/.test(a) ? -1 : 0;
  var B = /(^|:)col-span-/.test(b) ? -1 : 0;
  return A - B;
};

var orderGridProperty = function (className) {
  var classNames = className.match(/\S+/g) || []; // Tim Sort provides accurate sorting in node < 11
  // https://github.com/ben-rogerson/twin.macro/issues/20

  timSort.sort(classNames, gridCompare);
  return classNames.join(' ');
};

var transitionCompare = function (a, b) {
  // The order of transition properties matter when combined into a single object
  // So here we move transition-x to the beginning to avoid being trumped
  // https://github.com/ben-rogerson/twin.macro/issues/363
  var A = /(^|:)transition(!|$)/.test(a) ? -1 : 0;
  var B = /(^|:)transition(!|$)/.test(b) ? -1 : 0;
  return A - B;
};

var orderTransitionProperty = function (className) {
  var classNames = className.match(/\S+/g) || []; // Tim Sort provides accurate sorting in node < 11
  // https://github.com/ben-rogerson/twin.macro/issues/20

  timSort.sort(classNames, transitionCompare);
  return classNames.join(' ');
};

var transformCompare = function (a, b) {
  // The order of transform properties matter when combined into a single object
  // So here we move transform to the beginning to avoid being trumped
  // https://github.com/ben-rogerson/twin.macro/issues/363
  var A = /(^|:)transform(!|$)/.test(a) ? -1 : 0;
  var B = /(^|:)transform(!|$)/.test(b) ? -1 : 0;
  return A - B;
};

var orderTransformProperty = function (className) {
  var classNames = className.match(/\S+/g) || []; // Tim Sort provides accurate sorting in node < 11
  // https://github.com/ben-rogerson/twin.macro/issues/20

  timSort.sort(classNames, transformCompare);
  return classNames.join(' ');
};

var ringCompare = function (a, b) {
  // The order of ring properties matter when combined into a single object
  // So here we move ring-opacity-xxx to the end to avoid being trumped
  // https://github.com/ben-rogerson/twin.macro/issues/374
  var A = /(^|:)ring-opacity-/.test(a) ? 0 : -1;
  var B = /(^|:)ring-opacity-/.test(b) ? 0 : -1;
  return A - B;
};

var orderRingProperty = function (className) {
  var classNames = className.match(/\S+/g) || []; // Tim Sort provides accurate sorting in node < 11
  // https://github.com/ben-rogerson/twin.macro/issues/20

  timSort.sort(classNames, ringCompare);
  return classNames.join(' ');
};

var bgOpacityCompare = function (a, b) {
  // The order of bg-opacity matters when combined into a single object
  // So we move bg-opacity-xxx to the end to avoid being trumped by the bg color
  var A = /(^|:)bg-opacity-/.test(a) ? 0 : -1;
  var B = /(^|:)bg-opacity-/.test(b) ? 0 : -1;
  return A - B;
};

var orderBgOpacityProperty = function (className) {
  var classNames = className.match(/\S+/g) || []; // Tim Sort provides accurate sorting in node < 11
  // https://github.com/ben-rogerson/twin.macro/issues/20

  timSort.sort(classNames, bgOpacityCompare);
  return classNames.join(' ');
};

var compare = function (a, b) {
  // The order of grid properties matter when combined into a single object
  // So here we move backdrop-filter to the beginning to avoid being trumped
  // https://github.com/ben-rogerson/twin.macro/issues/363
  var A = /(^|:)backdrop-filter/.test(a) ? -1 : 0;
  var B = /(^|:)backdrop-filter/.test(b) ? -1 : 0;
  return A - B;
};

var orderBackdropProperty = function (className) {
  var classNames = className.match(/\S+/g) || []; // Tim Sort provides accurate sorting in node < 11
  // https://github.com/ben-rogerson/twin.macro/issues/20

  timSort.sort(classNames, compare);
  return classNames.join(' ');
};

var compare$1 = function (a, b) {
  // The order of grid properties matter when combined into a single object
  // So here we move filter to the beginning to avoid being trumped
  // https://github.com/ben-rogerson/twin.macro/issues/363
  var A = /(^|:)filter/.test(a) ? -1 : 0;
  var B = /(^|:)filter/.test(b) ? -1 : 0;
  return A - B;
};

var orderFilterProperty = function (className) {
  var classNames = className.match(/\S+/g) || []; // Tim Sort provides accurate sorting in node < 11
  // https://github.com/ben-rogerson/twin.macro/issues/20

  timSort.sort(classNames, compare$1);
  return classNames.join(' ');
};

var addContentClass = function (classes) {
  var newClasses = [];
  classes.forEach(function (classSet) {
    var shouldAddContent = /(?!.*:content($|\[))(before:|after:)/.test(classSet);
    if (!shouldAddContent) { return newClasses.push(classSet); }
    var variants = classSet.split(':').slice(0, -1).join(':'); // Avoid adding content if it's already in the new class list

    if (!newClasses.some(function (c) { return c.startsWith((variants + ":content")); })) { newClasses.push((variants + ":content")); }
    newClasses.push(classSet);
  });
  return newClasses;
};

var transformImportant = function (ref) {
  var style = ref.style;
  var hasImportant = ref.pieces.hasImportant;

  return mergeImportant(style, hasImportant);
};

var applyTransforms = function (context) {
  var style = context.style;
  var type = context.type;
  if (!style) { return; }
  var result = context.style;
  if (type !== 'corePlugin') { result = transformImportant(context); }
  return result;
};

var mergeChecks = [// Match exact selector
function (ref) {
  var key = ref.key;
  var className = ref.className;
  var prefix = ref.prefix;

  return key === ("" + prefix + className);
}, // Match class selector (inc dot)
function (ref) {
  var key = ref.key;
  var className = ref.className;
  var prefix = ref.prefix;

  return !key.includes('{{') && key.match(new RegExp(("(?:^|>|~|\\+|\\*| )\\." + prefix + className + "(?: |>|~|\\+|\\*|:|$)"), 'g'));
}, // Match parent selector placeholder
function (ref) {
  var key = ref.key;
  var className = ref.className;
  var prefix = ref.prefix;

  return key.includes(("{{" + prefix + className + "}}"));
}, // Match possible symbols after the selector (ex dot)
function (ref) {
  var key = ref.key;
  var className = ref.className;
  var prefix = ref.prefix;

  return [' ', ':', '>', '~', '+', '*'].some(function (suffix) { return key.startsWith(("" + prefix + className + suffix)); });
}];

var getMatches = function (ref) {
  var className = ref.className;
  var data = ref.data;
  var sassyPseudo = ref.sassyPseudo;
  var state = ref.state;

  return Object.entries(data).reduce(function (result, item) {
  var obj, obj$1;

  var rawKey = item[0];
  var value = item[1]; // Remove the prefix before attempting match

  var ref = splitPrefix({
    className: rawKey,
    state: state
  });
  var key = ref.className;
  key = key.replace(/\\/g, '');
  var childValue = Object.values(value)[0];
  var hasChildNesting = !Array.isArray(childValue) && typeof childValue === 'object';

  if (hasChildNesting) {
    var matches = getMatches({
      className: className,
      data: value,
      sassyPseudo: sassyPseudo,
      state: state
    });
    if (!isEmpty(matches)) { return Object.assign({}, result,
      ( obj = {}, obj[key] = matches, obj )); }
  }

  var ref$1 = state.config;
  var prefix = ref$1.prefix;
  var shouldMergeValue = mergeChecks.some(function (item) { return item({
    key: key,
    value: value,
    className: className,
    data: data,
    prefix: prefix
  }); });

  if (shouldMergeValue) {
    var newKey = formatKey(key, {
      className: className,
      sassyPseudo: sassyPseudo,
      prefix: prefix
    });
    return newKey ? Object.assign({}, result,
      ( obj$1 = {}, obj$1[newKey] = value, obj$1 )) : Object.assign({}, result,
      value);
  }

  return result;
}, {});
}; // The key gets formatted with these checks


var formatTasks$1 = [function (ref) {
  var key = ref.key;

  return key.replace(/\\/g, '').trim();
}, // Match exact selector
function (ref) {
  var key = ref.key;
  var className = ref.className;
  var prefix = ref.prefix;

  return key === ("." + prefix + className) ? '' : key;
}, // Replace the parent selector placeholder
function (ref) {
  var key = ref.key;
  var className = ref.className;
  var prefix = ref.prefix;

  var parentSelectorIndex = key.indexOf(("{{" + prefix + className + "}}"));
  var replacement = parentSelectorIndex > 0 ? '&' : '';
  return key.replace(("{{" + prefix + className + "}}"), replacement);
}, // Strip prefix
function (ref) {
  var key = ref.key;
  var prefix = ref.prefix;

  return !prefix ? key : key.replace(new RegExp(("{{" + prefix), 'g'), "{{");
}, // Replace the classname at start of selector (eg: &:hover) (postCSS supplies
// flattened selectors so it looks like .blah:hover at this point)
function (ref) {
  var key = ref.key;
  var className = ref.className;
  var prefix = ref.prefix;

  return key.startsWith(("." + prefix + className)) ? key.slice(("." + prefix + className).length) : key;
}, function (ref) {
  var key = ref.key;

  return key.trim();
}, // Add the parent selector at the start when it has the sassy pseudo enabled
function (ref) {
  var key = ref.key;
  var sassyPseudo = ref.sassyPseudo;

  return sassyPseudo && key.startsWith(':') ? ("&" + key) : key;
}, // Remove the unmatched class wrapping
function (ref) {
  var key = ref.key;

  return key.replace(/{{/g, '.').replace(/}}/g, '');
}];

var formatKey = function (selector, ref) {
  var className = ref.className;
  var sassyPseudo = ref.sassyPseudo;
  var prefix = ref.prefix;

  if (selector === className) { return; }
  var key = selector;

  for (var i = 0, list = formatTasks$1; i < list.length; i += 1) {
    var task = list[i];

    key = task({
      key: key,
      className: className,
      sassyPseudo: sassyPseudo,
      prefix: prefix
    });
  }

  return key;
};
/**
 * Split grouped selectors (`.class1, class2 {}`) and filter non-selectors
 * @param {object} data Input object from userPluginData
 * @returns {object} An object containing unpacked selectors
 */


var normalizeUserPluginSelectors = function (data) { return Object.entries(data).reduce(function (result, ref) {
  var selector = ref[0];
  var value = ref[1];

  var keys = selector.split(',').filter(function (s) { return isMediaQuery(s) ? Object.keys(value).some(function (selector) { return isClass(selector); }) : isClass(s); }).reduce(function (result, property) {
    var obj;

    return (Object.assign({}, result,
    ( obj = {}, obj[property] = value, obj )));
  }, {});
  return Object.assign({}, result,
    keys);
}, {}); };

var handleUserPlugins = (function (ref) {
  var ref_state = ref.state;
  var sassyPseudo = ref_state.configTwin.sassyPseudo;
  var ref_state_userPluginData = ref_state.userPluginData;
  var base = ref_state_userPluginData.base;
  var components = ref_state_userPluginData.components;
  var utilities = ref_state_userPluginData.utilities;
  var state = ref.state;
  var className = ref.className;

  var result;
  [base, components, utilities].find(function (rawData) {
    var data = normalizeUserPluginSelectors(rawData);
    var matches = getMatches({
      className: className,
      data: data,
      sassyPseudo: sassyPseudo,
      state: state
    });
    var hasMatches = !isEmpty(matches);
    result = hasMatches ? matches : result;
    return hasMatches;
  });
  return result;
});

var handleStatic = (function (ref) {
  var pieces = ref.pieces;

  var className = pieces.className;
  return get(staticStyles, [className, 'output']);
});

var normalizeValue = function (value) {
  if (['string', 'function'].includes(typeof value) || Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  logGeneralError(("The config value \"" + (JSON.stringify(value)) + "\" is unsupported - try a string, function, array, or number"));
};

var splitAtDash = function (twClass, fromEnd) {
  if ( fromEnd === void 0 ) fromEnd = 1;

  var splitClass = twClass.split('-');
  return {
    firstPart: splitClass.slice(0, fromEnd * -1).join('-'),
    lastPart: splitClass.slice(fromEnd * -1).join('-')
  };
};
/**
 * Searches the tailwindConfig
 */


var getConfigValue = function (from, matcher) {
  if (!from) { return; } // Match default value from current object

  if (isEmpty(matcher)) {
    if (isEmpty(from.DEFAULT)) { return; }
    return normalizeValue(from.DEFAULT);
  } // Match exact


  var match = from[matcher];

  if (['string', 'number', 'function'].includes(typeof match) || Array.isArray(match)) {
    return normalizeValue(match);
  } // Match a default value from child object


  var defaultMatch = typeof match === 'object' && match.DEFAULT;

  if (defaultMatch) {
    return normalizeValue(defaultMatch);
  } // A weird loop is used below so the return busts out of the parent


  var index = 1;
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */

  for (var i$1 = 0, list = matcher.split('-'); i$1 < list.length; i$1 += 1) {

    var ref = splitAtDash(matcher, index);
    var firstPart = ref.firstPart;
    var lastPart = ref.lastPart;
    var objectMatch = from[firstPart];

    if (objectMatch && typeof objectMatch === 'object') {
      return getConfigValue(objectMatch, lastPart);
    }

    index = index + 1;
  }
};

var maybeAddNegative = function (value, negative) {
  if (!negative) { return value; }
  return isNumeric(value.slice(0, 1)) ? ("" + negative + value) : value;
};

var styleify = function (ref) {
  var obj;

  var property = ref.property;
  var value = ref.value;
  var negative = ref.negative;
  value = Array.isArray(value) ? value.join(', ') : maybeAddNegative(value, negative);
  return Array.isArray(property) ? property.reduce(function (results, item) {
    var obj;

    return (Object.assign({}, results,
    ( obj = {}, obj[item] = value, obj )));
  }, {}) : ( obj = {}, obj[property] = value, obj );
};

var handleDynamic = (function (ref) {
  var theme = ref.theme;
  var pieces = ref.pieces;
  var state = ref.state;
  var dynamicKey = ref.dynamicKey;
  var dynamicConfig = ref.dynamicConfig;

  var className = pieces.className;
  var negative = pieces.negative;

  var getConfig = function (ref) {
    var config = ref.config;
    var configFallback = ref.configFallback;

    return config && theme(config) || configFallback && theme(configFallback);
  };

  var styleSet = Array.isArray(dynamicConfig) ? dynamicConfig : [dynamicConfig];
  var piece = className.slice(Number(dynamicKey.length) + 1);
  var key = [negative, piece].join('');
  var results;
  styleSet.find(function (item) {
    var value = getConfigValue(getConfig(item), key);

    if (value) {
      results = typeof item.value === 'function' ? item.value({
        value: value,
        transparentTo: transparentTo
      }) : styleify({
        property: item.prop,
        value: value,
        negative: negative
      });
    }

    return value;
  });
  throwIf(!results || className.endsWith('-'), function () { return errorSuggestions({
    pieces: pieces,
    state: state,
    config: styleSet.map(function (item) { return item.config; }) || [],
    dynamicKey: dynamicKey
  }); });
  return results;
});

var getColor = function (ref) {
  var configTwin = ref.configTwin;
  var matchConfigValue = ref.matchConfigValue;
  var pieces = ref.pieces;

  return function (colors) {
  var result;
  colors.find(function (ref) {
    var matchStart = ref.matchStart;
    var property = ref.property;
    var configSearch = ref.configSearch;
    var opacityVariable = ref.opacityVariable;
    var useSlashAlpha = ref.useSlashAlpha;

    // Disable slash alpha matching when a variable is supplied.
    // For classes that use opacity classes 'bg-opacity-50'.
    if (useSlashAlpha === undefined) {
      useSlashAlpha = !opacityVariable;
    }

    var color = matchConfigValue(configSearch, ("(?<=(" + matchStart + "-))([^]*)" + (useSlashAlpha ? "(?=/)" : '')));
    if (!color) { return false; } // Avoid using --tw-xxx variables if color variables are disabled

    if (configTwin.disableColorVariables) {
      useSlashAlpha = true;
    }

    var newColor = withAlpha({
      pieces: pieces,
      property: property,
      variable: opacityVariable,
      useSlashAlpha: useSlashAlpha,
      color: color
    });
    if (newColor) { result = newColor; }
    return newColor;
  });
  return result;
};
};

var backdropBlur = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(backdrop-blur)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('backdropBlur');

  if (!value) {
    errorSuggestions({
      config: ['backdropBlur']
    });
  }

  var backdropBlurValue = Array.isArray(value) ? value.map(function (v) { return ("blur(" + v + ")"); }).join(' ') : ("blur(" + value + ")");
  return {
    '--tw-backdrop-blur': backdropBlurValue,
    backdropFilter: ("var(--tw-backdrop-filter)" + important)
  };
});

var backdropBrightness = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(backdrop-brightness)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('backdropBrightness');

  if (!value) {
    errorSuggestions({
      config: ['backdropBrightness']
    });
  }

  var backdropBrightnessValue = Array.isArray(value) ? value.map(function (v) { return ("brightness(" + v + ")"); }).join(' ') : ("brightness(" + value + ")");
  return {
    '--tw-backdrop-brightness': backdropBrightnessValue,
    backdropFilter: ("var(--tw-backdrop-filter)" + important)
  };
});

var backdropContrast = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(backdrop-contrast)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('backdropContrast');

  if (!value) {
    errorSuggestions({
      config: ['backdropContrast']
    });
  }

  var backdropContrastValue = Array.isArray(value) ? value.map(function (v) { return ("contrast(" + v + ")"); }).join(' ') : ("contrast(" + value + ")");
  return {
    '--tw-backdrop-contrast': backdropContrastValue,
    backdropFilter: ("var(--tw-backdrop-filter)" + important)
  };
});

var backdropGrayscale = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(backdrop-grayscale)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('backdropGrayscale');

  if (!value) {
    errorSuggestions({
      config: ['backdropGrayscale']
    });
  }

  var backdropGrayscaleValue = Array.isArray(value) ? value.map(function (v) { return ("grayscale(" + v + ")"); }).join(' ') : ("grayscale(" + value + ")");
  return {
    '--tw-backdrop-grayscale': backdropGrayscaleValue,
    backdropFilter: ("var(--tw-backdrop-filter)" + important)
  };
});

var backdropHueRotate = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var properties_pieces = properties.pieces;
  var negative = properties_pieces.negative;
  var important = properties_pieces.important;
  var errorSuggestions = properties.errors.errorSuggestions;
  var classValue = match(/(?<=(backdrop-hue-rotate)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('backdropHueRotate');

  if (!value) {
    errorSuggestions({
      config: ['backdropHueRotate']
    });
  }

  var backdrophueRotateValue = Array.isArray(value) ? value.map(function (v) { return ("hue-rotate(" + negative + v + ")"); }).join(' ') : ("hue-rotate(" + negative + value + ")");
  return {
    '--tw-backdrop-hue-rotate': backdrophueRotateValue,
    backdropFilter: ("var(--tw-backdrop-filter)" + important)
  };
});

var backdropInvert = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(backdrop-invert)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('backdropInvert');

  if (!value) {
    errorSuggestions({
      config: ['backdropInvert']
    });
  }

  var backdropInvertValue = Array.isArray(value) ? value.map(function (v) { return ("invert(" + v + ")"); }).join(' ') : ("invert(" + value + ")");
  return {
    '--tw-backdrop-invert': backdropInvertValue,
    backdropFilter: ("var(--tw-backdrop-filter)" + important)
  };
});

var backdropOpacity = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(backdrop-opacity)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('backdropOpacity');

  if (!value) {
    errorSuggestions({
      config: ['backdropOpacity']
    });
  }

  var backdropOpacityValue = Array.isArray(value) ? value.map(function (v) { return ("opacity(" + v + ")"); }).join(' ') : ("opacity(" + value + ")");
  return {
    '--tw-backdrop-opacity': backdropOpacityValue,
    backdropFilter: ("var(--tw-backdrop-filter)" + important)
  };
});

var backdropSaturate = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(backdrop-saturate)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('backdropSaturate');

  if (!value) {
    errorSuggestions({
      config: ['backdropSaturate']
    });
  }

  var backdropSaturateValue = Array.isArray(value) ? value.map(function (v) { return ("saturate(" + v + ")"); }).join(' ') : ("saturate(" + value + ")");
  return {
    '--tw-backdrop-saturate': backdropSaturateValue,
    backdropFilter: ("var(--tw-backdrop-filter)" + important)
  };
});

var backdropSepia = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(backdrop-sepia)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('backdropSepia');

  if (!value) {
    errorSuggestions({
      config: ['backdropSepia']
    });
  }

  var backdropSepiaValue = Array.isArray(value) ? value.map(function (v) { return ("sepia(" + v + ")"); }).join(' ') : ("sepia(" + value + ")");
  return {
    '--tw-backdrop-sepia': backdropSepiaValue,
    backdropFilter: ("var(--tw-backdrop-filter)" + important)
  };
});

var handleColor$1 = function (ref) {
  var toColor = ref.toColor;

  var common = {
    matchStart: 'bg',
    property: 'backgroundColor',
    configSearch: 'backgroundColor'
  };
  return toColor([Object.assign({}, common,
    {opacityVariable: '--tw-bg-opacity'}), common]);
};

var handleSize = function (ref) {
  var configValue = ref.configValue;
  var important = ref.important;

  var value = configValue('backgroundSize');
  if (!value) { return; }
  return {
    backgroundSize: ("" + value + important)
  };
};

var handlePosition = function (ref) {
  var configValue = ref.configValue;
  var important = ref.important;

  var value = configValue('backgroundPosition');
  if (!value) { return; }
  return {
    backgroundPosition: ("" + value + important)
  };
};

var handleImage = function (ref) {
  var configValue = ref.configValue;
  var important = ref.important;

  var value = configValue('backgroundImage');
  if (!value) { return; }
  return {
    backgroundImage: ("" + value + important)
  };
};

var bg = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var toColor = properties.toColor;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var color = handleColor$1({
    toColor: toColor
  });
  if (color) { return color; }
  var classValue = match(/(?<=(bg)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var size = handleSize({
    configValue: configValue,
    important: important
  });
  if (size) { return size; }
  var position = handlePosition({
    configValue: configValue,
    important: important
  });
  if (position) { return position; }
  var image = handleImage({
    configValue: configValue,
    important: important
  });
  if (image) { return image; }
  errorSuggestions({
    config: ['backgroundColor', 'backgroundSize', 'backgroundPosition', 'backgroundImage']
  });
});

var blur = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(blur)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('blur');

  if (!value) {
    errorSuggestions({
      config: ['blur']
    });
  }

  var blurValue = Array.isArray(value) ? value.map(function (v) { return ("blur(" + v + ")"); }).join(' ') : ("blur(" + value + ")");
  return {
    '--tw-blur': blurValue,
    filter: ("var(--tw-filter)" + important)
  };
});

var borderWidthConfig = [{
  property: 'borderTopWidth',
  value: function (regex) { return regex(/(?<=(border-t(-|$)))([^]*)/); }
}, {
  property: 'borderRightWidth',
  value: function (regex) { return regex(/(?<=(border-r(-|$)))([^]*)/); }
}, {
  property: 'borderBottomWidth',
  value: function (regex) { return regex(/(?<=(border-b(-|$)))([^]*)/); }
}, {
  property: 'borderLeftWidth',
  value: function (regex) { return regex(/(?<=(border-l(-|$)))([^]*)/); }
}, {
  property: 'borderWidth',
  value: function (regex) { return regex(/(?<=(border(-|$)))([^]*)/); }
}];
var borderColorConfig = [{
  matchStart: 'border-t',
  property: 'borderTopColor'
}, {
  matchStart: 'border-r',
  property: 'borderRightColor'
}, {
  matchStart: 'border-b',
  property: 'borderBottomColor'
}, {
  matchStart: 'border-l',
  property: 'borderLeftColor'
}, {
  matchStart: 'border',
  property: 'borderColor'
}];

var getCommonColorConfig = function (ref) {
  var matchStart = ref.matchStart;
  var property = ref.property;

  return ({
  matchStart: matchStart,
  property: property,
  configSearch: 'borderColor'
});
};

var border = (function (properties) {
  var obj;

  var matchConfigValue = properties.matchConfigValue;
  var toColor = properties.toColor;
  var important = properties.pieces.important;
  var errorSuggestions = properties.errors.errorSuggestions;

  var getBorderWidthByRegex = function (regex) { return matchConfigValue('borderWidth', regex); };

  for (var i = 0, list = borderWidthConfig; i < list.length; i += 1) {
    var task = list[i];

    var value = task.value(getBorderWidthByRegex);
    if (value) { return ( obj = {}, obj[task.property] = ("" + value + important), obj ); }
  }

  for (var i$1 = 0, list$1 = borderColorConfig; i$1 < list$1.length; i$1 += 1) {
    var task$1 = list$1[i$1];

    var common = getCommonColorConfig(task$1);
    var value$1 = toColor([Object.assign({}, common,
      {opacityVariable: '--tw-border-opacity'}), common]);
    if (value$1) { return value$1; }
  }

  errorSuggestions({
    config: ['borderColor', 'borderWidth']
  });
});

var brightness = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(brightness)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('brightness');

  if (!value) {
    errorSuggestions({
      config: ['brightness']
    });
  }

  var brightnessValue = Array.isArray(value) ? value.map(function (v) { return ("brightness(" + v + ")"); }).join(' ') : ("brightness(" + value + ")");
  return {
    '--tw-brightness': brightnessValue,
    filter: ("var(--tw-filter)" + important)
  };
});

var caretColor = (function (properties) {
  var common = {
    matchStart: 'caret',
    property: 'caretColor',
    configSearch: 'caretColor'
  };
  var color = properties.toColor([Object.assign({}, common,
    {useSlashAlpha: false}), common]);
  if (!color) { properties.errors.errorSuggestions({
    config: 'caretColor'
  }); }
  return color;
});

var contrast = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(contrast)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('contrast');

  if (!value) {
    errorSuggestions({
      config: ['contrast']
    });
  }

  var contrastValue = Array.isArray(value) ? value.map(function (v) { return ("contrast(" + v + ")"); }).join(' ') : ("contrast(" + value + ")");
  return {
    '--tw-contrast': contrastValue,
    filter: ("var(--tw-filter)" + important)
  };
});

var properties = function (type) { return ({
  left: (type + "Left"),
  right: (type + "Right")
}); };

var getSpacingFromArray = function (ref) {
  var obj;

  var values = ref.values;
  var left = ref.left;
  var right = ref.right;
  if (!Array.isArray(values)) { return; }
  var valueLeft = values[0];
  var valueRight = values[1];
  return ( obj = {}, obj[left] = valueLeft, obj[right] = valueRight, obj );
};

var getSpacingStyle = function (type, values, key) {
  var obj;

  if (Array.isArray(values) || typeof values !== 'object') { return; }
  var propertyValue = values[key] || {};
  if (isEmpty(propertyValue)) { return; }
  var objectArraySpacing = getSpacingFromArray(Object.assign({}, {values: propertyValue},
    properties(type)));
  if (objectArraySpacing) { return objectArraySpacing; }
  return ( obj = {}, obj[properties(type).left] = propertyValue, obj[properties(type).right] = propertyValue, obj );
};

var container = (function (ref) {
  var ref_pieces = ref.pieces;
  var hasImportant = ref_pieces.hasImportant;
  var hasNegative = ref_pieces.hasNegative;
  var ref_errors = ref.errors;
  var errorNoImportant = ref_errors.errorNoImportant;
  var errorNoNegatives = ref_errors.errorNoNegatives;
  var theme = ref.theme;

  hasImportant && errorNoImportant();
  hasNegative && errorNoNegatives();
  var ref$1 = theme();
  var container = ref$1.container;
  var screensRaw = ref$1.screens;
  var padding = container.padding;
  var margin = container.margin;
  var center = container.center;
  var screens = container.screens || screensRaw;
  var mediaScreens = Object.entries(screens).reduce(function (accumulator, ref) {
    var obj;

    var key = ref[0];
    var rawValue = ref[1];
    var value = typeof rawValue === 'object' ? rawValue.min || rawValue['min-width'] : rawValue;
    return Object.assign({}, accumulator,
      ( obj = {}, obj[("@media (min-width: " + value + ")")] = Object.assign({}, {maxWidth: value},
        (padding && getSpacingStyle('padding', padding, key)),
        (!center && margin && getSpacingStyle('margin', margin, key))), obj ));
  }, {});
  var paddingStyles = Array.isArray(padding) ? getSpacingFromArray(Object.assign({}, {values: padding},
    properties('padding'))) : typeof padding === 'object' ? getSpacingStyle('padding', padding, 'DEFAULT') : {
    paddingLeft: padding,
    paddingRight: padding
  };
  var marginStyles = Array.isArray(margin) ? getSpacingFromArray(Object.assign({}, {values: margin},
    properties('margin'))) : typeof margin === 'object' ? getSpacingStyle('margin', margin, 'DEFAULT') : {
    marginLeft: margin,
    marginRight: margin
  }; // { center: true } overrides any margin styles

  if (center) { marginStyles = {
    marginLeft: 'auto',
    marginRight: 'auto'
  }; }
  return Object.assign({}, {width: '100%'},
    paddingStyles,
    marginStyles,
    mediaScreens);
});

var handleColor$2 = function (ref) {
  var toColor = ref.toColor;

  var common = {
    matchStart: 'divide',
    property: 'borderColor',
    configSearch: ['divideColor', 'borderColor', 'colors']
  };
  var borderColor = toColor([Object.assign({}, common,
    {opacityVariable: '--tw-divide-opacity'}), common]);
  if (!borderColor) { return; }
  return {
    '> :not([hidden]) ~ :not([hidden])': borderColor
  };
};

var handleOpacity = function (ref) {
  var configValue = ref.configValue;

  var opacity = configValue('divideOpacity') || configValue('opacity');
  if (!opacity) { return; }
  return {
    '> :not([hidden]) ~ :not([hidden])': {
      '--tw-divide-opacity': ("" + opacity)
    }
  };
};

var handleWidth$1 = function (ref) {
  var obj;

  var configValue = ref.configValue;
  var ref_pieces = ref.pieces;
  var negative = ref_pieces.negative;
  var className = ref_pieces.className;
  var important = ref_pieces.important;
  var width = configValue('divideWidth');
  if (!width) { return; }
  var value = "" + negative + (addPxTo0(width));
  var isDivideX = className.startsWith('divide-x');
  var cssVariableKey = isDivideX ? '--tw-divide-x-reverse' : '--tw-divide-y-reverse';
  var borderFirst = "calc(" + value + " * var(" + cssVariableKey + "))" + important;
  var borderSecond = "calc(" + value + " * calc(1 - var(" + cssVariableKey + ")))" + important;
  var styleKey = isDivideX ? {
    borderRightWidth: borderFirst,
    borderLeftWidth: borderSecond
  } : {
    borderTopWidth: borderSecond,
    borderBottomWidth: borderFirst
  };
  var innerStyles = Object.assign(( obj = {}, obj[cssVariableKey] = 0, obj ),
    styleKey);
  return {
    '> :not([hidden]) ~ :not([hidden])': innerStyles
  };
};

var divide = (function (properties) {
  var errorSuggestions = properties.errors.errorSuggestions;
  var getConfigValue = properties.getConfigValue;
  var toColor = properties.toColor;
  var theme = properties.theme;
  var match = properties.match;
  var color = handleColor$2({
    toColor: toColor
  });
  if (color) { return color; }
  var opacityMatch = match(/(?<=(divide)-(opacity))([^]*)/) || match(/^divide-opacity$/) && 'default';

  if (opacityMatch) {
    var opacityValue = stripNegative(opacityMatch) || '';
    var opacityProperties = Object.assign({}, {configValue: function (config) { return getConfigValue(theme(config), opacityValue); }},
      properties);
    var opacity = handleOpacity(opacityProperties);
    if (opacity) { return opacity; }
    errorSuggestions({
      config: theme('divideOpacity') ? 'divideOpacity' : 'opacity'
    });
  }

  var widthMatch = match(/(?<=(divide)-(x|y))([^]*)/) || match(/^divide-(x|y)$/) && 'DEFAULT';

  if (widthMatch) {
    var widthValue = stripNegative(widthMatch) || '';
    var widthProperties = Object.assign({}, {configValue: function (config) { return getConfigValue(theme(config), widthValue); }},
      properties);
    var width = handleWidth$1(widthProperties);
    if (width) { return width; }
    errorSuggestions({
      config: 'divideWidth'
    });
  }

  errorSuggestions();
});

var dropShadow = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var classValue = match(/(?<=(drop-shadow)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('dropShadow');

  if (!value) {
    errorSuggestions({
      config: ['dropShadow']
    });
  }

  var dropShadowValue = Array.isArray(value) ? value.map(function (v) { return ("drop-shadow(" + v + ")"); }).join(' ') : ("drop-shadow(" + value + ")");
  return {
    '--tw-drop-shadow': dropShadowValue
  };
});

var fill = (function (properties) {
  var common = {
    matchStart: 'fill',
    property: 'fill',
    configSearch: 'fill'
  };
  var color = properties.toColor([Object.assign({}, common,
    {useSlashAlpha: false}), common]);
  if (!color) { properties.errors.errorSuggestions({
    config: 'fill'
  }); }
  return color;
});

var gradient = (function (properties) {
  var pieces = properties.pieces;
  var matchConfigValue = properties.matchConfigValue;
  var properties_pieces = properties.pieces;
  var hasNegative = properties_pieces.hasNegative;
  var hasImportant = properties_pieces.hasImportant;
  var className = properties_pieces.className;
  var properties_errors = properties.errors;
  var errorNoNegatives = properties_errors.errorNoNegatives;
  var errorNoImportant = properties_errors.errorNoImportant;
  var errorSuggestions = properties_errors.errorSuggestions;
  var value = matchConfigValue('gradientColorStops', /(?<=(from-|via-|to-))([^]*)/);
  var slashAlphaValue = matchConfigValue('gradientColorStops', /(?<=(from-|via-|to-))([^]*)([^]*)(?=\/)/);
  var styleDefinitions = value && {
    from: Object.assign({}, withAlpha({
        pieces: pieces,
        color: value,
        property: '--tw-gradient-from',
        useSlashAlpha: false
      }),
      {'--tw-gradient-stops': ['var(--tw-gradient-from)', ("var(--tw-gradient-to, " + (transparentTo(value)) + ")")].join(', ')}),
    via: {
      '--tw-gradient-stops': ['var(--tw-gradient-from)', withAlpha({
        pieces: pieces,
        color: value,
        useSlashAlpha: false
      }), ("var(--tw-gradient-to, " + (transparentTo(value)) + ")")].join(', ')
    },
    to: withAlpha({
      pieces: pieces,
      color: value,
      property: '--tw-gradient-to',
      useSlashAlpha: false
    })
  } || slashAlphaValue && {
    from: Object.assign({}, withAlpha({
        pieces: pieces,
        color: slashAlphaValue,
        property: '--tw-gradient-from'
      }),
      {'--tw-gradient-stops': ['var(--tw-gradient-from)', 'var(--tw-gradient-to', withAlpha({
        color: slashAlphaValue,
        pieces: Object.assign({}, pieces,
          {hasAlpha: true,
          alpha: 0})
      })].join(', ')}),
    via: {
      '--tw-gradient-stops': ['var(--tw-gradient-from)', withAlpha({
        color: slashAlphaValue,
        pieces: pieces
      }), ("var(--tw-gradient-to, " + (transparentTo(slashAlphaValue)) + ")")].join(', ')
    },
    to: withAlpha({
      color: slashAlphaValue,
      property: '--tw-gradient-to',
      pieces: pieces
    })
  };
  !styleDefinitions && errorSuggestions({
    config: 'gradientColorStops'
  });
  var ref = Object.entries(styleDefinitions).find(function (ref) {
    var k = ref[0];

    return className.startsWith((k + "-"));
  }) || [];
  var styles = ref[1];
  !styles && errorSuggestions({
    config: 'gradientColorStops'
  });
  hasNegative && errorNoNegatives();
  hasImportant && errorNoImportant();
  return styles;
});

var grayscale = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(grayscale)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('grayscale');

  if (!value) {
    errorSuggestions({
      config: ['grayscale']
    });
  }

  var grayscaleValue = Array.isArray(value) ? value.map(function (v) { return ("grayscale(" + v + ")"); }).join(' ') : ("grayscale(" + value + ")");
  return {
    '--tw-grayscale': grayscaleValue,
    filter: ("var(--tw-filter)" + important)
  };
});

var hueRotate = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var properties_pieces = properties.pieces;
  var negative = properties_pieces.negative;
  var important = properties_pieces.important;
  var errorSuggestions = properties.errors.errorSuggestions;
  var classValue = match(/(?<=(hue-rotate)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('hueRotate');

  if (!value) {
    errorSuggestions({
      config: ['hueRotate']
    });
  }

  var hueRotateValue = Array.isArray(value) ? value.map(function (v) { return ("hue-rotate(" + negative + v + ")"); }).join(' ') : ("hue-rotate(" + negative + value + ")");
  return {
    '--tw-hue-rotate': hueRotateValue,
    filter: ("var(--tw-filter)" + important)
  };
});

var invert = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(invert)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('invert');

  if (!value) {
    errorSuggestions({
      config: ['invert']
    });
  }

  var invertValue = Array.isArray(value) ? value.map(function (v) { return ("invert(" + v + ")"); }).join(' ') : ("invert(" + value + ")");
  return {
    '--tw-invert': invertValue,
    filter: ("var(--tw-filter)" + important)
  };
});

var outline = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(outline)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('outline');

  if (!value) {
    errorSuggestions({
      config: ['outline']
    });
  }

  var ref = Array.isArray(value) ? value : [value];
  var outline = ref[0];
  var outlineOffset = ref[1]; if ( outlineOffset === void 0 ) outlineOffset = 0;
  return Object.assign({}, {outline: ("" + outline + important)},
    (outlineOffset && {
      outlineOffset: ("" + outlineOffset + important)
    }));
});

var handleColor$3 = function (ref) {
  var toColor = ref.toColor;

  var common = {
    matchStart: 'placeholder',
    property: 'color',
    configSearch: 'placeholderColor'
  };
  return toColor([Object.assign({}, common,
    {opacityVariable: '--tw-placeholder-opacity'}), common]);
};

var handleOpacity$1 = function (ref) {
  var configValue = ref.configValue;

  var value = configValue('placeholderOpacity') || configValue('opacity');
  if (!value) { return; }
  return {
    '--tw-placeholder-opacity': ("" + value)
  };
};

var placeholder = (function (properties) {
  var match = properties.match;
  var theme = properties.theme;
  var toColor = properties.toColor;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var opacityMatch = match(/(?<=(placeholder-opacity-))([^]*)/) || match(/^placeholder-opacity$/);
  var opacity = handleOpacity$1({
    configValue: function (config) { return getConfigValue(theme(config), opacityMatch); }
  });
  if (opacity) { return {
    '::placeholder': opacity
  }; }
  var color = handleColor$3({
    toColor: toColor
  });
  if (color) { return {
    '::placeholder': color
  }; }
  errorSuggestions({
    config: ['placeholderColor', theme('placeholderOpacity') ? 'placeholderOpacity' : 'opacity']
  });
});

var handleColor$4 = function (ref) {
  var toColor = ref.toColor;

  var common = {
    matchStart: 'ring-offset',
    property: '--tw-ring-offset-color',
    configSearch: 'ringOffsetColor'
  };
  return toColor([Object.assign({}, common,
    {useSlashAlpha: false}), common]);
};

var ringOffset = (function (properties) {
  var toColor = properties.toColor;
  var matchConfigValue = properties.matchConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var width = matchConfigValue('ringOffsetWidth', /(?<=(ring-offset)-)([^]*)/);
  if (width) { return {
    '--tw-ring-offset-width': width
  }; }
  var color = handleColor$4({
    toColor: toColor
  });
  if (color) { return color; }
  errorSuggestions({
    config: ['ringOffsetWidth', 'ringOffsetColor']
  });
});

var saturate = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(saturate)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('saturate');

  if (!value) {
    errorSuggestions({
      config: ['saturate']
    });
  }

  var saturateValue = Array.isArray(value) ? value.map(function (v) { return ("saturate(" + v + ")"); }).join(' ') : ("saturate(" + value + ")");
  return {
    '--tw-saturate': saturateValue,
    filter: ("var(--tw-filter)" + important)
  };
});

var sepia = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(sepia)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var value = configValue('sepia');

  if (!value) {
    errorSuggestions({
      config: ['sepia']
    });
  }

  var sepiaValue = Array.isArray(value) ? value.map(function (v) { return ("sepia(" + v + ")"); }).join(' ') : ("sepia(" + value + ")");
  return {
    '--tw-sepia': sepiaValue,
    filter: ("var(--tw-filter)" + important)
  };
});

var space = (function (ref) {
  var obj;

  var ref_pieces = ref.pieces;
  var negative = ref_pieces.negative;
  var important = ref_pieces.important;
  var className = ref_pieces.className;
  var errorSuggestions = ref.errors.errorSuggestions;
  var theme = ref.theme;
  var match = ref.match;
  var classNameValue = match(/(?<=(space)-(x|y)-)([^]*)/) || match(/^space-x$/) || match(/^space-y$/);
  var spaces = theme('space');
  var configValue = spaces[classNameValue || 'default'];
  !configValue && errorSuggestions({
    config: ['space']
  });
  var value = "" + negative + (addPxTo0(configValue));
  var isSpaceX = className.startsWith('space-x-'); // 🚀

  var cssVariableKey = isSpaceX ? '--tw-space-x-reverse' : '--tw-space-y-reverse';
  var marginFirst = "calc(" + value + " * var(" + cssVariableKey + "))" + important;
  var marginSecond = "calc(" + value + " * calc(1 - var(" + cssVariableKey + ")))" + important;
  var styleKey = isSpaceX ? {
    marginRight: marginFirst,
    marginLeft: marginSecond
  } : {
    marginTop: marginSecond,
    marginBottom: marginFirst
  };
  var innerStyles = Object.assign(( obj = {}, obj[cssVariableKey] = 0, obj ),
    styleKey);
  return {
    '> :not([hidden]) ~ :not([hidden])': innerStyles
  };
});

var handleColor$5 = function (ref) {
  var toColor = ref.toColor;

  var common = {
    matchStart: 'stroke',
    property: 'stroke',
    configSearch: 'stroke'
  };
  return toColor([Object.assign({}, common,
    {useSlashAlpha: false}), common]);
};

var handleWidth$2 = function (ref) {
  var configValue = ref.configValue;
  var important = ref.important;

  var value = configValue('strokeWidth');
  if (!value) { return; }
  return {
    strokeWidth: ("" + value + important)
  };
};

var handleCustom = function (ref) {
  var classValue = ref.classValue;
  var important = ref.important;

  if (classValue !== 'non-scaling') { return; }
  return {
    vectorEffect: ("non-scaling-stroke" + important)
  };
};

var stroke = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var toColor = properties.toColor;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var color = handleColor$5({
    toColor: toColor
  });
  if (color) { return color; }
  var classValue = match(/(?<=(stroke)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var width = handleWidth$2({
    configValue: configValue,
    important: important
  });
  if (width) { return width; }
  var custom = handleCustom({
    classValue: classValue,
    important: important
  });
  if (custom) { return custom; }
  errorSuggestions({
    config: ['stroke', 'strokeWidth']
  });
});

var transition = (function (properties) {
  var theme = properties.theme;
  var match = properties.match;
  var getConfigValue = properties.getConfigValue;
  var errorSuggestions = properties.errors.errorSuggestions;
  var important = properties.pieces.important;
  var classValue = match(/(?<=(transition)-)([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var transitionProperty = configValue('transitionProperty');
  !transitionProperty && errorSuggestions({
    config: 'transitionProperty'
  });

  if (transitionProperty === 'none') {
    return {
      transitionProperty: ("" + transitionProperty + important)
    };
  }

  var defaultTimingFunction = theme('transitionTimingFunction.DEFAULT');
  var defaultDuration = theme('transitionDuration.DEFAULT');
  return Object.assign({}, {transitionProperty: ("" + transitionProperty + important)},
    (defaultTimingFunction && {
      transitionTimingFunction: ("" + defaultTimingFunction + important)
    }),
    (defaultDuration && {
      transitionDuration: ("" + defaultDuration + important)
    }));
});

var handleColor$6 = function (ref) {
  var toColor = ref.toColor;

  var common = {
    matchStart: 'text',
    property: 'color',
    configSearch: 'textColor'
  };
  return toColor([Object.assign({}, common,
    {opacityVariable: '--tw-text-opacity'}), common]);
};

var handleSize$1 = function (ref) {
  var configValue = ref.configValue;
  var important = ref.important;

  var value = configValue('fontSize');
  if (!value) { return; }
  var ref$1 = Array.isArray(value) ? value : [value];
  var fontSize = ref$1[0];
  var options = ref$1[1];
  var lineHeight = options instanceof Object ? options.lineHeight : options;
  var letterSpacing = options && options.letterSpacing;
  return Object.assign({}, {fontSize: ("" + fontSize + important)},
    (lineHeight && {
      lineHeight: ("" + lineHeight + important)
    }),
    (letterSpacing && {
      letterSpacing: ("" + letterSpacing + important)
    }));
};

var text = (function (properties) {
  var match = properties.match;
  var theme = properties.theme;
  var toColor = properties.toColor;
  var getConfigValue = properties.getConfigValue;
  var properties_pieces = properties.pieces;
  var important = properties_pieces.important;
  var hasNegative = properties_pieces.hasNegative;
  var properties_errors = properties.errors;
  var errorSuggestions = properties_errors.errorSuggestions;
  var errorNoNegatives = properties_errors.errorNoNegatives;
  hasNegative && errorNoNegatives();
  var color = handleColor$6({
    toColor: toColor
  });
  if (color) { return color; }
  var classValue = match(/(?<=(text-))([^]*)/);

  var configValue = function (config) { return getConfigValue(theme(config), classValue); };

  var size = handleSize$1({
    configValue: configValue,
    important: important
  });
  if (size) { return size; }
  errorSuggestions({
    config: ['textColor', 'fontSize']
  });
});



var plugins = ({
  animation: animation,
  backdropBlur: backdropBlur,
  backdropBrightness: backdropBrightness,
  backdropContrast: backdropContrast,
  backdropGrayscale: backdropGrayscale,
  backdropHueRotate: backdropHueRotate,
  backdropInvert: backdropInvert,
  backdropOpacity: backdropOpacity,
  backdropSaturate: backdropSaturate,
  backdropSepia: backdropSepia,
  bg: bg,
  blur: blur,
  border: border,
  boxShadow: boxShadow,
  brightness: brightness,
  caretColor: caretColor,
  contrast: contrast,
  container: container,
  divide: divide,
  dropShadow: dropShadow,
  fill: fill,
  gradient: gradient,
  grayscale: grayscale,
  hueRotate: hueRotate,
  invert: invert,
  outline: outline,
  placeholder: placeholder,
  ring: ring,
  ringOffset: ringOffset,
  saturate: saturate,
  sepia: sepia,
  space: space,
  stroke: stroke,
  transition: transition,
  text: text
});

function objectWithoutProperties$2 (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }

var getErrors = function (ref) {
  var pieces = ref.pieces;
  var state = ref.state;
  var dynamicKey = ref.dynamicKey;

  var className = pieces.className;
  var variants = pieces.variants;
  return {
    errorSuggestions: function (options) {
      throw new babelPluginMacros.MacroError(errorSuggestions(Object.assign({}, {pieces: pieces,
        state: state,
        dynamicKey: dynamicKey},
        options)));
    },
    errorNoVariants: function () {
      throw new babelPluginMacros.MacroError(logNotAllowed({
        className: className,
        error: ("doesn’t support " + (variants.map(function (variant) { return (variant + ":"); }).join('')) + " or any other variants")
      }));
    },
    errorNoImportant: function () {
      throw new babelPluginMacros.MacroError(logNotAllowed({
        className: className,
        error: "doesn’t support !important"
      }));
    },
    errorNoNegatives: function () {
      throw new babelPluginMacros.MacroError(logNotAllowed({
        className: className,
        error: "doesn’t support negatives"
      }));
    }
  };
};

var callPlugin = function (corePlugin, context) {
  var handle = plugins[corePlugin] || null;

  if (!handle) {
    throw new babelPluginMacros.MacroError(("No handler specified, looked for \"" + corePlugin + "\""));
  }

  return handle(context);
};

var getMatchConfigValue = function (ref) {
  var match = ref.match;
  var theme = ref.theme;
  var getConfigValue$$1 = ref.getConfigValue;

  return function (config, regexMatch) {
  var matcher = match(regexMatch);
  if (matcher === undefined) { return; }
  return getConfigValue$$1(theme(config), matcher);
};
};

var handleCorePlugins = (function (ref) {
  var corePlugin = ref.corePlugin;
  var pieces = ref.pieces;
  var state = ref.state;
  var dynamicKey = ref.dynamicKey;
  var theme = ref.theme;
  var configTwin = ref.configTwin;
  var rest$1 = objectWithoutProperties$2( ref, ["corePlugin", "classNameRaw", "pieces", "state", "dynamicKey", "theme", "configTwin"] );
  var rest = rest$1;

  var errors = getErrors({
    state: state,
    pieces: pieces,
    dynamicKey: dynamicKey
  });

  var match = function (regex) {
    var result = get(pieces.className.match(regex), [0]);
    if (result === undefined) { return; }
    return result;
  };

  var matchConfigValue = getMatchConfigValue({
    match: match,
    theme: theme,
    getConfigValue: getConfigValue
  });
  var toColor = getColor({
    theme: theme,
    getConfigValue: getConfigValue,
    configTwin: configTwin,
    matchConfigValue: matchConfigValue,
    pieces: pieces
  });
  var context = Object.assign({}, {state: function () { return state; },
    errors: errors,
    pieces: pieces,
    match: match,
    theme: theme,
    toColor: toColor,
    configTwin: configTwin,
    getConfigValue: getConfigValue,
    matchConfigValue: matchConfigValue},
    rest);
  return callPlugin(corePlugin, context);
});

var handleCss = (function (ref) {
  var obj;

  var className = ref.className;
  var ref$1 = splitOnFirst(className // Replace the "stand-in spaces" with real ones
  .replace(new RegExp(SPACE_ID, 'g'), ' '), '[');
  var property = ref$1[0];
  var value = ref$1[1];
  property = property.startsWith('--') && property || // Retain css variables
  camelize(property); // Remove the last ']' and whitespace

  value = value.slice(0, -1).trim();
  throwIf(!property, function () { return logBadGood(("“[" + value + "]” is missing the css property before the square brackets"), ("Write it like this: marginTop[" + (value || '5rem') + "]")); });
  return ( obj = {}, obj[property] = value, obj );
});

var searchDynamicConfigByProperty = function (propertyName) {
  var result = Object.entries(dynamicStyles).find(function (ref) {
    var k = ref[0];

    return propertyName === k;
  });
  if (!result) { return; }
  return result[1];
};

var showSuggestions = function (property, value) {
  var suggestions = getSuggestions$1(property, value);
  throwIf(true, function () { return logBadGood(("The arbitrary class “" + property + "” in “" + property + "-[" + value + "]” wasn’t found"), suggestions.length > 0 && ("Try one of these:\n\n" + (suggestions.join(', ')))); });
};

var getSuggestions$1 = function (property, value) {
  var results = stringSimilarity.findBestMatch(property, Object.keys(dynamicStyles).filter(function (s) { return s.hasArbitrary !== 'false'; }));
  var suggestions = results.ratings.filter(function (item) { return item.rating > 0.25; });
  return suggestions.length > 0 ? suggestions.map(function (s) { return ((s.target) + "-[" + value + "]"); }) : [];
};

var lengthUnits = ['cm', 'mm', 'Q', 'in', 'pc', 'pt', 'px', 'em', 'ex', 'ch', 'rem', 'lh', 'vw', 'vh', 'vmin', 'vmax', '%'];

var isLength = function (value) {
  var unitsPattern = "(?:" + (lengthUnits.join('|')) + ")";
  return new RegExp((unitsPattern + "$")).test(value) || new RegExp(("^calc\\(.+?" + unitsPattern)).test(value);
};

var typeMap = {
  all: function (ref) {
    var config = ref.config;
    var value = ref.value;
    var theme = ref.theme;

    return config(value, theme);
},
  color: function (ref) {
    var config = ref.config;
    var value = ref.value;
    var pieces = ref.pieces;
    var theme = ref.theme;
    var hasFallback = ref.hasFallback;

    if (typeof config === 'function') { return config(value, theme); }
    var property = config.property;
    var variable = config.variable;
    if (!property) { return; }
    return withAlpha(Object.assign({}, {color: value,
      property: property,
      pieces: pieces,
      hasFallback: hasFallback},
      (variable && {
        variable: variable
      })));
  },
  length: function (ref) {
    var obj;

    var config = ref.config;
    var value = ref.value;
    var theme = ref.theme;
    if (!isLength(value) && !value.startsWith('var(')) { return; }
    if (typeof config === 'function') { return config(value, theme); }
    var property = config.property;
    if (property) { return ( obj = {}, obj[property] = value, obj ); }
  },
  lookup: function (ref) {
    var config = ref.config;
    var value = ref.value;
    var theme = ref.theme;

    return config(value, theme);
}
};

var getCoercedValue = function (customValue, context) {
  var ref = splitOnFirst(customValue, ':');
  var explicitType = ref[0];
  var value = ref[1];
  if (value.length === 0) { return; }
  var coercedConfig = context.config.coerced;
  if (!coercedConfig) { return; }
  var coercedOptions = Object.keys(coercedConfig);
  throwIf(!coercedOptions.includes(explicitType), function () { return logBadGood(("The coerced value of “" + explicitType + "” isn’t available"), ("Try one of these coerced classes:\n\n" + (coercedOptions.map(function (o) { return ((context.property) + "-[" + o + ":" + value + "]"); }).join(', ')))); });
  var result = typeMap[explicitType]({
    config: coercedConfig[explicitType],
    value: value,
    pieces: context.pieces,
    theme: getTheme(context.state.config.theme)
  });
  return result;
};

var getClassData = function (className) {
  var ref = splitOnFirst(className // Replace the "stand-in spaces" with real ones
  .replace(new RegExp(SPACE_ID, 'g'), ' '), '[');
  var property = ref[0];
  var value = ref[1];
  return {
    property: property.slice(0, -1),
    // Remove the dash just before the brackets
    value: value.slice(0, -1).trim() // Remove the last ']' and whitespace

  };
};

var handleArbitraryCss = (function (ref) {
  var obj;

  var className = ref.className;
  var state = ref.state;
  var pieces = ref.pieces;
  var ref$1 = getClassData(className);
  var property = ref$1.property;
  var value = ref$1.value;
  var config = searchDynamicConfigByProperty(property) || {}; // Check for coerced value
  // Values that have their type specified: [length:3px]/[color:red]/etc

  var coercedValue = getCoercedValue(value, {
    property: property,
    pieces: pieces,
    state: state,
    config: config
  });

  if (coercedValue) {
    return coercedValue;
  }
  (isEmpty(config) || Array.isArray(config)) && showSuggestions(property, value);
  throwIf(config.hasArbitrary === false, function () { return logBadGood(("There is no support for the arbitrary value “" + property + "” in “" + property + "-[" + value + "]”")); });

  if (Array.isArray(config.value)) {
    var arbitraryValue$1;
    config.value.find(function (type) {
      var result = typeMap[type]({
        config: config.coerced[type],
        value: value,
        pieces: pieces,
        theme: getTheme(state.config.theme),
        hasFallback: false
      });
      if (result) { arbitraryValue$1 = result; }
      return Boolean(result);
    });
    throwIf(!arbitraryValue$1, function () { return logBadGood(("The arbitrary value in “" + property + "-[" + value + "]” isn’t valid"), ("Replace “" + value + "” with a valid " + (config.value.join(' or ')) + " based value")); });
    return arbitraryValue$1;
  }

  var arbitraryProperty = config.prop;

  var color = function (props) { return withAlpha(Object.assign({}, {color: value,
    pieces: pieces},
    props)); };

  var arbitraryValue = typeof config.value === 'function' ? config.value({
    value: value,
    transparentTo: transparentTo,
    color: color
  }) : value; // Raw values - no prop value found in config

  if (!arbitraryProperty) { return arbitraryValue ? arbitraryValue : showSuggestions(property, value); }
  if (Array.isArray(arbitraryProperty)) { return arbitraryProperty.reduce(function (result, p) {
    var obj;

    return (Object.assign({}, result,
    ( obj = {}, obj[p] = arbitraryValue, obj )));
    }, {}); }
  return ( obj = {}, obj[arbitraryProperty] = arbitraryValue, obj );
});

function objectWithoutProperties$3 (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }
// eg: You'd want a space left in this situation: tw`class1/* comment */class2`

var multilineReplaceWith = function (match, index, input) {
  var charBefore = input[index - 1];
  var directPrefixMatch = charBefore && charBefore.match(/\w/);
  var charAfter = input[Number(index) + Number(match.length)];
  var directSuffixMatch = charAfter && charAfter.match(/\w/);
  return directPrefixMatch && directPrefixMatch[0] && directSuffixMatch && directSuffixMatch[0] ? ' ' : '';
};

var formatTasks$2 = [// Strip pipe dividers " | "
function (ref) {
  var classes = ref.classes;

  return classes.replace(/ \| /g, ' ');
}, // Strip multiline comments
function (ref) {
  var classes = ref.classes;

  return classes.replace(/(?<!\/)\/(?!\/)\*[\S\s]*?\*\//g, multilineReplaceWith);
}, // Strip singleline comments
function (ref) {
  var classes = ref.classes;

  return classes.replace(/\/\/.*/g, '');
}, // Unwrap grouped variants
function (ref) {
  var classes = ref.classes;

  return handleVariantGroups(classes);
}, // Move some properties to the front of the list so they work as expected
function (ref) {
  var classes = ref.classes;

  return orderGridProperty(classes);
}, function (ref) {
  var classes = ref.classes;

  return orderTransitionProperty(classes);
}, function (ref) {
  var classes = ref.classes;

  return orderTransformProperty(classes);
}, function (ref) {
  var classes = ref.classes;

  return orderRingProperty(classes);
}, function (ref) {
  var classes = ref.classes;

  return orderBackdropProperty(classes);
}, function (ref) {
  var classes = ref.classes;

  return orderFilterProperty(classes);
}, function (ref) {
  var classes = ref.classes;

  return orderBgOpacityProperty(classes);
}, // Move and sort the responsive items to the end of the list
function (ref) {
  var classes = ref.classes;
  var state = ref.state;

  return orderByScreens(classes, state);
}, // Add a missing content class for after:/before: variants
function (ref) {
  var classes = ref.classes;

  return addContentClass(classes);
}];
var getStyleData = (function (classes, ref) {
  if ( ref === void 0 ) ref = {};
  var isCsOnly = ref.isCsOnly; if ( isCsOnly === void 0 ) isCsOnly = false;
  var silentMismatches = ref.silentMismatches; if ( silentMismatches === void 0 ) silentMismatches = false;
  var t = ref.t;
  var state = ref.state;

  var hasEmptyClasses = [null, 'null', undefined].includes(classes);
  if (silentMismatches && hasEmptyClasses) { return; }
  throwIf(hasEmptyClasses, function () { return logGeneralError('Only plain strings can be used with "tw".\nRead more at https://twinredirect.page.link/template-literals'); });

  for (var i = 0, list = formatTasks$2; i < list.length; i += 1) {
    var task = list[i];

    classes = task({
      classes: classes,
      state: state
    });
  }

  var theme = getTheme(state.config.theme);
  var classesMatched = [];
  var classesMismatched = []; // Merge styles into a single css object

  var styles = classes.reduce(function (results, classNameRaw) {
    var pieces = getPieces({
      classNameRaw: classNameRaw,
      state: state
    });
    var hasPrefix = pieces.hasPrefix;
    var className = pieces.className;
    var hasVariants = pieces.hasVariants; // Avoid prechecks on silent mode as they'll error loudly

    if (!silentMismatches) {
      var doPrechecks$$1 = doPrechecks;
      var rest = objectWithoutProperties$3( precheckExports, ["default"] );
      var prechecks = rest;
      var precheckContext = {
        pieces: pieces,
        classNameRaw: classNameRaw,
        state: state
      };
      doPrechecks$$1(Object.values(prechecks), precheckContext);
    } // Make sure non-prefixed classNames are ignored


    var ref = state.config;
    var prefix = ref.prefix;
    var hasPrefixMismatch = prefix && !hasPrefix && className;

    if (silentMismatches && (!className || hasPrefixMismatch)) {
      classesMismatched.push(classNameRaw);
      return results;
    }

    throwIf(!className, function () { return hasVariants ? logNotFoundVariant({
      classNameRaw: classNameRaw
    }) : logNotFoundClass; });
    var ref$1 = getProperties(className, state, {
      isCsOnly: isCsOnly
    });
    var hasMatches = ref$1.hasMatches;
    var hasUserPlugins = ref$1.hasUserPlugins;
    var dynamicKey = ref$1.dynamicKey;
    var dynamicConfig = ref$1.dynamicConfig;
    var corePlugin = ref$1.corePlugin;
    var type = ref$1.type;

    if (silentMismatches && !hasMatches && !hasUserPlugins) {
      classesMismatched.push(classNameRaw);
      return results;
    } // Error if short css is used and disabled


    var isShortCssDisabled = state.configTwin.disableShortCss && type === 'css' && !isCsOnly;
    throwIf(isShortCssDisabled, function () { return logBadGood(("Short css has been disabled in the config so “" + classNameRaw + "” won’t work" + (!state.configTwin.disableCsProp ? ' outside the cs prop' : '') + "."), !state.configTwin.disableCsProp ? ("Add short css with the cs prop: &lt;div cs=\"" + classNameRaw + "\" /&gt;") : ''); }); // Kick off suggestions when no class matches

    throwIf(!hasMatches && !hasUserPlugins, function () { return errorSuggestions({
      pieces: pieces,
      state: state,
      isCsOnly: isCsOnly
    }); });
    var styleContext = {
      theme: theme,
      pieces: pieces,
      state: state,
      corePlugin: corePlugin,
      className: className,
      classNameRaw: classNameRaw,
      dynamicKey: dynamicKey,
      dynamicConfig: dynamicConfig,
      configTwin: state.configTwin
    };
    var styleHandler = {
      static: function () { return handleStatic(styleContext); },
      dynamic: function () { return handleDynamic(styleContext); },
      css: function () { return handleCss(styleContext); },
      arbitraryCss: function () { return handleArbitraryCss(styleContext); },
      userPlugin: function () { return handleUserPlugins(styleContext); },
      corePlugin: function () { return handleCorePlugins(styleContext); }
    };
    var style;

    if (hasUserPlugins) {
      style = applyTransforms({
        type: type,
        pieces: pieces,
        style: styleHandler.userPlugin()
      });
    } // Check again there are no userPlugin matches


    if (silentMismatches && !hasMatches && !style) {
      classesMismatched.push(classNameRaw);
      return results;
    }

    throwIf(!hasMatches && !style, function () { return errorSuggestions({
      pieces: pieces,
      state: state,
      isCsOnly: isCsOnly
    }); });
    style = style || applyTransforms({
      type: type,
      pieces: pieces,
      style: styleHandler[type]()
    });
    var result = deepMerge(results, addVariants({
      results: results,
      style: style,
      pieces: pieces,
      state: state
    }));
    state.isDev && state.configTwin.debug && debug(classNameRaw, style);
    classesMatched.push(classNameRaw);
    return result;
  }, {});
  return {
    // TODO: Avoid astifying here, move it outside function
    styles: astify(isEmpty(styles) ? {} : styles, t),
    mismatched: classesMismatched.join(' '),
    matched: classesMatched.join(' ')
  };
});

var moveTwPropToStyled = function (props) {
  var jsxPath = props.jsxPath;
  var styles = props.styles;
  makeStyledComponent(Object.assign({}, props,
    {secondArg: styles})); // Remove the tw attribute

  var tagAttributes = jsxPath.node.attributes;
  var twAttributeIndex = tagAttributes.findIndex(function (n) { return n.name && n.name.name === 'tw'; });
  if (twAttributeIndex < 0) { return; }
  jsxPath.node.attributes.splice(twAttributeIndex, 1);
};

var mergeIntoCssAttribute = function (ref) {
  var path$$1 = ref.path;
  var styles = ref.styles;
  var cssAttribute = ref.cssAttribute;
  var t = ref.t;

  if (!cssAttribute) { return; } // The expression is the value as a NodePath

  var attributeValuePath = cssAttribute.get('value'); // If it's not {} or "", get out of here

  if (!attributeValuePath.isJSXExpressionContainer() && !attributeValuePath.isStringLiteral()) { return; }
  var existingCssAttribute = attributeValuePath.isStringLiteral() ? attributeValuePath : attributeValuePath.get('expression');
  var attributeNames = getAttributeNames(path$$1);
  var isBeforeCssAttribute = attributeNames.indexOf('tw') - attributeNames.indexOf('css') < 0;

  if (existingCssAttribute.isArrayExpression()) {
    //  The existing css prop is an array, eg: css={[...]}
    isBeforeCssAttribute ? existingCssAttribute.unshiftContainer('elements', styles) : existingCssAttribute.pushContainer('elements', styles);
  } else {
    // css prop is either:
    // TemplateLiteral
    // <div css={`...`} tw="..." />
    // or an ObjectExpression
    // <div css={{ ... }} tw="..." />
    // or ArrowFunctionExpression/FunctionExpression
    // <div css={() => (...)} tw="..." />
    var existingCssAttributeNode = existingCssAttribute.node; // The existing css prop is an array, eg: css={[...]}

    var styleArray = isBeforeCssAttribute ? [styles, existingCssAttributeNode] : [existingCssAttributeNode, styles];
    var arrayExpression = t.arrayExpression(styleArray);
    var parent = existingCssAttribute.parent;
    var replacement = parent.type === 'JSXAttribute' ? t.jsxExpressionContainer(arrayExpression) : arrayExpression;
    existingCssAttribute.replaceWith(replacement);
  }
};

var handleTwProperty = function (ref) {
  var path$$1 = ref.path;
  var t = ref.t;
  var program = ref.program;
  var state = ref.state;

  if (!path$$1.node || path$$1.node.name.name !== 'tw') { return; }
  state.hasTwAttribute = true;
  var nodeValue = path$$1.node.value; // Allow tw={"class"}

  var expressionValue = nodeValue.expression && nodeValue.expression.type === 'StringLiteral' && nodeValue.expression.value; // Feedback for unsupported usage

  throwIf(nodeValue.expression && !expressionValue, function () { return logGeneralError("Only plain strings can be used with the \"tw\" prop.\nEg: <div tw=\"text-black\" /> or <div tw={\"text-black\"} />\nRead more at https://twinredirect.page.link/template-literals"); });
  var rawClasses = expressionValue || nodeValue.value || '';
  var ref$1 = getStyleData(rawClasses, {
    t: t,
    state: state
  });
  var styles = ref$1.styles;
  var jsxPath = getParentJSX(path$$1);
  var attributes = jsxPath.get('attributes');
  var ref$2 = getCssAttributeData(attributes);
  var cssAttribute = ref$2.attribute;

  if (state.configTwin.moveTwPropToStyled) {
    moveTwPropToStyled({
      styles: styles,
      jsxPath: jsxPath,
      t: t,
      program: program,
      state: state
    });
    addDataTwPropToPath({
      t: t,
      attributes: attributes,
      rawClasses: rawClasses,
      path: path$$1,
      state: state
    });
    return;
  }

  if (!cssAttribute) {
    // Replace the tw prop with the css prop
    path$$1.replaceWith(t.jsxAttribute(t.jsxIdentifier('css'), t.jsxExpressionContainer(styles)));
    addDataTwPropToPath({
      t: t,
      attributes: attributes,
      rawClasses: rawClasses,
      path: path$$1,
      state: state
    });
    return;
  } // Merge tw styles into an existing css prop


  mergeIntoCssAttribute({
    cssAttribute: cssAttribute,
    path: jsxPath,
    styles: styles,
    t: t
  });
  path$$1.remove(); // remove the tw prop

  addDataPropToExistingPath({
    t: t,
    attributes: attributes,
    rawClasses: rawClasses,
    path: jsxPath,
    state: state
  });
};

var handleTwFunction = function (ref) {
  var references = ref.references;
  var state = ref.state;
  var t = ref.t;

  var defaultImportReferences = references.default || references.tw || [];
  defaultImportReferences.forEach(function (path$$1) {
    /**
     * Gotcha: After twin changes a className/tw/cs prop path then the reference
     * becomes stale and needs to be refreshed with crawl()
     */
    var parentPath = path$$1.parentPath;
    if (!parentPath.isTaggedTemplateExpression()) { path$$1.scope.crawl(); }
    var parent = path$$1.findParent(function (x) { return x.isTaggedTemplateExpression(); });
    if (!parent) { return; } // Check if the style attribute is being used

    if (!state.configTwin.allowStyleProp) {
      var jsxAttribute = parent.findParent(function (x) { return x.isJSXAttribute(); });
      var attributeName = jsxAttribute && jsxAttribute.get('name').get('name').node;
      throwIf(attributeName === 'style', function () { return logStylePropertyError; });
    }

    var parsed = parseTte({
      path: parent,
      types: t,
      styledIdentifier: state.styledIdentifier,
      state: state
    });
    if (!parsed) { return; }
    var rawClasses = parsed.string; // Add tw-prop for css attributes

    var jsxPath = path$$1.findParent(function (p) { return p.isJSXOpeningElement(); });

    if (jsxPath) {
      var attributes = jsxPath.get('attributes');
      var pathData = {
        t: t,
        attributes: attributes,
        rawClasses: rawClasses,
        path: jsxPath,
        state: state
      };
      addDataPropToExistingPath(pathData);
    }

    var ref = getStyleData(rawClasses, {
      t: t,
      state: state
    });
    var styles = ref.styles;
    replaceWithLocation(parsed.path, styles);
  });
};

/**
 * cs - 'css shorts'
 */

var handleCsProperty = function (ref) {
  var path$$1 = ref.path;
  var t = ref.t;
  var state = ref.state;

  if (state.configTwin.disableCsProp) { return; }
  if (!path$$1.node || path$$1.node.name.name !== 'cs') { return; }
  state.hasCsProp = true;
  var isCsOnly = true;
  var nodeValue = path$$1.node.value; // Allow cs={"property[value]"}

  var expressionValue = nodeValue.expression && nodeValue.expression.type === 'StringLiteral' && nodeValue.expression.value; // Feedback for unsupported usage

  throwIf(nodeValue.expression && !expressionValue, function () { return logGeneralError("Only plain strings can be used with the \"cs\" prop.\nEg: <div cs=\"maxWidth[30rem]\" />\nRead more at https://twinredirect.page.link/cs-classes"); });
  var rawClasses = expressionValue || nodeValue.value || '';
  var ref$1 = getStyleData(rawClasses, {
    isCsOnly: isCsOnly,
    t: t,
    state: state
  });
  var styles = ref$1.styles;
  var jsxPath = getParentJSX(path$$1);
  var attributes = jsxPath.get('attributes');
  var ref$2 = getCssAttributeData(attributes);
  var cssAttribute = ref$2.attribute;

  if (!cssAttribute) {
    // Replace the tw prop with the css prop
    path$$1.replaceWith(t.jsxAttribute(t.jsxIdentifier('css'), t.jsxExpressionContainer(styles))); // TODO: Update the naming of this function

    addDataTwPropToPath({
      t: t,
      attributes: attributes,
      rawClasses: rawClasses,
      path: path$$1,
      state: state,
      propName: 'data-cs'
    });
    return;
  } // The expression is the value as a NodePath


  var attributeValuePath = cssAttribute.get('value'); // If it's not {} or "", get out of here

  if (!attributeValuePath.isJSXExpressionContainer() && !attributeValuePath.isStringLiteral()) { return; }
  var existingCssAttribute = attributeValuePath.isStringLiteral() ? attributeValuePath : attributeValuePath.get('expression');
  var attributeNames = getAttributeNames(jsxPath);
  var isBeforeCssAttribute = attributeNames.indexOf('cs') - attributeNames.indexOf('css') < 0;

  if (existingCssAttribute.isArrayExpression()) {
    //  The existing css prop is an array, eg: css={[...]}
    isBeforeCssAttribute ? existingCssAttribute.unshiftContainer('elements', styles) : existingCssAttribute.pushContainer('elements', styles);
  } else {
    // css prop is either:
    // TemplateLiteral
    // <div css={`...`} cs="..." />
    // or an ObjectExpression
    // <div css={{ ... }} cs="..." />
    // or ArrowFunctionExpression/FunctionExpression
    // <div css={() => (...)} cs="..." />
    var existingCssAttributeNode = existingCssAttribute.node; // The existing css prop is an array, eg: css={[...]}

    var styleArray = isBeforeCssAttribute ? [styles, existingCssAttributeNode] : [existingCssAttributeNode, styles];
    var arrayExpression = t.arrayExpression(styleArray);
    var parent = existingCssAttribute.parent;
    var replacement = parent.type === 'JSXAttribute' ? t.jsxExpressionContainer(arrayExpression) : arrayExpression;
    existingCssAttribute.replaceWith(replacement);
  }

  path$$1.remove(); // remove the cs prop

  addDataPropToExistingPath({
    t: t,
    attributes: attributes,
    rawClasses: rawClasses,
    path: jsxPath,
    state: state,
    propName: 'data-cs'
  });
};

var makeJsxAttribute = function (ref, t) {
  var key = ref[0];
  var value = ref[1];

  return t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(value));
};

var handleClassNameProperty = function (ref) {
  var path$$1 = ref.path;
  var t = ref.t;
  var state = ref.state;

  if (!state.configTwin.includeClassNames) { return; }
  if (path$$1.node.name.name !== 'className') { return; }
  var nodeValue = path$$1.node.value; // Ignore className if it cannot be resolved

  if (nodeValue.expression) { return; }
  var rawClasses = nodeValue.value || '';
  if (!rawClasses) { return; }
  var ref$1 = getStyleData(rawClasses, {
    silentMismatches: true,
    t: t,
    state: state
  });
  var styles = ref$1.styles;
  var mismatched = ref$1.mismatched;
  var matched = ref$1.matched;
  if (!matched) { return; } // When classes can't be matched we add them back into the className (it exists as a few properties)

  path$$1.node.value.value = mismatched;
  path$$1.node.value.extra.rawValue = mismatched;
  path$$1.node.value.extra.raw = "\"" + mismatched + "\"";
  var jsxPath = getParentJSX(path$$1);
  var attributes = jsxPath.get('attributes');
  var ref$2 = getCssAttributeData(attributes);
  var cssAttribute = ref$2.attribute;

  if (!cssAttribute) {
    var attribute = makeJsxAttribute(['css', styles], t);
    mismatched ? path$$1.insertAfter(attribute) : path$$1.replaceWith(attribute);
    addDataTwPropToPath({
      t: t,
      attributes: attributes,
      rawClasses: matched,
      path: path$$1,
      state: state
    });
    return;
  }

  var cssExpression = cssAttribute.get('value').get('expression');
  var attributeNames = getAttributeNames(jsxPath);
  var isBeforeCssAttribute = attributeNames.indexOf('className') - attributeNames.indexOf('css') < 0;

  if (cssExpression.isArrayExpression()) {
    //  The existing css prop is an array, eg: css={[...]}
    isBeforeCssAttribute ? cssExpression.unshiftContainer('elements', styles) : cssExpression.pushContainer('elements', styles);
  } else {
    // The existing css prop is not an array, eg: css={{ ... }} / css={`...`}
    var existingCssAttribute = cssExpression.node;
    throwIf(!existingCssAttribute, function () { return logGeneralError("An empty css prop (css=\"\") isn’t supported alongside the className prop"); });
    var styleArray = isBeforeCssAttribute ? [styles, existingCssAttribute] : [existingCssAttribute, styles];
    cssExpression.replaceWith(t.arrayExpression(styleArray));
  }

  if (!mismatched) { path$$1.remove(); }
  addDataPropToExistingPath({
    t: t,
    attributes: attributes,
    rawClasses: matched,
    path: jsxPath,
    state: state
  });
};

var stripLeadingDot = function (string) { return string.startsWith('.') ? string.slice(1) : string; };

var replaceSelectorWithParent = function (string, replacement) { return string.replace(replacement, ("{{" + (stripLeadingDot(replacement)) + "}}")); };

var parseSelector = function (selector) {
  if (!selector) { return; }
  var matches = selector.trim().match(/^(\S+)(\s+.*?)?$/);
  if (matches === null) { return; }
  var match = matches[0]; // Fix spacing that goes missing when provided by tailwindcss
  // Unfortunately this removes the ability to have classes on the same element
  // eg: .something.something or &.something

  match = match.replace(/(?<=\w)\./g, ' .'); // If the selector is just a single selector then return

  if (!match.includes(' ')) { return match; } // Look for class matching candidates

  var match2 = match.match(/(?<=>|^|~|\+|\*| )\.[\w.\\-]+(?= |>|~|\+|\*|:|$)/gm);
  if (!match2) { return match; } // Wrap the matching classes in {{class}}

  for (var i = 0, list = match2; i < list.length; i += 1) {
    var item = list[i];

    match = replaceSelectorWithParent(match, item);
  }

  return match;
};

var parseRuleProperty = function (string) {
  // https://stackoverflow.com/questions/448981/which-characters-are-valid-in-css-class-names-selectors
  if (string && string.match(/^-{2,3}[_a-z]+[\w-]*/i)) {
    return string;
  }

  return camelize(string);
};

var escapeSelector = function (selector) { return selector.replace(/\\\//g, '/').trim(); };

var buildAtSelector = function (name, values, screens) {
  // Support @screen selectors
  if (name === 'screen') {
    var screenValue = screens[values];
    if (screenValue) { return ("@media (min-width: " + screenValue + ")"); }
  }

  return ("@" + name + " " + values);
};

var getBuiltRules = function (rule, ref) {
  var obj;

  var isBase = ref.isBase;
  if (!rule.selector) { return null; } // Prep comma spaced selectors for parsing

  var selectorArray = rule.selector.split(','); // Validate each selector

  var selectorParsed = selectorArray.map(function (s) { return parseSelector(s); }).filter(Boolean); // Join them back into a string

  var selector = selectorParsed.join(','); // Rule isn't formatted correctly

  if (!selector) { return null; }

  if (isBase) {
    // Base values stay as-is because they aren't interactive
    return ( obj = {}, obj[escapeSelector(selector)] = buildDeclaration(rule.nodes), obj );
  } // Separate comma-separated selectors to allow twin's features


  return selector.split(',').reduce(function (result, selector) {
    var obj;

    return (Object.assign({}, result,
    ( obj = {}, obj[escapeSelector(selector)] = buildDeclaration(rule.nodes), obj )));
  }, {});
};

var buildDeclaration = function (items) {
  if (typeof items !== 'object') { return items; }
  return Object.entries(items).reduce(function (result, ref) {
    var obj;

    var declaration = ref[1];
    return (Object.assign({}, result,
    ( obj = {}, obj[parseRuleProperty(declaration.prop)] = declaration.value, obj )));
  }, {});
};

var ruleSorter = function (arr) {
  if (!Array.isArray(arr) || arr.length === 0) { return []; }
  arr // Tailwind supplies the classes reversed since 2.0.x
  .reverse() // Tailwind also messes up the ordering so classes need to be resorted
  // Order selectors by length (don't know of a better way)
  .sort(function (a, b) {
    var selectorA = a.selector ? a.selector.length : 0;
    var selectorB = b.selector ? b.selector.length : 0;
    return selectorA - selectorB;
  }) // Place at rules at the end '@media' etc
  .sort(function (a, b) {
    var atRuleA = a.type === 'atrule';
    var atRuleB = b.type === 'atrule';
    return atRuleA - atRuleB;
  }) // Traverse children and reorder aswell
  .forEach(function (item) {
    if (!item.nodes || item.nodes.length === 0) { return; }
    item.nodes.forEach(function (i) {
      if (typeof i !== 'object') { return; }
      return ruleSorter(i);
    });
  });
  return arr;
};

var getUserPluginRules = function (rules, screens, isBase) { return ruleSorter(rules).reduce(function (result, rule) {
  var obj;

  if (rule.type === 'decl') {
    var builtRules = {};
    builtRules[rule.prop] = rule.value;
    return deepMerge(result, builtRules);
  } // Build the media queries


  if (rule.type !== 'atrule') {
    var builtRules$1 = getBuiltRules(rule, {
      isBase: isBase
    });
    return deepMerge(result, builtRules$1);
  } // Remove a bunch of nodes that tailwind uses for limiting rule generation
  // https://github.com/tailwindlabs/tailwindcss/commit/b69e46cc1b32608d779dad35121077b48089485d#diff-808341f38c6f7093a7979961a53f5922R20


  if (['layer', 'variants', 'responsive'].includes(rule.name)) {
    return deepMerge.apply(void 0, [ result ].concat( getUserPluginRules(rule.nodes, screens, isBase) ));
  }

  var atSelector = buildAtSelector(rule.name, rule.params, screens);
  return deepMerge(result, ( obj = {}, obj[atSelector] = getUserPluginRules(rule.nodes, screens, isBase), obj ));
}, {}); };

var getUserPluginData = function (ref) {
  var config = ref.config;

  if (!config.plugins || config.plugins.length === 0) {
    return;
  } // Use Tailwind (using PostCss) to process the plugin data


  var processedPlugins = processPlugins(config.plugins, config);
  /**
   * Variants
   */
  // No support for Tailwind's addVariant() function

  /**
   * Base
   */

  var base = getUserPluginRules(processedPlugins.base, config.theme.screens, true);
  /**
   * Components
   */

  var components = getUserPluginRules(processedPlugins.components, config.theme.screens);
  /**
   * Utilities
   */

  var utilities = getUserPluginRules(processedPlugins.utilities, config.theme.screens);
  return {
    base: base,
    components: components,
    utilities: utilities
  };
};

var getPackageUsed = function (ref) {
  var preset = ref.config.preset;
  var cssImport = ref.cssImport;
  var styledImport = ref.styledImport;

  return ({
  isEmotion: preset === 'emotion' || styledImport.from.includes('emotion') || cssImport.from.includes('emotion'),
  isStyledComponents: preset === 'styled-components' || styledImport.from.includes('styled-components') || cssImport.from.includes('styled-components'),
  isGoober: preset === 'goober' || styledImport.from.includes('goober') || cssImport.from.includes('goober'),
  isStitches: preset === 'stitches' || styledImport.from.includes('stitches') || cssImport.from.includes('stitches')
});
};

var macroTasks = [handleTwFunction, handleGlobalStylesFunction, // GlobalStyles import
updateStyledReferences, // Styled import
handleStyledFunction, // Convert tw.div`` & styled.div`` to styled('div', {}) (stitches)
updateCssReferences, // Update any usage of existing css imports
handleThemeFunction, // Theme import
handleScreenFunction, // Screen import
addStyledImport, addCssImport // Gotcha: Must be after addStyledImport or issues with theme`` style transpile
];

var twinMacro = function (ref) {
  var t = ref.babel.types;
  var references = ref.references;
  var state = ref.state;
  var config = ref.config;

  validateImports(references);
  var program = state.file.path;
  var isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev' || false;
  state.isDev = isDev;
  state.isProd = !isDev;
  var ref$1 = getConfigTailwindProperties(state, config);
  var configExists = ref$1.configExists;
  var configTailwind = ref$1.configTailwind; // Get import presets

  var styledImport = getStyledConfig({
    state: state,
    config: config
  });
  var cssImport = getCssConfig({
    state: state,
    config: config
  }); // Identify the css-in-js library being used

  var packageUsed = getPackageUsed({
    config: config,
    cssImport: cssImport,
    styledImport: styledImport
  });

  for (var i = 0, list = Object.entries(packageUsed); i < list.length; i += 1) {
    var ref$2 = list[i];
    var key = ref$2[0];
    var value = ref$2[1];

    state[key] = value;
  }

  var configTwin = getConfigTwinValidated(config, state);
  state.configExists = configExists;
  state.config = configTailwind;
  state.configTwin = configTwin;
  state.globalStyles = new Map();
  state.tailwindConfigIdentifier = generateUid('tailwindConfig', program);
  state.tailwindUtilsIdentifier = generateUid('tailwindUtils', program);
  state.userPluginData = getUserPluginData({
    config: state.config
  });
  isDev && Boolean(config.debugPlugins) && state.userPluginData && debugPlugins(state.userPluginData);
  state.styledImport = styledImport;
  state.cssImport = cssImport; // Init identifiers

  state.styledIdentifier = null;
  state.cssIdentifier = null; // Group traversals together for better performance

  program.traverse({
    ImportDeclaration: function ImportDeclaration(path$$1) {
      setStyledIdentifier({
        state: state,
        path: path$$1,
        styledImport: styledImport
      });
      setCssIdentifier({
        state: state,
        path: path$$1,
        cssImport: cssImport
      });
    },

    JSXElement: function JSXElement(path$$1) {
      var allAttributes = path$$1.get('openingElement.attributes');
      var jsxAttributes = allAttributes.filter(function (a) { return a.isJSXAttribute(); });
      var ref = getCssAttributeData(jsxAttributes);
      var index = ref.index;
      var hasCssAttribute = ref.hasCssAttribute; // Make sure hasCssAttribute remains true once css prop has been found
      // so twin can add the css prop

      state.hasCssAttribute = state.hasCssAttribute || hasCssAttribute; // Reverse the attributes so the items keep their order when replaced

      var orderedAttributes = index > 1 ? jsxAttributes.reverse() : jsxAttributes;

      for (var i = 0, list = orderedAttributes; i < list.length; i += 1) {
        path$$1 = list[i];

        handleClassNameProperty({
          path: path$$1,
          t: t,
          state: state
        });
        handleTwProperty({
          path: path$$1,
          t: t,
          state: state,
          program: program
        });
        handleCsProperty({
          path: path$$1,
          t: t,
          state: state
        });
      }

      hasCssAttribute && convertHtmlElementToStyled({
        path: path$$1,
        t: t,
        program: program,
        state: state
      });
    }

  });
  if (state.styledIdentifier === null) { state.styledIdentifier = generateUid('styled', program); }
  if (state.cssIdentifier === null) { state.cssIdentifier = generateUid('css', program); }

  for (var i$1 = 0, list$1 = macroTasks; i$1 < list$1.length; i$1 += 1) {
    var task = list$1[i$1];

    task({
      styledImport: styledImport,
      cssImport: cssImport,
      configTwin: configTwin,
      references: references,
      program: program,
      config: config,
      state: state,
      t: t
    });
  }

  program.scope.crawl();
};

var macro = babelPluginMacros.createMacro(twinMacro, {
  configName: 'twin'
});

module.exports = macro;
//# sourceMappingURL=macro.js.map
