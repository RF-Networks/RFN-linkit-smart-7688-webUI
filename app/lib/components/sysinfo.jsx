import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Radium from 'radium';
import { withStyles, MuiThemeProvider, createMuiTheme, withTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import AppActions from '../actions/appActions';

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

const theme = createMuiTheme({
  palette: {
    primary: green,
  },
  typography: {
    useNextVariants: true,
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
    };

    this.state.PlatformBlockIsEdit = false;
    this.state.boardModel = '';

    const info = JSON.parse(localStorage.getItem('info'));

    if (this.props.boardInfo) {
      this.state.deviceName = this.props.boardInfo.system[Object.keys(this.props.boardInfo.system)[0]].hostname;
      this.state.user = info.user;
      this.state.password = info.password;

      this.state.currentIp = '192.168.100.1';//this.props.boardInfo.lan['ipv4-address'][0].address;
    }
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
        <p className={ classes.panelContent }><input type="password" disable style={{ border: '0px', fontSize: '18px', letterSpacing: '3px' }}value={this.state.password} /></p>
      </div>
    );

    return (
      <div>
        <Card>
            { PlatformBlock }
        </Card>
      </div>
    );
  }
}

sysinfoComponent.childContextTypes = {
  classes: PropTypes.object,
};

export default withStyles(styles, { withTheme: true })(sysinfoComponent);