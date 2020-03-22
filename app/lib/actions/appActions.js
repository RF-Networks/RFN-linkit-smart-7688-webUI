const promise = require('bluebird');
const rpc = require('../util/rpcAPI')
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
  
  resetPassword: (user, password) => {
    return rpc.default.resetPassword(user, password, window.session);
  },
  
  loadNetwork: (session) => {
    return rpc.default.loadNetwork(session);
  },
  
  loadNetstate: (session) => {
    return rpc.default.loadNetstate(session);
  },
  
  loadSystem: (session) => {
    return rpc.default.loadSystem(session);
  },
  
  initialFetchData: (session) => {
	return promise.delay(10).then(() => {
      return [
        rpc.default.loadSystem(session),
		rpc.default.loadWifi(session),
        rpc.default.loadNetwork(session),
		rpc.default.loadNetstate('lan', session),
		rpc.default.loadNetstate('wan', session),
      ];
    })
    .spread((system, wifi, network, lan, wan) => {
      const boardInfo = {};
      boardInfo.system = system.body.result[1].values;
	  boardInfo.wifi = wifi.body.result[1].values;
      boardInfo.network = network.body.result[1].values;
	  boardInfo.lan = lan.body.result[1];
	  boardInfo.wan = wan.body.result[1];
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
  
  scanWifi: (session) => {
    return rpc.default.scanWifi(session);
  },
  
  setWifi: (mode, content, session) => {	
	if (mode === 'apsta') {
	  return rpc.default.setWifi('sta', content.ssid, content.key, session)
	  .then(() => {
        return rpc.default.setWifi('ap', content.repeaterSsid, content.repeaterKey, session);
      });
	}
	return rpc.default.setWifi(mode, content.ssid, content.key, session);
  },
  
  setLinkitMode: (mode, session) => {
	return rpc.default.setLinkitMode(mode, session);
  },
};

export default appActions;