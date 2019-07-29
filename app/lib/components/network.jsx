import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Radium from 'radium';
import { withStyles } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import Card from '@material-ui/core/Card';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Divider from '@material-ui/core/Divider';
import AppActions from '../actions/appActions';
import AppDispatcher from '../dispatcher/appDispatcher';
import icon7688 from '../../img/7688.gif';
import icon7688Duo from '../../img/7688_duo.png';

const styles = props => ({
  content: {
    paddingRight: '128px',
    paddingLeft: '128px',
    '@media (max-width: 760px)': {
      paddingRight: '20px',
      paddingLeft: '20px',
    },
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
});

@Radium
class networkComponent extends React.Component {
  static propTypes = {
    errorMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    successMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    boardInfo: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  }
  
  constructor(props) {
    super(props);
    this.classes = props;
	
	this.state = {
      modal: true,
      errorMsgTitle: null,
      errorMsg: null,
	  mode: 'ap',
	  lanmode: (this.props.boardInfo.lan.proto === 'static')? 'ap' : 'sta',
	  boardMsgDialogShow: false,
	  errorDialogShow: false,
	  cellularEnabled: false,
	  cellularPasswordShow: false,
    };
	
	this.state.wifiList = [{
      payload: 0,
      text: __('Choose the Wi-Fi network.'),
    }];

	if (this.props.boardInfo.wifi.ap.encryption === 'none') {
      this.state.apContent = {
        ssid: this.props.boardInfo.wifi.ap.ssid || '',
        key: '',
        encryption: false,
      };
    } else {
      this.state.apContent = {
        ssid: this.props.boardInfo.wifi.ap.ssid || '',
        key: this.props.boardInfo.wifi.ap.key || '',
        encryption: true,
      };
    }
	
	this.state.cellularEnabled = (this.props.boardInfo.network['3G'] !== undefined);
	this.state.cellularConfig = this.props.boardInfo.network['3G'];
	if (this.state.cellularConfig !== undefined) {
	  if (this.state.cellularConfig.pincode === undefined)
	    this.state.cellularConfig.pincode = '';
      if (this.state.cellularConfig.username === undefined)
	    this.state.cellularConfig.username = '';
      if (this.state.cellularConfig.password === undefined)
	    this.state.cellularConfig.password = '';
	}
	
	this.state.showPassword = false;
    this.state.showRepeaterPassword = false;
    this.state.notPassPassword = false;
    this.state.notPassRepeaterPassword = false;
	this.state.selectValue = 0;
	this.state.staContent = {
      ssid: this.props.boardInfo.wifi.sta.ssid || '',
      key: this.props.boardInfo.wifi.sta.key || '',
      encryption: this.props.boardInfo.wifi.sta.encryption.enabled || false,
    };

    this.state.apstaContent = {
      ssid: this.props.boardInfo.wifi.sta.ssid || '',
      key: this.props.boardInfo.wifi.sta.key || '',
      encryption: this.props.boardInfo.wifi.sta.encryption.enabled || false,
      repeaterSsid: this.props.boardInfo.wifi.ap.ssid || '',
      repeaterKey: this.props.boardInfo.wifi.ap.key || '',
    };
	
	// Detect Wi-Fi mode
	if ((this.props.boardInfo.wifi.ap.disabled === undefined || !parseInt(this.props.boardInfo.wifi.ap.disabled)) && 
	    (this.props.boardInfo.wifi.sta.disabled === undefined || !parseInt(this.props.boardInfo.wifi.sta.disabled)))
	  this.state.mode = 'apsta';
	else if ((this.props.boardInfo.wifi.ap.disabled === undefined || !parseInt(this.props.boardInfo.wifi.ap.disabled)) && 
		parseInt(this.props.boardInfo.wifi.sta.disabled))
	  this.state.mode = 'ap';	
	else
	  this.state.mode = 'sta';  
  
    switch (this.state.mode) {
	  case 'ap':
        if (this.state.apContent.key.length > 0 && this.state.apContent.key.length < 8 ) {
          this.state.notPassPassword = true;
        }
        break;
      case 'sta':
        break;
      case 'apsta':
        if (this.state.apstaContent.key.length > 0 && this.state.apstaContent.key.length < 8 ) {
          this.state.notPassPassword = true;
        }
        if (this.state.apstaContent.repeaterKey.length > 0 && this.state.apstaContent.repeaterKey.length < 8 ) {
          this.state.notPassRepeaterPassword = true;
        }
        break;
      default:
        break;
    }

	this._scanWifi = this._scanWifi.bind(this);
	this._handleSelectValueChange = this._handleSelectValueChange.bind(this);
	this._handleSettingMode = this._handleSettingMode.bind(this);
	this.selectWifiList = false;
	this._returnToIndex = this._returnToIndex.bind(this);
	this._onRadioButtonClick = this._onRadioButtonClick.bind(this);
	this._onLANRadioButtonClick = this._onLANRadioButtonClick.bind(this);
  }
  
  componentWillMount() {
	const this$ = this;
	AppActions.loadModel(window.session)
    .then((data) => {
      return this$.setState({ boardModel: data.body.result[1].model });
    });
  }
  
  componentDidMount() {
	return this._scanWifi();
  }
  
  render() {
	const { classes, theme } = this.props;
	
	let textType = 'password';
	let repeaterTextType = 'password';
	let cellularTextType = 'password';
	let elem;
	let hasError = false;
	let staPassword;
	let errorText = __('Please enter your password');
	let boardImg;
	let cellularElem = '';
	
	if (this.state.showPassword) {
      textType = 'text';
    }
	if (this.state.showRepeaterPassword) {
      repeaterTextType = 'text';
    }
	
	if (this.state.cellularPasswordShow) {
      cellularTextType = 'text';
    }
	
	if (this.state.notPassPassword || this.state.notPassRepeaterPassword) {
		errorText = __('Please use at least 8 alphanumeric characters.');
		hasError = true;
	}
	
	if (this.state.boardModel === 'MediaTek LinkIt Smart 7688') {
      boardImg = icon7688;
    } else {
      boardImg = icon7688Duo;
    }
	
	if (this.state.cellularEnabled) {
	  cellularElem = (
		<div>
		  <br/>
	      <h4>Cellular</h4>
		  <TextField 
		    type="text"
			helperText="APN"
			style={{ width: '100%' }}
			required 
			label="APN"
			value={ this.state.cellularConfig.apn || '' }
			onChange={
              (e) => {
				this.setState({
                  cellularConfig: {
                      apn: e.target.value,
					  pincode: this.state.cellularConfig.pincode,
					  username: this.state.cellularConfig.username,
					  password: this.state.cellularConfig.password,
                  },
                });
              }
            }
			/>
		  <br/>
		  <TextField 
		    type="text"
			helperText="PIN"
			style={{ width: '100%' }}
			required 
			label="PIN"
			value={ this.state.cellularConfig.pincode || '' }
			onChange={
              (e) => {
                this.setState({
                  cellularConfig: {
                      apn: this.state.cellularConfig.apn,
					  pincode: e.target.value,
					  username: this.state.cellularConfig.username,
					  password: this.state.cellularConfig.password,
                  },
                });
              }
            }
			/>
		  <br/>
		  <TextField 
		    type="text"
			helperText={ __('Username') }
			style={{ width: '100%' }}
			required 
			label={ __('Username') }
			value={ this.state.cellularConfig.username || '' }
			onChange={
              (e) => {
                this.setState({
                  cellularConfig: {
                      apn: this.state.cellularConfig.apn,
					  pincode: this.state.cellularConfig.pincode,
					  username: e.target.value,
					  password: this.state.cellularConfig.password,
                  },
                });
              }
            }
			/>
		  <br/>
		  <TextField
			style={{ width: '100%' }}
			value={ this.state.cellularConfig.password || '' }
			helperText={__('Please enter your password')}
			type={ cellularTextType }
			label={__('Password')}
			onChange={
              (e) => {
                this.setState({
                  cellularConfig: {
                      apn: this.state.cellularConfig.apn,
					  pincode: this.state.cellularConfig.pincode,
					  username: this.state.cellularConfig.username,
					  password: e.target.value,
                  },
                });
              }
            }
			InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Toggle password visibility"
                    onClick={ () => { this.setState(state => ({ cellularPasswordShow: !state.cellularPasswordShow }));}}
                  >
                    {this.state.cellularPasswordShow ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
			/>
		  <br/>
		</div>
	  );
	}
	
	if (this.state.mode === 'sta') {
	  if (this.state.staContent.encryption) {
		staPassword = (
		  <div>
		    <TextField
			  style={{ width: '100%' }}
			  value={ this.state.staContent.key }
			  helperText={__('Please enter your password')}
			  type={ textType }
			  label={__('Password')}
			  onChange={
                (e) => {
                  this.setState({
                    staContent: {
                      ssid: this.state.staContent.ssid,
                      key: e.target.value,
                      encryption: true,
                      repeaterSsid: this.state.staContent.repeaterSsid,
                      repeaterKey: this.state.staContent.repeaterKey,
                    },
                  });
                }
              }
			  InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Toggle password visibility"
                      onClick={ () => { this.setState(state => ({ showPassword: !state.showPassword }));}}
                    >
                      {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
			  />
		  </div>
		);
	  }
	} else if (this.state.mode === 'apsta') {
	  if (this.state.apstaContent.encryption) {
	    staPassword = (
		  <div>
			<TextField
			  style={{ width: '100%' }}
			  value={ this.state.apstaContent.key }
			  helperText={__('Please enter your password')}
			  type={ textType }
			  label={__('Password')}
			  onChange={
                (e) => {
                  this.setState({
                    apstaContent: {
                      ssid: this.state.apstaContent.ssid,
                      key: e.target.value,
                      encryption: true,
                      repeaterSsid: this.state.apstaContent.repeaterSsid,
                      repeaterKey: this.state.apstaContent.repeaterKey,
                    },
                  });
                }
              }
			  InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Toggle password visibility"
                      onClick={ () => { this.setState(state => ({ showPassword: !state.showPassword }));}}
                    >
                      {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
			  />
		  </div>
	    );
	  }
	}
	
	switch (this.state.mode) {
	  case 'ap':
		elem = (
		  <div>
			<TextField 
			  type="text"
			  helperText={ __('Input your SSID') }
			  label= { __('Network name') }
			  style={{ width: '100%' }}
			  required 
			  value={ this.state.apContent.ssid }
			  onChange={
		        (e) => { 
			      this.setState({ 
				    ssid: e.target.value,
					key: this.state.apContent.key,
				  });
			    } 
		      }/>
			<TextField 
			  type={ textType }
			  helperText={ __('Please enter your password') }
			  error = { hasError }
			  label= { __('Password') }
			  style={{ width: '100%' }}
			  required 
			  value={ this.state.apContent.key }
			  onChange={
		        (e) => { 
			      if ( e.target.value.length > 0 && e.target.value.length < 8) {
                    this.setState({
                      apContent: {
                        ssid: this.state.apContent.ssid,
                        key: e.target.value,
                      },
                      notPassPassword: true,
                    });
                  } else if (e.target.value.length === 0) {
                    this.setState({
                      apContent: {
                        ssid: this.state.apContent.ssid,
                        key: e.target.value,
                      },
                      notPassPassword: false,
                    });
                  } else {
                    this.setState({
                      apContent: {
                        ssid: this.state.apContent.ssid,
                        key: e.target.value,
                      },
                      notPassPassword: false,
                    });
                  }
                }
			  }
			  InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Toggle password visibility"
                      onClick={ () => { this.setState(state => ({ showPassword: !state.showPassword }));}}
                    >
                      {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}/>
		  </div>
		);
		break;
	  case 'sta':
	    elem = (
		  <div>
		    <FormControl className={classes.formControl}
			  style={{
                width: '100%',
                maxWidth: '512px',
			  }}>
		      <InputLabel shrink>
		        { __('Detected Wi-Fi network') } <b style={{ color: 'red' }}>*</b>
              </InputLabel>
		      <Select
			    value={ Number(this.state.selectValue) }
			    required 
			    onChange={ this._handleSelectValueChange.bind(null, 'selectValue') }>
			    {this.state.wifiList.map(wifi => (
                  <MenuItem key={wifi.payload} value={wifi.payload} style={{ maxHeight: '100px' }}>
                    {wifi.text}
                  </MenuItem>
                ))}
			  </Select>
			</FormControl>
			<Button 
			  style={{ marginTop: '5px',
			    marginBottom: '15px',
				color: '#ffffff',
				backgroundColor: green[500],
				'&:hover': {
				  backgroundColor: green[700],
				},
			  }} 
			  onClick={ () => { this._scanWifi();} }>
				{__('Refresh')}
			</Button>
			<br/>
			{ staPassword }
		  </div>
		);
	    break;
	  case 'apsta':
	    elem = (
		  <div>
		    <FormControl className={classes.formControl}
			  style={{
                width: '100%',
                maxWidth: '512px',
			  }}>
		      <InputLabel shrink>
		        { __('Detected Wi-Fi network') } <b style={{ color: 'red' }}>*</b>
              </InputLabel>
		      <Select
			    value={ Number(this.state.selectValue) }
			    required 
			    onChange={ this._handleSelectValueChange.bind(null, 'selectValue') }>
			    {this.state.wifiList.map(wifi => (
                  <MenuItem key={wifi.payload} value={wifi.payload} style={{ maxHeight: '100px' }}>
                    {wifi.text}
                  </MenuItem>
                ))}
			  </Select>
			</FormControl>
			<Button 
			  style={{ marginTop: '5px',
			    marginBottom: '15px',
				color: '#ffffff',
				backgroundColor: green[500],
				'&:hover': {
				  backgroundColor: green[700],
				},
			  }} 
			  onClick={ () => { this._scanWifi();} }>
				{__('Refresh')}
			</Button>
			<br/>
			{ staPassword }
			<br/>
			<TextField type="text"
			  helperText={__('Input your SSID')}
			  value={ this.state.apstaContent.repeaterSsid }
			  style={{ width: '100%' }}
			  required
			  label={__('Repeater SSID')}
			  onChange={
                (e) => {
                  this.setState({
                    apstaContent: {
                      ssid: this.state.apstaContent.ssid,
                      key: this.state.apstaContent.key,
                      encryption: this.state.apstaContent.encryption,
                      repeaterSsid: e.target.value,
                      repeaterKey: this.state.apstaContent.repeaterKey,
                    },
                  });
                }
              }
			  />
			<TextField 
			  label={__('Repeater password')}
			  error = { hasError }
			  type={ repeaterTextType }
			  helperText={ errorText }
			  value={ this.state.apstaContent.repeaterKey }
			  style={{ width: '100%' }}
			  
			  onChange={
                (e) => {
				  if ( e.target.value.length > 0 && e.target.value.length < 8) {
					this.setState({
                      apstaContent: {
                        ssid: this.state.apstaContent.ssid,
                        key: this.state.apstaContent.key,
                        encryption: this.state.apstaContent.encryption,
                        repeaterSsid: this.state.apstaContent.repeaterSsid,
                        repeaterKey: e.target.value,
                      },
                      notPassRepeaterPassword: true,
                  });
				  } else if (e.target.value.length === 0) {
					this.setState({
                      apstaContent: {
                        ssid: this.state.apstaContent.ssid,
                        key: this.state.apstaContent.key,
                        encryption: this.state.apstaContent.encryption,
                        repeaterSsid: this.state.apstaContent.repeaterSsid,
                        repeaterKey: e.target.value,
                      },
                      notPassRepeaterPassword: false,
                    });
				  } else {
					this.setState({
                      apstaContent: {
                        ssid: this.state.apstaContent.ssid,
                        key: this.state.apstaContent.key,
                        encryption: this.state.apstaContent.encryption,
                        repeaterSsid: this.state.apstaContent.repeaterSsid,
                        repeaterKey: e.target.value,
                      },
                      notPassRepeaterPassword: false,
                    });
				  }
			    }
			  }
			  InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Toggle password visibility"
                      onClick={ () => { this.setState(state => ({ showRepeaterPassword: !state.showRepeaterPassword }));}}
                    >
                      {this.state.showRepeaterPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
			  />
		  </div>
		);
	    break;
	}
	
	return (
      <div>
	    <Card>
		  <Dialog open={this.state.boardMsgDialogShow} ref="boardMsgDialog" aria-labelledby="simple-dialog-title">
			<DialogTitle id="simple-dialog-title">{__('Device Restarting. Please Wait…')}</DialogTitle>
			<DialogContent style={{ textAlign: 'center', }}>
			  <DialogContentText style={{
				  fontSize: '16px',
				  color: '#999A94',
				  lineHeight: '18.54px',
				  textAlign: 'left',
				}}>
				{ __('See the Wi-Fi LED, it will light on steadily and start to blink or turn off afterwards. When the LED starts to blink or turn off, reload this webpage to sign in again.') }
			  </DialogContentText>
			  <img src={ boardImg } style={{ width: '350px', marginTop: '10px', marginBottom: '-20px',}} />
			</DialogContent>
			<DialogActions>
			  <Button 
				  onClick={() => { 
					this.setState({ boardMsgDialogShow: false }); 
					AppDispatcher.dispatch({
					  APP_PAGE: 'LOGIN',
					  successMsg: __('Configuration saved. You can sign in to the console after your device has restarted.'),
					  errorMsg: null,
					});
				  }} 
				  color="primary">
				OK
			  </Button>
			</DialogActions>
		  </Dialog>
			
		  <Dialog open={this.state.errorDialogShow} ref="errorDialog" aria-labelledby="simple-dialog-title">
			<DialogTitle id="simple-dialog-title">{this.state.errorMsgTitle}</DialogTitle>
			<DialogContent>
			  <DialogContentText style={{ color: '#999A94', marginTop: '-20px' }}>
				{this.state.errorMsgTitle}
			  </DialogContentText>
			</DialogContent>
			<DialogActions>
			  <Button onClick={() => this.setState({ errorDialogShow: false })} color="primary">
			    OK
			  </Button>
			</DialogActions>
		  </Dialog>
		  <div className={ classes.content }>
		    <h3>{__('Network setting')}</h3>
			<h4>LAN</h4>
			<RadioGroup row
				name="lanmode"
				className={classes.group}
				value={this.state.lanmode}
				onChange={this._onLANRadioButtonClick}>
			  <FormControlLabel
                value="ap"
                control={<Radio color="primary" />}
                label={__('AP mode')}
                labelPlacement="start"
              />
			  <FormControlLabel
                value="sta"
                control={<Radio color="primary" />}
                label={__('Station mode')}
                labelPlacement="start"
              />
			</RadioGroup>
			<Divider variant="middle" />
			<h4>Wi-Fi</h4>
			<RadioGroup row
				name="mode"
				className={classes.group}
				value={this.state.mode}
				onChange={this._onRadioButtonClick}>
			  <FormControlLabel
                value="ap"
                control={<Radio color="primary" />}
                label={__('AP mode')}
                labelPlacement="start"
              />
			  <FormControlLabel
                value="sta"
                control={<Radio color="primary" />}
                label={__('Station mode')}
                labelPlacement="start"
              />
			  <FormControlLabel
                value="apsta"
                control={<Radio color="primary" />}
                label={__('Repeater mode')}
                labelPlacement="start"
              />
			</RadioGroup>
			{ elem }
		    { cellularElem }
			<div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
			  <Button
			    style={{
                  width: '236px',
                  flexGrow: 1,
                  textAlign: 'center',
                  marginTop: '20px',
                  marginBottom: '20px',
                  marginRight: '10px',
				  color: '#999A94',
				  backgroundColor: '#EDEDED',
			      '&:hover': {
			        backgroundColor: '#EDEDED',
			      },
                }}>
			    { __('Cancel') }
              </Button>
			  <Button
				style={{
                  width: '236px',
                  flexGrow: 1,
                  textAlign: 'center',
                  marginTop: '20px',
                  marginBottom: '20px',
                  marginLeft: '10px',
				  color: '#ffffff',
				  backgroundColor: green[500],
			      '&:hover': {
			        backgroundColor: green[700],
			      },
                }} 
				onClick={ () => { this._handleSettingMode(); } }>
			    { __('Configure & Restart') }
              </Button>
			</div>
		  </div>
		</Card>
	  </div>
	);
  }
  
  _onRadioButtonClick = event => {
	switch (event.target.value) {
	  case 'ap':
	    if (this.state.apContent.key.length > 0 && this.state.apContent.key.length < 8) {
          this.setState({ mode: event.target.value, notPassPassword: true, showPassword: false});
        } else {
          this.setState({ mode: event.target.value });
        }
		break;
	  case 'sta':
	    this.setState({ mode: event.target.value, notPassPassword: false, showPassword: false, showRepeaterPassword: false, notPassRepeaterPassword: false });
		break;
	  case 'apsta':
	    if (this.state.apstaContent.key.length > 0 && this.state.apstaContent.key.length < 8) {
          this.setState({ mode: event.target.value, notPassPassword: false, showPassword: false, showRepeaterPassword: false, notPassRepeaterPassword: false });
        } else {
          this.setState({ mode: event.target.value });
        }
		break;
	  default:
	    break;
	}
  };
  
  _onLANRadioButtonClick = event => {
	this.setState({ lanmode: event.target.value });
  };
  
  _scanWifi() {
	const this$ = this;
	return AppActions.scanWifi(window.session)
	.then((data) => {
	  let selectValue;
	  const staModeInfo = this$.state.staContent;
      const apstaModeInfo = this$.state.apstaContent;
	  for (let i = 0; i < data.body.result[1].results.length; i++ ) {
		data.body.result[1].results[i].payload = i + 1;
        data.body.result[1].results[i].text = data.body.result[1].results[i].ssid + ' ( ' + data.body.result[1].results[i].quality + ' % )';

		// To know which wifi use this wifi ssid.
		if (this$.props.boardInfo.wifi.sta.ssid === data.body.result[1].results[i].ssid) {
		  selectValue = i + 1;
          staModeInfo.encryption = data.body.result[1].results[i].encryption.enabled;
          apstaModeInfo.encryption = data.body.result[1].results[i].encryption.enabled;
		}
	  }
	  
	  return this$.setState({
		selectValue: selectValue,
        staContent: staModeInfo,
        apstaContent: apstaModeInfo,
		wifiList: data.body.result[1].results,
	  });
	});
  }
  
  _handleSelectValueChange(name, e) {
	const change = {};
    change[name] = e.target.value;
	
	change.staContent = {};
    change.staContent.key = '';
    change.staContent.ssid = this.state.wifiList[e.target.value - 1].ssid;
    change.staContent.encryption = this.state.wifiList[e.target.value - 1].encryption.enabled;
    change.apstaContent = {};
    change.apstaContent.key = '';
    change.apstaContent.ssid = this.state.wifiList[e.target.value - 1].ssid;
    change.apstaContent.encryption = this.state.wifiList[e.target.value - 1].encryption.enabled;
    change.apstaContent.repeaterSsid = this.state.apstaContent.repeaterSsid;
    change.apstaContent.repeaterKey = this.state.apstaContent.repeaterKey;
	this.setState(change);
  }
  
  _handleSettingMode() {
	const this$ = this;
	if (this.state.notPassPassword) {
      return false;
    }
	
	let mode = this.state.mode;
	
	if (this.state.lanmode !== 'ap') {
		mode = 'lancli';
		this.state.mode = 'ap';
	} 
	
	return AppActions.setWifi(this.state.mode, this.state[ this.state.mode + 'Content'], window.session)
	.then(() => {
		return AppActions.setLinkitMode(mode, window.session);
	})
	.then(() => {
		if (!this.state.cellularEnabled)
		  return null;
		return AppActions.set3G(this.state.cellularConfig.apn, this.state.cellularConfig.pincode, this.state.cellularConfig.username, this.state.cellularConfig.password, window.session);
	})
	.then(() => {
		return AppActions.commitAndReboot(window.session)
		.catch((err) => {
          if (err === 'no data' || err.msg === 'no data') {
            return false;
          }
          return err;
        });
	})
	.then(() => {
      return this$._returnToIndex(__('Configuration saved. You can sign in to the console after your device has restarted.'));
    })
	.catch((err) => {
	  if (err === 'Access denied') {
        this$.setState({
          errorMsgTitle: __('Access denied'),
          errorMsg: __('Your token was expired, please sign in again.'),
		  errorDialogShow: true,
        });
      } else {
		alert('[' + err + '] Please try again!');
	  }
	  return null;
	});
  }
  
  _returnToIndex(successMsg, errorMsg) {
	if (successMsg) {
	  this.setState({ boardMsgDialogShow: true });
      this.setState({ boardSuccessMsg: successMsg });
    } else {
      if (AppActions.isLocalStorageNameSupported) {
        delete window.localStorage.session;
        delete window.localStorage.info;
      } else {
        delete window.memoryStorage.session;
        delete window.memoryStorage.info;
      }
	  AppDispatcher.dispatch({
        APP_PAGE: 'LOGIN',
        successMsg: successMsg || null,
        errorMsg: errorMsg || null,
	  });
    }
	return null;
  }
}

networkComponent.childContextTypes = {
  classes: PropTypes.object,
};

export default withStyles(styles, { withTheme: true })(networkComponent);