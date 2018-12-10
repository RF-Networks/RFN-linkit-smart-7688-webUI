//const Promise = require('bluebird');
//const request = require('superagent');
//const ubusStatus = require('./ubusStatus');
import Promise from 'bluebird';
import request from 'superagent';
import ubusStatus from './ubusStatus'
let id = 1;
let RPCurl = '/ubus';

if (window.location.hostname === '127.0.0.1') {
  RPCurl = 'http://mylinkit.local/ubus';
}

const rpcAPI = {
  request: function(config) {
    return new Promise((resolve, reject) => {
      request
      .post(RPCurl)
      .send(config)
      .set('Accept', 'application/json')
      .end((err, res) => {
        // return res.ok ? resolve(res) : reject(err);
        if (!res) {
          return reject(new Error('Connection failed'));
        }

        if (!res.ok) {
          return reject(new Error('Connection failed'));
        }

        if (res.body && res.body.error) {
          return reject(new Error(res.body.error.message));
        }

        if (!res.body.result || res.body.result[0] !== 0) {
          return reject(new Error(ubusStatus[res.body.result[0]]));
        }
		
        return resolve(res);
      });
    });
  },

  // ====== login start ========
  login: function(userId, password) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        '00000000000000000000000000000000',
        'session',
        'login',
        {
          username: userId,
          password: password,
        },
      ],
    };
    return this.request(config);
  },
  loadModel: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [ session, 'system', 'board', { dummy: 0 }],
    };

    return this.request(config);
  },

  grantCode: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'session',
        'grant',
        {
          scope: 'uci',
          objects: [['*', 'read'], ['*', 'write']],
        },
      ],
    };
    return this.request(config);
  },
  // ====== login end ========
  scanWifi: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'iwinfo', 'scan', { device: 'wlan0' }],
    };

    return this.request(config);
  },
  setWifiNetworkConfig: function(network, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'wireless',
          section: 'sta',
          values: {
            network: network,
          },
        },
      ],
    };
    return this.request(config);
  },
  disableWifiInterface: function(section, disable, session) {
	const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'wireless',
          section: section,
          values: {
            disabled: disable,
          },
        },
      ],
    };

	return this.request(config);
  },
  setWifiMode: function(mode, section, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'wireless',
          section: 'radio0',
          values: {
            linkit_mode: mode,
          },
        },
      ],
    };
    return this.request(config);
  },
  renameLanConfig: function(old_name, new_name, session) {
	const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'rename',
        {
          config: 'network',
          section: 'lan',
          option: old_name,
		  name: new_name
        },
      ],
    };
    return this.request(config);
  },
  setLanMode: function(mode, session) {
	const params = { };
	if (mode === 'ap') {
	  params.proto = 'static';
	} else {
	  params.proto = 'dhcp';
	}
		
	const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'network',
          section: 'lan',
          values: params,
        },
      ],
    };
    return this.request(config);
  },
  set3G: function(apn, pincode, username, password, session) {
	const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'network',
          section: '3G',
          values: {
            apn: apn,
            pincode: pincode,
			username: username,
            password: password,
          },
        },
      ],
    };

    return this.request(config);
  },
  setWifi: function(section, ssid, key, session) {
	let enc = 'none';
    if (key.length > 1) {
      enc = 'psk2';
    }
	const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'wireless',
          section: section,
          values: {
            ssid: ssid,
            key: key,
            encryption: enc,
          },
        },
      ],
    };

    return this.request(config);
  },
  uciCommit: function(uciConfig, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'commit', {
          config: uciConfig,
        },
      ],
    };
    return this.request(config);
  },
  commitWifi: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'uci', 'apply', { commit: true }]};

    return this.request(config);
  },
  
  reboot: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'rpc-sys', 'reboot', { dummy: 0}],
    };

    return this.request(config);
  },
  resetPassword: function(user, password, session) {
    console.log("resetPassword %s %s %s", user, password, session);
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'rpc-sys',
        'password_set',
        {
          'user': user,
          'password': password,
        },
      ],
    };

    return this.request(config);
  },
  
  loadNetstate: function(iface, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'network.interface',
        'status',
        {
          interface: iface,
        },
      ],
    };

    return this.request(config);
  },
  
  loadNetwork: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'uci', 'get', { config: 'network' }],
    };

    return this.request(config);
  },
  
  loadSystem: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'get',
        {
          config: 'system',
          type: 'system',
        },
      ],
    };
    return this.request(config);
  },
  
  loadWifi: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'uci', 'get', { config: 'wireless' }],
    };

    return this.request(config);
  },
  
  resetHostName: function(hostname, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set', {
          config: 'system',
          section: '@system[0]',
          values: { hostname: hostname },
        },
      ],
    };

    return this.request(config);
  },
};

export default rpcAPI;