const promise = require('bluebird');
const rpc = require('../util/rpcAPI');
const AppDispatcher = require('../dispatcher/appDispatcher');

let isLocalStorageNameSupported = false;

(() => {
  const testKey = 'test';
  const storage = window.sessionStorage;
  try {
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    isLocalStorageNameSupported = true;
  } catch (error) {
    window.memoryStorage = {};
    isLocalStorageNameSupported = false;
  }
})();

const appActions = {
  isLocalStorageNameSupported: isLocalStorageNameSupported,
  
  commitAndReboot: (session) => {
    return rpc.default.commitWifi(session)
    .then(() => {
      return rpc.default.reboot(session);
    })
    .catch(() => {
      return rpc.default.reboot(session);
    });
  },
  loadModel: (session) => {
    return rpc.default.loadModel(session);
  },
  
  loadSystem: (session) => {
    return rpc.default.loadSystem(session);
  },
  
  initialFetchData: (session) => {
    return promise.delay(10).then(() => {
      return [
        rpc.default.loadSystem(session),
		rpc.default.loadNetstate('lan', session),
      ];
    })
    .spread((system, lan) => {
      const boardInfo = {};
      boardInfo.system = system.body.result[1].values;
	  boardInfo.lan = lan.body.result[1];
      return boardInfo;
    })
    .then((boardInfo) => {
      AppDispatcher.dispatch({
        APP_PAGE: 'CONTENT',
        boardInfo: boardInfo,
        successMsg: null,
        errorMsg: null,
      });
	  return null;
    });
  },
  
  login: function(user, password) {
    const this$ = this;
    return rpc.default.login(user, password)
    .then((data) => {
      const session = data.body.result[1].ubus_rpc_session;
      return session;
    })
    .then((session) => {
      window.session = session;
      if (this$.isLocalStorageNameSupported) {
        window.localStorage.info = JSON.stringify({
          user: user,
          password: password,
        });
        window.localStorage.session = session;
      } else {
        window.memoryStorage.info = JSON.stringify({
          user: user,
          password: password,
        });
        window.memoryStorage.session = session;
      }

      return rpc.default.grantCode(session);
    })
    .then(() => {
      return this$.initialFetchData(window.session);
    })
    .catch((err) => {
      window.session = '';

      if (this$.isLocalStorageNameSupported) {
        delete window.localStorage.session;
        delete window.localStorage.info;
      } else {
        delete window.memoryStorage.session;
        delete window.memoryStorage.info;
      }

      if (err.message === 'Connection failed') {
        AppDispatcher.dispatch({
          APP_PAGE: 'LOGIN',
          successMsg: null,
          errorMsg: 'Waiting',
        });
		return null;
      }

      alert(err.message);
	  return null;
    });
  },

  resetHostName: (hostname, session) => {
    return rpc.default.resetHostName(hostname, session);
  },
  resetPassword: (user, password) => {
    return rpc.default.resetPassword(user, password, window.session);
  },
  
  getQuery: (name) => {
    let match;
    const pl = /\+/g; /* Regex for replacing addition symbol with a space */
    const search = /([^&=]+)=?([^&]*)/g;
    const query = window.location.search.substring(1);
    const decode = (s) => {
      return decodeURIComponent(s.replace(pl, ' '));
    };

    const urlParams = {};
    while (match = search.exec(query)) {
      urlParams[decode(match[1])] = decode(match[2]);
    }

    return urlParams[name];
  },
};

export default appActions;