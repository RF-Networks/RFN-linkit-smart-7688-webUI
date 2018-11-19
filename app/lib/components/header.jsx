import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Radium from 'radium';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Logo from '../../img/rf-networks.jpg';
import AppActions from '../actions/appActions';
import AppDispatcher from '../dispatcher/appDispatcher';

const styles = theme => ({
  bg: {
    background: '#fff',
  },

  img: {
    width: '188px',
    marginTop: '15px',
  },

  header: {
    width: '100%',
    height: '120px',
    boxSizing: 'border-box',
    tapHighlightColor: 'rgba(0,0,0,0)',
    zIndex: 99,
    position: 'fixed',
    background: '#fff',
    boxShadow: '1px 2px 1px 0 rgba(0,0,0,0.1), 0 0 0 rgba(0,0,0,0.1)',
  },

  container: {
    display: 'flex',
    flexDirection: 'row',
    height: '105px',
    lineHeight: '60px',
    justifyContent: 'space-between',
    maxWidth: '768px',
    margin: '0 auto',
    '@media (max-width: 760px)': {
      paddingLeft: '10px',
      paddingRight: '10px',
    },
  },
    
  dropdown: {
    borderBottom: '0px', 
    '&:before': {
      backgroundColor: '#fff',
    },
    '&:after': {
      backgroundColor: '#fff',
    },
    color: green[500]
  },

  icon: {
    fill: green[500],
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
class loginComponent extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    boardInfo: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    children: PropTypes.node,
  }

  constructor(props) {
    super(props);
    this.classes = props;
    this.state = {};
    this._logOut = this._logOut.bind(this);

    if (/ru\-ru/.test(window.location.pathname)) {
      this.state.language = '2';
    } else {
      this.state.language = '1';
    }
  }

  componentWillMount() {
  }

  render() {
    const { classes } = this.props;

    let defaultRouter = '';

    if (/127.0.0.1/.test(window.location.host)) {
      defaultRouter = '/app';
    }

    return(
    <div>
      <header className={ classes.header }>
          <div className={ classes.container }>
            <img className={ classes.img } src={ Logo } />
            <div style={{ display: 'flex' }}>
              <Select
                value={ this.state.language }
                inputProps={{
                    classes: {
                      root: classes.dropdown,
                      icon: classes.icon,
                    },
                }}
                onChange={
                  e => {
                    if (e.target.value == this.state.language)
                      return;
                    switch (e.target.value) {
                      default:
                      window.location.href = defaultRouter + '/';
                      break;
                    }
                  }
                }
                disableUnderline={true} >
                 <MenuItem value={1} style={{backgroundColor: '#fff', color: green[500]}}>English</MenuItem>
                 <MenuItem value={2} style={{backgroundColor: '#fff', color: green[500]}}>Pусский</MenuItem>
              </Select>
              <a
                onClick={ this._logOut }
                style={{
                  color: green[500],
                  textDecoration: 'none',
                  cursor: 'pointer',
                  margin: '22px 30px',
                }}>{ __('Sign out') }</a>
            </div>
          </div>
      </header>
    </div>);
  }

  _logOut() {
    if (AppActions.isLocalStorageNameSupported) {
      delete window.localStorage.info;
      delete window.localStorage.session;
    } else {
      delete window.memoryStorage.session;
      delete window.memoryStorage.info;
    }
    window.session = '';
    return AppDispatcher.dispatch({
      APP_PAGE: 'LOGIN',
      successMsg: null,
      errorMsg: null,
    });
  }
}

loginComponent.childContextTypes = {
  muiTheme: PropTypes.object,
};

export default withStyles(styles)(loginComponent);
