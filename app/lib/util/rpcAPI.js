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
          return reject('Connection failed');
        }

        if (!res.ok) {
          return reject('Connection failed');
        }

        if (res.body && res.body.error) {
          return reject(res.body.error.message);
        }

        if (!res.body.result || res.body.result[0] !== 0) {
          return reject(ubusStatus[res.body.result[0]]);
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
};

export default rpcAPI;