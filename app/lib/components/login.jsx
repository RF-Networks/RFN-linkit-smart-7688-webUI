import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Radium from 'radium';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import { withStyles } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import AppActions from '../actions/appActions';
import AppDispatcher from '../dispatcher/appDispatcher';
import Logo from '../../img/rf-networks.png';

const styles = props => ({
  frame: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },

  panelTitle: {
    width: '100%',
    tapHighlightColor: 'rgba(0,0,0,0)',
    color: 'rgba(0, 0, 0, 0.498039)',
    fontSize: '16px',
    transform: 'perspective(1px) scale(0.75) translate3d(0px, -28px, 0)',
    transformOrigin: 'left top',
    marginBottom: '0px',
    marginTop: '40px',
  },

  panelContent: {
    width: '100%',
    borderBottom: '1px solid #D1D2D3',
    fontSize: '16px',
    marginTop: '-15px',
    paddingBottom: '5px',
  },

  img: {
    width: '376px',
  },

  block: {
    display: 'flex',
    width: '420px',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },

  basicWidth: {
    width: '100%',
    textAlign: 'center',
  },

  submitButton: {
    color: '#ffffff',
    width: '100%',
    textAlign: 'center',
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
});

@Radium
class loginComponent extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    errorMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    successMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  }
  
  constructor(props) {
	super(props);
    this.classes = props;
	this.waitingDialog = React.createRef();
	this.state = {
      password: '',
      waiting: this.props.errorMsg === 'Waiting',
      showPassword: false,
      autoHideDuration: 3000,
      successMsg: this.props.successMsg,
    };

    this._handleLogin = this._handleLogin.bind(this)
  }
  
  componentDidMount() {
    if (this.props.errorMsg === 'Waiting') {
      this.state.waiting = true;
	  console.log(this.waitingDialog.current);
      //this.refs.waitingDialog.open = true;
    } else {
      this.state.waiting = false;
      //this.refs.waitingDialog.open = false;
    }

    if (this.state.successMsg) {
      //this.refs.snackbar.open = true;
    }

    const this$ = this;
    document.addEventListener('keypress', (e)=> {
      const key = e.which || e.keyCode;
      if (key === 13) { // 13 is enter
        return this$._handleLogin();
      }
    });
  }
  
  render() {
	const { classes } = this.props;
    let textType = 'password';
    let error = false;
    let errorText = __('Please enter your password');
    if (this.state.showPassword) {
      textType = 'text';
    }
	
	let dialogMsg;
	if (this.state.successMsg) {
      dialogMsg = (
        <div style={{
          width: '100%',
          position: 'fixed',
          display: 'flex',
          left: '0px',
          bottom: '0px',
          justifyContent: 'center',
        }}>
          <Snackbar
            style={{
              fontSize: '14px',
              height: 'none',
              minHeight: '48px',
              bottom: '0px',
              margin: '0 auto',
              position: 'relative',
            }}
            ref="snackbar"
			open={this.state.successMsg}
            autoHideDuration={this.state.autoHideDuration}>
            <SnackbarContent message={ this.state.successMsg }/>
          </Snackbar>
        </div>
      );
    }
	return (
		<div className={ classes.frame }>
		  <Dialog
			aria-labelledby="simple-dialog-title"
			open={ this.state.waiting }>
			<DialogTitle id="simple-dialog-title">{__('Connection failed...')}</DialogTitle>
			<DialogContent>
			  <DialogContentText style={{ lineHeight: '23px', margin: '10px 10px 10px 10px' }}>
				{__('Please refresh. If problem persists, please ensure your board is not in the process of rebooting, or updating new firmware, or check Wi-Fi connectivity settings.')}
			  </DialogContentText>
			</DialogContent>
		  </Dialog>
		  <div className={ classes.block }>
		    <div style={{
              width: '300px',
              paddingLeft: '60px',
              paddingRight: '60px',
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
			  <img src={ Logo } className={ classes.img } />
			  <p style={{
                lineHeight: '22px',
                marginTop: '40px',
                fontFamily: 'RionaSansLight,Arial,Helvetica,sans-serif',
              }}><span style={{fontFamily: 'RionaSansLight,Arial,Helvetica,sans-serif'}}>{__('Welcome to')}</span> <b style={{ fontFamily: 'RionaSansMedium,Arial,Helvetica,sans-serif' }}>RFN Smart Gateway</b>.</p>
              <h3 className={ classNames(classes.panelTitle) }>{__('Account')}</h3>
              <p className={ classNames(classes.panelContent) }>root(default)</p>
			  <TextField
                error = { error }
                helperText={ errorText }
                type={textType}
                value={this.state.password}
                onChange={
                  (e) => {
                    if (e.target.value.length < 6) {
                      this.setState({ notPassPassword: true, password: e.target.value });
                    } else {
                      this.setState({ password: e.target.value, notPassPassword: false });
                    } 
                  }
                }
                className={ classNames(classes.basicWidth) }
                required
                minLength="6"
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
              <br/>
              <Button 
                className={classNames(classes.submitButton)}
                onClick={ this._handleLogin }>
                { __('Sign in') }
              </Button>
			</div>
			<div style={{width: '100%'}}>
              <p style={{
                marginTop: '80px',
                borderTop: '1px solid rgba(0,0,0,0.12)',
                paddingTop: '10px',
                textAlign: 'center',
              }} >{ __('For advanced network configuration, go to ') }<a style={{ color: '#00a1de', textDecoration: 'none' }} href="/cgi-bin/luci">OpenWrt</a>.</p>
            </div>
		  </div>
		</div>
	);
  }
  
  _handleLogin() {
    const password = this.state.password;
    return AppActions.login('root', password);
  }
}

loginComponent.childContextTypes = {
  classes: PropTypes.object,
};

export default withStyles(styles, { withTheme: true })(loginComponent);