'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactNative = require('react-native');

var _reactNative2 = _interopRequireDefault(_reactNative);

var _reactTimerMixin = require('react-timer-mixin');

var _reactTimerMixin2 = _interopRequireDefault(_reactTimerMixin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var screenWidth = _reactNative.Dimensions.get('window').width;

var Swiper = function (_Component) {
  _inherits(Swiper, _Component);

  function Swiper(props) {
    _classCallCheck(this, Swiper);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Swiper).call(this, props));

    _this._initState = _this._initState.bind(_this);
    _this.state = _this._initState(_this.props);
    _this._autoplay = _this._autoplay.bind(_this);
    _this._onScrollBegin = _this._onScrollBegin.bind(_this);
    _this._onScrollEnd = _this._onScrollEnd.bind(_this);
    _this._updateIndex = _this._updateIndex.bind(_this);
    _this._scrollTo = _this._scrollTo.bind(_this);
    _this._renderPagination = _this._renderPagination.bind(_this);
    _this._renderTitle = _this._renderTitle.bind(_this);
    _this._renderScrollView = _this._renderScrollView.bind(_this);
    _this._onPageScrollStateChanged = _this._onPageScrollStateChanged.bind(_this);
    _this._calContainer = _this._calContainer.bind(_this);
    return _this;
  }

  _createClass(Swiper, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(props) {
      this.setState(this._initState(props));
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._autoplay();
    }
  }, {
    key: '_initState',
    value: function _initState(props) {
      var initState = {
        isScrolling: false,
        autoplayEnd: false
      };

      initState.total = props.children ? props.children.length || 1 : 0;
      initState.index = Math.max(Math.min(props.defaultIndex, initState.total - 1), 0);

      initState.dir = props.horizontal == false ? 'y' : 'x';
      initState.width = screenWidth;
      initState.height = screenWidth / props.whRatio;
      initState.offset = {};

      if (initState.total > 1) {
        var setup = props.loop ? initState.index + 1 : initState.index;
        initState.offset[initState.dir] = initState.dir == 'y' ? initState.height * setup : initState.width * setup;
      }
      this._viewPagerIndex = props.loop ? initState.index + 1 : initState.index;
      return initState;
    }

    /**
     * Automatic srolling
     */

  }, {
    key: '_autoplay',
    value: function _autoplay() {
      var _this2 = this;

      if (!Array.isArray(this.props.children) || !this.props.autoplay || this.state.isScrolling || this.state.autoplayEnd) return;

      this.clearTimeout(this.autoplayTimer);

      this.autoplayTimer = this.setTimeout(function () {
        if (!_this2.props.loop && (_this2.props.autoplayDirection ? _this2.state.index == _this2.state.total - 1 : _this2.state.index == 0)) {
          return _this2.setState({
            autoplayEnd: true
          });
        }
        _this2._scrollTo(_this2.props.autoplayDirection ? 1 : -1);
      }, this.props.autoplayTimeout * 1000);
    }

    /**
     * Scroll begin handle
     * @param  {object} e native event
     */

  }, {
    key: '_onScrollBegin',
    value: function _onScrollBegin(e) {
      var _this3 = this;

      // update scroll state
      this.setState({
        isScrolling: true
      });

      this.setTimeout(function () {
        _this3.props.onScrollBeginDrag && _this3.props.onScrollBeginDrag(e, _this3.state);
      });
    }

    /**
     * Scroll end handle
     * @param  {object} e native event
     */

  }, {
    key: '_onScrollEnd',
    value: function _onScrollEnd(e) {
      var _this4 = this;

      // update scroll state
      this.setState({
        isScrolling: false
      });

      // making our events coming from android compatible to updateIndex logic
      if (!e.nativeEvent.contentOffset) {
        if (this.state.dir == 'x') {
          e.nativeEvent.contentOffset = { x: e.nativeEvent.position * this.state.width };
        } else {
          e.nativeEvent.contentOffset = { y: e.nativeEvent.position * this.state.height };
        }
      }

      this._updateIndex(e.nativeEvent.contentOffset, this.state.dir);

      // Note: `this.setState` is async, so I call the `onMomentumScrollEnd`
      // in setTimeout to ensure synchronous update `index`
      this.setTimeout(function () {
        _this4._autoplay();

        // if `onMomentumScrollEnd` registered will be called here
        _this4.props.onMomentumScrollEnd && _this4.props.onMomentumScrollEnd(e, _this4.state);
      });
    }
  }, {
    key: '_onPageScrollStateChanged',
    value: function _onPageScrollStateChanged(scrollState) {
      if (scrollState == 'idle') {
        console.log('_onPageScrollStateChanged idle index:', this.state.index);
        if (this.state.isScrolling) {
          this.setState({
            isScrolling: false
          });
        }
        this._onScrollEnd({
          nativeEvent: {
            position: this._viewPagerIndex
          }
        });
        if (this.props.loop) {
          if (this._viewPagerIndex < 1) {
            this._viewPagerIndex = this.state.total;
            this.refs.scrollView.setPageWithoutAnimation(this._viewPagerIndex);
          } else if (this._viewPagerIndex > this.state.total) {
            this._viewPagerIndex = 1;
            this.refs.scrollView.setPageWithoutAnimation(1);
          }
        }
      } else {
        if (!this.state.isScrolling) {
          this.setState({
            isScrolling: true
          });
        }
      }
    }

    /**
     * Update index after scroll
     * @param  {object} offset content offset
     * @param  {string} dir    'x' || 'y'
     */

  }, {
    key: '_updateIndex',
    value: function _updateIndex(offset, dir) {
      var state = this.state;
      var index = state.index;
      var diff = offset[dir] - state.offset[dir];
      var step = dir == 'x' ? state.width : state.height;

      // Do nothing if offset no change.
      if (!diff) return;

      // Note: if touch very very quickly and continuous,
      // the variation of `index` more than 1.
      //index = index + diff / step;

      index = Math.round(offset[dir] / step);

      if (this.props.loop) {
        --index;
        if (index < 0) {
          index = state.total - 1;
          offset[dir] = step * state.total;
        } else if (index > state.total - 1) {
          index = 0;
          offset[dir] = step;
        }
      }

      this.setState({
        index: index,
        offset: offset
      });
    }

    /**
     * Scroll by index
     * @param  {number} index offset index
     */

  }, {
    key: '_scrollTo',
    value: function _scrollTo(index) {
      if (this.state.isScrolling || this.state.total < 2) return;
      var state = this.state;
      var diff = (this.props.loop ? 1 : 0) + index + this.state.index;
      var x = 0;
      var y = 0;
      if (state.dir == 'x') x = diff * state.width;
      if (state.dir == 'y') y = diff * state.height;
      if (this.refs.scrollView) {
        if (_reactNative.Platform.OS == 'ios') {
          this.refs.scrollView.scrollTo({
            y: y,
            x: x
          });
        } else {
          this._viewPagerIndex = diff;
          this.refs.scrollView.setPage(diff);
        }
      }

      // update scroll state
      this.setState({
        isScrolling: true,
        autoplayEnd: false
      });
    }

    /**
     * Render pagination
     * @return {object} react-dom
     */

  }, {
    key: '_renderPagination',
    value: function _renderPagination() {
      // By default, dots only show when `total` >= 2
      if (this.state.total <= 1) return null;
      var dots = [];
      var ActiveDot = _reactNative2.default.createElement(_reactNative.View, { style: [styles.activeDot, this.props.activeDotStyle] });
      var Dot = _reactNative2.default.createElement(_reactNative.View, { style: [styles.dot, this.props.dotStyle] });
      for (var i = 0; i < this.state.total; i++) {
        dots.push(i === this.state.index ? _reactNative2.default.cloneElement(ActiveDot, { key: i }) : _reactNative2.default.cloneElement(Dot, { key: i }));
      }

      return _reactNative2.default.createElement(
        _reactNative.View,
        {
          pointerEvents: 'none',
          style: [styles['pagination_' + this.state.dir], this.props.paginationStyle] },
        dots
      );
    }
  }, {
    key: '_renderTitle',
    value: function _renderTitle() {
      return this.props.renderTitle && this.props.renderTitle(this.state.index, this.props.children[this.state.index]);
    }
  }, {
    key: '_renderScrollView',
    value: function _renderScrollView(pages) {
      var _this5 = this;

      if (_reactNative.Platform.OS === 'ios') {
        return _reactNative2.default.createElement(
          _reactNative.ScrollView,
          _extends({
            ref: 'scrollView'
          }, this.props, {
            contentContainerStyle: [styles.wrapper],
            contentOffset: this.state.offset,
            onScrollBeginDrag: this._onScrollBegin,
            onMomentumScrollEnd: this._onScrollEnd }),
          pages
        );
      }
      return _reactNative2.default.createElement(
        _reactNative.ViewPagerAndroid,
        {
          ref: 'scrollView',
          onPageSelected: function onPageSelected(e) {
            _this5._viewPagerIndex = e.nativeEvent.position;
          },
          onPageScrollStateChanged: this._onPageScrollStateChanged,
          initialPage: this.props.loop ? this.state.index + 1 : this.state.index,
          style: [{ flex: 1, height: this.state.height }, styles.wrapper] },
        pages
      );
    }
  }, {
    key: '_calContainer',
    value: function _calContainer(e) {
      //if the swiper is not layout on full screen,it need reinit
      if (this.state.width != e.nativeEvent.layout.width) {
        var offset = {};
        var width = e.nativeEvent.layout.width;
        var height = width / this.props.whRatio;

        if (this.state.total > 1) {
          var setup = this.props.loop ? this.state.index + 1 : this.state.index;
          offset[this.state.dir] = this.state.dir == 'y' ? height * setup : width * setup;
        }
        this.setState({
          width: width,
          height: height,
          offset: offset
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this6 = this;

      if (!this.props.children) {
        return;
      } else {
        var _ret = function () {
          var state = _this6.state;
          var props = _this6.props;
          var children = props.children;
          var total = state.total;
          var loop = props.loop;

          var pages = [];
          var pageStyle = [{ width: state.width, height: state.height }, styles.slide];

          // For make infinite at least total > 1
          if (total > 1) {
            // Re-design a loop model for avoid img flickering
            pages = Object.keys(children);
            if (loop) {
              pages.unshift(total - 1);
              pages.push(0);
            }

            pages = pages.map(function (page, i) {
              return _reactNative2.default.createElement(
                _reactNative.View,
                { style: pageStyle, key: i },
                children[page]
              );
            });
          } else {
            pages = _reactNative2.default.createElement(
              _reactNative.View,
              { style: pageStyle },
              children
            );
          }

          return {
            v: _reactNative2.default.createElement(
              _reactNative.View,
              { style: [styles.container, _this6.props.style],
                onLayout: _this6._calContainer },
              _this6._renderScrollView(pages),
              props.showPagination && (props.renderPagination ? _this6.props.renderPagination(state.index, state.total) : _this6._renderPagination()),
              _this6._renderTitle()
            )
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }
    }
  }]);

  return Swiper;
}(_reactNative.Component);

Swiper.propTypes = {
  horizontal: _reactNative2.default.PropTypes.bool,
  style: _reactNative.View.propTypes.style,
  activeDotStyle: _reactNative.View.propTypes.style,
  dotStyle: _reactNative.View.propTypes.style,
  paginationStyle: _reactNative.View.propTypes.style,
  showPagination: _reactNative2.default.PropTypes.bool,
  loop: _reactNative2.default.PropTypes.bool,
  autoplay: _reactNative2.default.PropTypes.bool,
  autoplayTimeout: _reactNative2.default.PropTypes.number,
  autoplayDirection: _reactNative2.default.PropTypes.bool,
  defaultIndex: _reactNative2.default.PropTypes.number,
  whRatio: _reactNative2.default.PropTypes.number,
  renderPagination: _reactNative2.default.PropTypes.func
};
Swiper.defaultProps = {
  horizontal: true,
  pagingEnabled: true,
  showsHorizontalScrollIndicator: false,
  showsVerticalScrollIndicator: false,
  bounces: false,
  scrollsToTop: false,
  removeClippedSubviews: true,
  automaticallyAdjustContentInsets: false,
  showPagination: true,
  loop: true,
  autoplay: false,
  autoplayTimeout: 2.5,
  autoplayDirection: true,
  defaultIndex: 0,
  whRatio: 2
};
Swiper.autoplayTimer = null;
exports.default = Swiper;


Object.assign(Swiper.prototype, _reactTimerMixin2.default);

/**
 * Default styles
 * @type {StyleSheetPropType}
 */
var styles = _reactNative.StyleSheet.create({
  container: {
    backgroundColor: 'transparent'
  },

  wrapper: {
    backgroundColor: 'transparent'
  },

  slide: {
    backgroundColor: 'transparent'
  },

  pagination_x: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },

  pagination_y: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
    backgroundColor: 'rgba(0,0,0,.2)'
  },

  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
    backgroundColor: '#007aff'
  }
});