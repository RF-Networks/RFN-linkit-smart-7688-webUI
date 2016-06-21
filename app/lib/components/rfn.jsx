import { default as React, PropTypes } from 'react';
import Radium from 'radium';
import Dropzone from 'react-dropzone';
import mui from 'material-ui';
import AppActions from '../actions/appActions';
import AppDispatcher from '../dispatcher/appDispatcher';
import validator from 'validator';

import icon7688 from '../../img/7688.png';
import icon7688Duo from '../../img/7688_duo.png';

const {
  TextField,
  Card,
  FlatButton,
  RadioButtonGroup,
  RadioButton,
  RaisedButton,
  SelectField,
  Dialog,
} = mui;

const ThemeManager = new mui.Styles.ThemeManager();
const Colors = mui.Styles.Colors;
const styles = {
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

};

@Radium
export default class rfnComponent extends React.Component {
  static propTypes = {
    errorMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    successMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    boardInfo: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  }

  constructor(props) {
    super(props);
    this.state = {
      errorMsgTitle: null,
      errorMsg: null,
    };
    this.state.DeviceSettingsBlockIsEdit = false;
    this.state.serverIP = this.props.boardInfo.rfn.server.serverIP || '';
    this.state.serverPort = this.props.boardInfo.rfn.server.serverPort || 4009;
    this.state.channel = this.props.boardInfo.rfn.server.channel || 7;

    this._editDeviceSettingsBlock = ::this._editDeviceSettingsBlock;
    this._submitDeviceSettingsBlock = ::this._submitDeviceSettingsBlock;
  }

