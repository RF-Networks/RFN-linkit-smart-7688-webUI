import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Radium from 'radium';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { withStyles, MuiThemeProvider, createMuiTheme, withTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import appAction from '../actions/appActions';
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

  img: {
    width: '376px',
  },

  block: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '300px',
    alignItems: 'center',
  },

  basicWidth: {
    width: '100%',
    textAlign: 'center',
    marginTop: '10px',
    marginBottom: '10px',
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

const theme = createMuiTheme({
  palette: {
    primary: green,
  },
  typography: {
    useNextVariants: true,
  },
});

@Radium
class resetPasswordComponent extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    errorMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    successMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  }
  
  constructor(props) {
	super(props);
    this.classes = props;
	this.state = {
      password: '',
      againPassword: '',
      showPassword: false,
      notPassPassword: false,
      modal: false,
      errorTitle: '',
      errorMsg: '',
    };
	this._handleResetPassword = this._handleResetPassword.bind(this);
  }
  
  componentDidMount() {
	const this$ = this;
    document.addEventListener('keypress', (e)=> {
      const key = e.which || e.keyCode;
      if (key === 13) { // 13 is enter
        return this$._handleResetPassword();
      }
    });
  }
  
  render() {
	const { classes } = this.props;
	let errorText = __('Please set a password');
    let textType = 'password';
    let error = false;

    let showPasswordStyle = {
      width: '100%',
      marginBottom: '44px',
    };

    if (this.state.showPassword) {
      textType = 'text';
    }

    if (this.state.notPassPassword) {
      error = true;
      errorText = __('Please use at least 6 alphanumeric characters.');
      showPasswordStyle = {
        marginTop: '20px',
        width: '100%',
        marginBottom: '44px',
      };
    }
	
	return (
      <div className={ classes.frame }>
	    <div className={ classes.block }>
		  <img src={ Logo } className={ classes.img }/>
          <p style={{
            lineHeight: '22px',
            marginTop: '40px',
            fontFamily: 'RionaSansLight,Arial,Helvetica,sans-serif',
          }}>{__('Welcome to')} <b>RFN Smart Gateway</b></p>
          <p style={{ color: '#69BE28', marginTop: '-10px' }}>{__('Please set a password.')}</p>
		  <TextField
            helperText={ __('Input your Account') }
            ref="password"
            value="root (default)"
            disabled
            className={ classNames(classes.basicWidth) }
            required
            minLength="6"
            label={__('Account')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}/>
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
            <Button 
              className={classNames(classes.submitButton)}
              onClick={ this._handleResetPassword }>
              { __('Submit') }
            </Button>
	    </div>    
	  </div>
    );
  }
  
   _handleResetPassword() {
    const password = this.state.password;

    if (password.length < 6) {
      return false;
    }

    return appAction.resetPassword('root', password, window.session)
    .then(() => {
      return AppDispatcher.dispatch({
        APP_PAGE: 'LOGIN',
        successMsg: __('You have set your password successfully, please sign in now.'),
        errorMsg: null,
      });
    })
    .catch((err) => {
      return alert(err);
      if (err === 'Connection failed') {
        return alert(__('The device is still in the restarting process. Please retry again when the restarting process is complete.') + __('Please make sure your host computer is in the same network as the device. You can’t access this page if it’s in a different network.'));
      }
    });
  }
}

resetPasswordComponent.childContextTypes = {
  classes: PropTypes.object,
};

export default withStyles(styles, { withTheme: true })(resetPasswordComponent);