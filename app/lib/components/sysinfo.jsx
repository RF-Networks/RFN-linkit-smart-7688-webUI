import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Radium from 'radium';
import { withStyles } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import Card from '@material-ui/core/Card';
import AppActions from '../actions/appActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import AppDispatcher from '../dispatcher/appDispatcher';
import icon7688 from '../../img/7688.gif';
import icon7688Duo from '../../img/7688_duo.png';

const styles = props => ({
  h3: {
    marginBottom: '0px',
    marginTop: '0px',
  },

  panelTitle: {
    tapHighlightColor: 'rgba(0,0,0,0)',
    color: 'rgba(0, 0, 0, 0.498039)',
    fontSize: '16px',
    transform: 'perspective(1px) scale(0.75) translate3d(0px, -28px, 0)',
    transformOrigin: 'left top',
    marginBottom: '0px',
    marginTop: '40px',
  },

  panelContent: {
    borderBottom: '2px dotted #D1D2D3',
    fontSize: '16px',
    marginTop: '-15px',
    paddingBottom: '5px',
    marginBottom: '48px',
  },

  content: {
    paddingRight: '128px',
    paddingLeft: '128px',
    paddingTop: '20px',
    '@media (max-width: 760px)': {
      paddingRight: '20px',
      paddingLeft: '20px',
    },
  },

  editTextField: {
    pointerEvent: 'none',
    width: '100%',
    color: '#353630',
    cursor: 'auto',
    ':hover': {
      cursor: 'auto',
    },
    ':active': {
      cursor: 'auto',
    },
    ':focus': {
      cursor: 'auto',
    },
  },

  h3Top: {
    marginTop: '20px',
    marginBottom: '0px',
  },

  exampleImageInput: {
    cursor: 'pointer',
    position: 'absolute',
    top: '0',
    bottom: '0',
    right: '0',
    left: '0',
    width: '100%',
    opacity: '0',
  },
});

@Radium
class sysinfoComponent extends React.Component {
  static propTypes = {
    boardInfo: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  }

  constructor(props) {
    super(props);
    this.classes = props;
    this.state = {
      errorMsgTitle: null,
      errorMsg: null,
	  boardMsgDialogShow: false,
	  errorDialogShow: false,
    };

    this.state.PlatformBlockIsEdit = false;
	this.state.showPassword = false;
    this.state.notPassPassword = false;
    this.state.boardModel = '';

    const info = JSON.parse(localStorage.getItem('info'));

    if (this.props.boardInfo) {
      this.state.deviceName = this.props.boardInfo.system[Object.keys(this.props.boardInfo.system)[0]].hostname;
      this.state.user = info.user;
      this.state.password = info.password;

      this.state.currentIp = this.props.boardInfo.lan['ipv4-address'][0].address;
    }
	
	this._editPlatformBlock = this._editPlatformBlock.bind(this);
	this._submitPlatformBlock = this._submitPlatformBlock.bind(this);
	this._returnToIndex = this._returnToIndex.bind(this);

  }

  componentWillMount() {
    const this$ = this;
    AppActions.loadModel(window.session)
    .then((data) => {
      return this$.setState({ boardModel: data.body.result[1].model });
    });
  }