  componentWillMount() {
    AppActions.loadModel(window.session)
    .then((data) => {
      return this$.setState({ boardModel: data.body.result[1].model }) && AppActions.loadRFN(window.session);
    })
    .then((data) => {
	return this$.setState({ serverIP: data.body.result[1].server.serverIP,
	    serverPort: data.body.result[1].server.serverPort,
	    channel: data.body.result[1].server.channel,
	});
    });
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme(),
    };
  }

  render() {
    const errMsgActions = [
      <FlatButton
        label={__('SIGN IN')}
        labelStyle={{ color: Colors.green700 }}
        onTouchTap={ this._cancelErrorMsgDialog }
        hoverColor="none" />,
    ];
    let DeviceSettingsBlock = (
      <div style={ styles.content } key="DeviceSettingsBlock">
        <h3 style={ styles.h3 }>{ __('Device settings') }</h3>
        <h3 style={ styles.panelTitle }>{ __('Server ip') }</h3>
    	<p style={ styles.panelContent }>{ this.state.serverIP }</p>
        <h3 style={ styles.panelTitle }>{ __('Server port') }</h3>
    	<p style={ styles.panelContent }>{ this.state.serverPort }</p>
        <h3 style={ styles.panelTitle }>{ __('Channel') }</h3>
    	<p style={ styles.panelContent }>{ this.state.channel }</p>
	<div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}>     	
	  <RaisedButton
            linkButton
            secondary
            label={ __('Configure') }
            fullWidth
            backgroundColor={ Colors.green700 }
            onTouchTap={() => { this._editDeviceSettingsBlock(true); } }
            style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '-20px',
              marginBottom: '20px',
            }} />
        </div>
      </div>
    );
    if (this.state.DeviceSettingsBlockIsEdit) {
	DeviceSettingsBlock = (
      	  <div style={ styles.content } key="DeviceSettingsBlockIsEdit">
    	    <h3 style={ styles.h3 }>{ __('Device settings') }</h3>
	
            <TextField
              hintText={ __('Server ip') }
              floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
              style={{ width: '100%' }}
              defaultValue={ this.state.serverIP }
              underlineStyle={{ borderColor: '#D1D2D3' }}
              underlineFocusStyle={{
                borderColor: Colors.green700,
                borderWidth: '2px',
              }}
              onChange={
                (e) => {
		  if(validator.isIP(e.target.value))
                    this.setState({ serverIP: e.target.value });
                }
              }
              floatingLabelText={ __('Server ip') } />

	    <TextField
              hintText={ __('Server port') }
              floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
              style={{ width: '100%' }}
              defaultValue={ this.state.serverPort }
              underlineStyle={{ borderColor: '#D1D2D3' }}
              underlineFocusStyle={{
                borderColor: Colors.green700,
                borderWidth: '2px',
              }}
              onChange={
                (e) => {
 		  if(validator.isNumeric(e.target.value) && parseInt(e.target.value,10) >= 0 && parseInt(e.target.value,10) <= 65535 )
                    this.setState({ serverPort: e.target.value });
                }
              }
              floatingLabelText={ __('Server port') } />

	    <TextField
              hintText={ __('Channel') }
              floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
              style={{ width: '100%' }}
              defaultValue={ this.state.channel }
              underlineStyle={{ borderColor: '#D1D2D3' }}
              underlineFocusStyle={{
                borderColor: Colors.green700,
                borderWidth: '2px',
              }}
              onChange={
                (e) => {
 		  if(validator.isNumeric(e.target.value) && parseInt(e.target.value,10) >= 0 && parseInt(e.target.value,10) <= 7 )
                    this.setState({ channel: e.target.value });
                }
              }
              floatingLabelText={ __('Channel') } />

 	    <div style={{
            	display: 'flex',
            	flexDirection: 'row',
            	justifyContent: 'space-between',
            	marginBottom: '20px',
              }}>
	      <RaisedButton
                linkButton
              	label={ __('Cancel') }
              	onTouchTap={ () => {
		  this.state.serverIP = this.props.boardInfo.rfn.server.serverIP || '';
    		  this.state.serverPort = this.props.boardInfo.rfn.server.serverPort || 4009; 
		  this.state.channel = this.props.boardInfo.rfn.server.channel || 7;
		  this._editDeviceSettingsBlock(false); 
		} }
              	backgroundColor="#EDEDED"
              	labelColor="#999A94"
              	style={{
                  width: '236px',
                  flexGrow: 1,
                  textAlign: 'center',
                  marginTop: '20px',
                  marginBottom: '20px',
                  marginRight: '10px',
              }} />
              <RaisedButton
                linkButton
                secondary
                label={ __('Configure') }
                onTouchTap={
                  () => {
                    this._submitDeviceSettingsBlock();
                  }
                }
                backgroundColor={ Colors.green700 }
                style={{
                  width: '236px',
                  flexGrow: 1,
                  textAlign: 'center',
                  marginTop: '20px',
                  marginBottom: '20px',
                  marginLeft: '10px'}} />
            </div>
	  </div>
	);
    }
    return (
      <div>
        <Card>
	   <Dialog
            title={ this.state.errorMsgTitle }
            actions={ errMsgActions }
            actionFocus="submit"
            ref="errorDialog"
            modal={ this.state.modal }>
            <p style={{ color: '#999A94', marginTop: '-20px' }}>{ this.state.errorMsg }</p>
          </Dialog>
	  { DeviceSettingsBlock }
	</Card>
      </div>
    );
  }

  _editDeviceSettingsBlock(status) {
    const this$ = this;
    setTimeout(() => { return this$.setState({ DeviceSettingsBlockIsEdit: status }); }, 300);
  }
  
  _submitDeviceSettingsBlock() {
    const this$ = this;
    const serverIP = this.state.serverIP;
    const serverPort = this.state.serverPort;
    const channel = this.state.channel;
    return AppActions.setRFN(serverIP, serverPort, channel, window.session)
    .then((result) => {
      this.props.boardInfo.rfn.server.serverIP = serverIP;
      this.props.boardInfo.rfn.server.serverPort = serverPort;
      this.props.boardInfo.rfn.server.channel = channel;
      return this$._editDeviceSettingsBlock(false);
    })
    .catch((err) => {
      if (err === 'Access denied') {
        this$.setState({ errorMsgTitle: __('Access denied'), errorMsg: __('Your token was expired, please sign in again.') });
        return this$.refs.errorMsg.show();
      } 
      if (err === 'No data') {
        return this$._editDeviceSettingsBlock(false);
      }
      alert(err);
    });
  }
}

rfnComponent.childContextTypes = {
  muiTheme: React.PropTypes.object,
};
