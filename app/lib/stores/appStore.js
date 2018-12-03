const AppDispatcher = require('../dispatcher/appDispatcher');
const assign = require('object-assign');
const AppConstants = require('../constants/appConstants');
const AppActions = require('../actions/appActions');
const rpc = require('../util/rpcAPI');

const APP_PAGE = {};
const EventEmitter = require('events').EventEmitter;
const CHANGE_EVENT = 'change';

if (AppActions.isLocalStorageNameSupported) {
  window.session = localStorage.getItem('session') || null;
} else {
  window.session = (typeof window.memoryStorage !== 'undefined')? window.memoryStorage.session || null : null;
}

if (window.session) {
  console.log("Has session");
} else {
  rpc.default.login('root', '')
  .then((data) => {
	const session = data.body.result[1].ubus_rpc_session;
    window.session = session;
    return AppDispatcher.dispatch({
      APP_PAGE: 'FIRSTLOGIN',
      successMsg: null,
      errorMsg: null,
    });
  }).catch((err) => {
	console.log("Login error: %s", err);
    switch (err) {
      case 'Connection failed':
        return AppDispatcher.dispatch({
          APP_PAGE: 'LOGIN',
          successMsg: null,
          errorMsg: 'Waiting',
        });
        break;
      case 'Permission denied':
        return AppDispatcher.dispatch({
          APP_PAGE: 'LOGIN',
          successMsg: null,
          errorMsg: null,
        });
      break;
      default:
        return;
        break;
    }
  });
}

const appStore = assign({}, EventEmitter.prototype, {
  init: () => {
    return APP_PAGE;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

AppDispatcher.register((action) => {
  APP_PAGE.errorMsg = action.errorMsg || null;
  APP_PAGE.successMsg = action.successMsg || null;
  APP_PAGE.boardInfo = action.boardInfo || null;
  switch (action.APP_PAGE) {
	case AppConstants.FIRSTLOGIN:
      APP_PAGE.APP_PAGE = AppConstants.FIRSTLOGIN;
      appStore.emitChange();
      break;
    case AppConstants.LOGIN:
      APP_PAGE.APP_PAGE = AppConstants.LOGIN;
      appStore.emitChange();
      break;
    case AppConstants.CONTENT:
      APP_PAGE.APP_PAGE = AppConstants.CONTENT;
      appStore.emitChange();
      break;
	default:
      break;
  }
});

module.exports = appStore;