  render() {
    const { classes, theme } = this.props;
    let textType = 'password';
	let showPasswordStyle = {
      width: '100%',
      marginBottom: '44px',
    };
	let errorText = '';
	let boardImg;
	
	if (this.state.showPassword) {
      textType = 'text';
    }
	
	if (this.state.notPassPassword) {
		errorText = __('Please use at least 6 alphanumeric characters.');
		showPasswordStyle = {
		  marginTop: '20px',
		  width: '100%',
		  marginBottom: '44px',
		};
	}
	
	if (this.state.boardModel === 'MediaTek LinkIt Smart 7688') {
      boardImg = icon7688;
    } else {
      boardImg = icon7688Duo;
    }
	
    let PlatformBlock = (
      <div className={ classes.content } key="PlatformBlock">
        <h3 className={ classes.h3 }>{ __('Platform information') }</h3>    
        <h3 className={ classes.panelTitle }>{ __('Device name') }</h3>
        <p className={ classes.panelContent }>{ this.state.deviceName }</p>
        <h3 className={ classes.panelTitle }>{ __('Current IP address') }</h3>
        <p className={ classes.panelContent }>{ this.state.currentIp }</p>

        <h3 className={ classes.h3Top } style={{ marginTop: '-15px' }}>{ __('Account information') }</h3>
        <h3 className={ classes.panelTitle }>{ __('Account') }</h3>
        <p className={ classes.panelContent }>root(default)</p>
        <h3 className={ classes.panelTitle }>{ __('Password') } <b style={{ color: 'red' }}>*</b></h3>
        <p className={ classes.panelContent }><input type="password" readOnly style={{ border: '0px', fontSize: '18px', letterSpacing: '3px' }} value={this.state.password} /></p>
		<Button 
          style={{
            width: '100%',
            textAlign: 'center',
            marginTop: '-20px',
            marginBottom: '20px',
			color: '#ffffff',
			backgroundColor: green[500],
			'&:hover': {
			  backgroundColor: green[700],
			},
          }}
          onClick={ () => { this._editPlatformBlock(true); } }>
          { __('Configure') }
        </Button>
      </div>
    );
	
	if (this.state.PlatformBlockIsEdit) {
	  PlatformBlock = (
	    <div className={ classes.content } key="PlatformBlock">
		  <h3 className={ classes.h3 }>{ __('Platform information') }</h3>   
		  <TextField helperText={ __('Device name') }
		    defaultValue={ this.state.deviceName } 
		    style={{ width: '100%' }} 
		    onChange={
		      (e) => { 
			    this.setState({ deviceName: e.target.value });
			  } 
		    } />
		  <h3 className={ classes.panelTitle }>{ __('Current IP address') }</h3>
		  <p className={ classes.panelContent }>{ this.state.currentIp }</p>
		  
		  <h3 style={ [classes.h3Top, { marginTop: '-15px' }] }>{ __('Account information') }</h3>
		  <h3 className={ classes.panelTitle }>{ __('Account') }</h3>
		  <p className={ classes.panelContent }>root(default)</p>
		  
		  <TextField helperText={ __('Password') }
		    style={{ width: '100%' }}
			defaultValue={ this.state.password }
			type={ textType }
			helperText={ errorText }
			required
			minLength="6"
			onChange={
		      (e) => { 
			    if (e.target.value.length < 6) {
                  this.setState({ notPassPassword: true, password: e.target.value });
                } else {
                  this.setState({ password: e.target.value, notPassPassword: false });
                }
			  } 
		    }
			label= { __('Password') }
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
		  <Button 
              style={{
                width: '226px',
                flexGrow: 1,
                textAlign: 'center',
                marginTop: '20px',
                marginBottom: '20px',
                marginRight: '10px',
				color: '#ffffff',
				backgroundColor: green[500],
			    '&:hover': {
			      backgroundColor: green[700],
			    },}}
              onClick={ () => { this._editPlatformBlock(false); } }>
              { __('Cancel') }
          </Button>
		  <Button 
              style={{
                width: '226px',
                flexGrow: 1,
                textAlign: 'center',
                marginTop: '20px',
                marginBottom: '20px',
                marginLeft: '10px',
				color: '#ffffff',
				backgroundColor: green[500],
			    '&:hover': {
			      backgroundColor: green[700],
			    },}}
              onClick={ () => { this._submitPlatformBlock(false); } }>
              { __('Configure & Restart') }
          </Button>
		</div>
	  );
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
            { PlatformBlock }
			<div style={{ borderTop: '1px solid rgba(0,0,0,0.12)', marginTop: '20px', marginBottom: '0px' }}></div>
        </Card>
      </div>
    );
  }
  
  _editPlatformBlock(status) {
    const this$ = this;
    setTimeout(() => { return this$.setState({ PlatformBlockIsEdit: status }); }, 300);
  }
  
  _submitPlatformBlock() {
	const this$ = this;
    const password = this.state.password;
    if (password.length < 6) {
      return false;
    }
	
	return AppActions.resetHostName(this$.state.deviceName, window.session)
	.then(() => {
      return AppActions.resetPassword('root', this$.state.password, window.session);
    })
    .then(() => {
      return AppActions.commitAndReboot(window.session)
      .then(() => {
        return;
      })
      .catch((err) => {
        if (err.message === 'no data') {
          return false;
        }
        return err;
      });
    })
    .then(() => {
      return this$._returnToIndex(__('Configuration saved. You can sign in to the console after your device has restarted.'));
    })
    .catch((err) => {
      if (err.message === 'Access denied') {
        this$.setState({ errorMsgTitle: __('Access denied'), errorMsg: __('Your token was expired, please sign in again.') });
        this$.refs.errorMsg.open = true;
		return true;
      }
      alert(err);
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

sysinfoComponent.childContextTypes = {
  classes: PropTypes.object,
};

export default withStyles(styles, { withTheme: true })(sysinfoComponent);