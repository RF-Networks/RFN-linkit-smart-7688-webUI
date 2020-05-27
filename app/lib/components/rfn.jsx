import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Radium from 'radium';
import { withStyles } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import {DropzoneDialog} from 'material-ui-dropzone';
import AppActions from '../actions/appActions';
import AppDispatcher from '../dispatcher/appDispatcher';
import validator from 'validator';
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
  
  root: {
    display: 'flex',
    flexWrap: 'wrap',
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
  
  formControl: {
	width: '100%',
    maxWidth: '512px',
  },
  
});

@Radium
class rfnComponent extends React.Component {
  static propTypes = {
    errorMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    successMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    boardInfo: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  }
  
  constructor(props) {
    super(props);
    this.classes = props;
	
	this.state = {
	  errorMsgTitle: null,
	  errorMsg: null,
	  filedialogopen: false,
	  awsfilename: '',
	  rfn: this.props.boardInfo.rfn || '',
	};
	
	//console.log(this.props.boardInfo);
	
	this.state.DeviceSettingsBlockIsEdit = false;
	
	this._editDeviceSettingsBlock = this._editDeviceSettingsBlock.bind(this);
    this._submitDeviceSettingsBlock = this._submitDeviceSettingsBlock.bind(this);
	this._onModeChanged = this._onModeChanged.bind(this);
	
	AppActions.loadModel(window.session)
    .then((data) => {	
	  return this.setState({ boardModel: data.body.result[1].model });	
	})
	.then(() => {
		return AppActions.loadRFN(window.session);
	})
	.then((data) => {
		//console.log(data.body.result[1].values);
		return this.setState({
		  rfn: data.body.result[1].values,
		});
	});		
  }
  
  render() {
	const { classes, theme } = this.props; 
	let workingMode = 'Unknown';
	let DeviceSettingsBlock = '';
	let serverParams = '';
	
	if (this.state.DeviceSettingsBlockIsEdit) {
	  serverParams = (
	    <div>
		  <TextField 
		    type="text"
			helperText={ __('Server ip') }
			style={{ width: '100%' }}
			required 
			label={ __('Server ip') }
			defaultValue={ this.state.rfn.server.serverIP || '80.178.98.197' }
			onChange={
			  (e) => {
				if(validator.isIP(e.target.value)) {  
				  this.state.rfn.server.serverIP = e.target.value;  
				  this.setState({ rfn: this.state.rfn });
				}
			  }	
			}
			variant="outlined"/>
		  <br/>
		  <br/>
		  <TextField 
		    type="text"
			helperText={ __('Server port') }
			style={{ width: '100%' }}
			required 
			label={ __('Server port') }
			defaultValue={ this.state.rfn.server.serverPort || '4009' }
			onChange={
			  (e) => {
				if(validator.isNumeric(e.target.value) && parseInt(e.target.value,10) >= 0 && parseInt(e.target.value,10) <= 65535) {  
				  this.state.rfn.server.serverPort = e.target.value;  
				  this.setState({ rfn: this.state.rfn });
				}
			  }	
			}
			variant="outlined"/>
	    </div>
	  );
	  
	  if (parseInt(this.state.rfn.server.mode) == 3) {
		serverParams = (
		  <div>
		    <TextField 
			  type="text"
			  helperText={ __('Cloud URL') }
			  style={{ width: '100%' }}
			  required 
			  label={ __('Cloud URL') }
			  defaultValue={ this.state.rfn.server.cloudurl || 'api.devicewise.com' }
			  onChange={
				(e) => {
				  if(validator.isURL(e.target.value)) {  
					this.state.rfn.server.cloudurl = e.target.value;  
					this.setState({ rfn: this.state.rfn });
				  }
				}	
			  }
			  variant="outlined"/>
		    <br/>
		    <br/>
			
			<TextField 
			  type="text"
			  helperText={ __('Application ID') }
			  style={{ width: '100%' }}
			  required 
			  label={ __('Application ID') }
			  defaultValue={ this.state.rfn.server.appid || 'TagReceiver' }
			  onChange={
				(e) => {
				  if(!validator.isEmpty(e.target.value)) {  
					this.state.rfn.server.appid = e.target.value;  
					this.setState({ rfn: this.state.rfn });
				  }
				}	
			  }
			  variant="outlined"/>
		    <br/>
		    <br/>
			
			<TextField 
			  type="text"
			  helperText={ __('Token') }
			  style={{ width: '100%' }}
			  required 
			  label={ __('Token') }
			  defaultValue={ this.state.rfn.server.token || 'Token' }
			  onChange={
				(e) => {
				  if(!validator.isEmpty(e.target.value)) {  
					this.state.rfn.server.token = e.target.value;  
					this.setState({ rfn: this.state.rfn });
				  }
				}	
			  }
			  variant="outlined"/>
		    <br/>
		    <br/>
		  </div>
		);		
	  } else if (parseInt(this.state.rfn.server.mode) == 4) {
		serverParams = (
		  <div>
		    <TextField 
			  type="text"
			  helperText={ __('Cloud URL') }
			  style={{ width: '100%' }}
			  required 
			  label={ __('Cloud URL') }
			  defaultValue={ this.state.rfn.server.awscloudurl || 'iot.eu-central-1.amazonaws.com' }
			  onChange={
				(e) => {
				  if(validator.isURL(e.target.value)) {  
					this.state.rfn.server.awscloudurl = e.target.value;  
					this.setState({ rfn: this.state.rfn });
				  }
				}	
			  }
			  variant="outlined"/>
		    <br/>
		    <br/>
		  </div>
	    );
	  }
		
	  DeviceSettingsBlock = (
	    <div className={ classes.content } key="DeviceSettingsBlock">
		  <h3>{__('Device settings')}</h3>
		  <h3 className={ classes.panelTitle }>{ __('Device imei') }</h3>
		  <p className={ classes.panelContent }>{ this.state.rfn.server.imei }</p>
		  <TextField 
		    type="text"
			helperText={ __('Reboot after') }
			style={{ width: '100%' }}
			required 
			label={ __('Reboot after') }
			value={ this.state.rfn.server.rebootAfter || '2' }
			onChange={
			  (e) => {
				this.state.rfn.server.rebootAfter = e.target.value;  
				this.setState({ rfn: this.state.rfn });
			  }	
			}
			variant="outlined"/>
		  <br/>
		  <br/>
		  <TextField 
		    type="text"
			helperText={ __('Socket inactive timeout') }
			style={{ width: '100%' }}
			required 
			label={ __('Socket inactive timeout') }
			value={ this.state.rfn.server.socketIdleInterval || '4' }
			onChange={
			  (e) => {
				this.state.rfn.server.socketIdleInterval = e.target.value;  
				this.setState({ rfn: this.state.rfn });
			  }	
			}
			variant="outlined"/>
		  <br/>
		  <br/>
		  <Typography id="acc-sens-title" gutterBottom>
			{ __('Accelerometer sensitivity') }
		  </Typography>
		  <Slider aria-labelledby="acc-sens-title" valueLabelDisplay="auto" min={0} max={127} value={ parseInt(this.state.rfn.server.accsens) } onChange={(event, newValue) => {
			this.state.rfn.server.accsens = newValue;  
			this.setState({ rfn: this.state.rfn });}}/>
		  <br/>
		  <br/>
		  <Typography id="gps-period-title" gutterBottom>
			{ __('GPS period') }
		  </Typography>
		  <Slider aria-labelledby="gps-period-title" valueLabelDisplay="auto" min={0} max={86400} value={ parseInt(this.state.rfn.server.gpsperiod) } onChange={(event, newValue) => {
			this.state.rfn.server.gpsperiod = newValue;  
			this.setState({ rfn: this.state.rfn });}}/>
		  <br/>
		  <br/>
		  <Typography id="gps-threshold-title" gutterBottom>
			{ __('GPS threshold') }
		  </Typography>
		  <Slider aria-labelledby="gps-threshold-title" valueLabelDisplay="auto" min={0} max={180} value={ parseInt(this.state.rfn.server.gpsthreshold) } onChange={(event, newValue) => {
			this.state.rfn.server.gpsthreshold = newValue;  
			this.setState({ rfn: this.state.rfn });}}/>
		  <br/>
		  <br/>
		  <FormControl className={ classes.formControl }>
		      <InputLabel>
		        { __('Mode') }
              </InputLabel>
			  <Select 
				value={ Number(this.state.rfn.server.mode) }
				required 
					onChange={this._onModeChanged}>
				<MenuItem key={0} value={0} style={{ maxHeight: '100px' }}>Standard</MenuItem>
				<MenuItem key={1} value={1} style={{ maxHeight: '100px' }}>Transparent</MenuItem>
				<MenuItem key={2} value={2} style={{ maxHeight: '100px' }}>Bridge</MenuItem>
				<MenuItem key={3} value={3} style={{ maxHeight: '100px' }}>DeviceWise (Telit Cloud)</MenuItem>	
				<MenuItem key={4} value={4} style={{ maxHeight: '100px' }}>AWS (Amazon Iot Cloud)</MenuItem>					
			  </Select>
		  </FormControl>
		  <br/>
		  <h4>{ __('Connection settings') }</h4>
		  { serverParams }
		  <h4>{ __('Mesh settings') }</h4>
		  <FormControl className={ classes.formControl }>
		      <InputLabel>
		        { __('Channel') }
              </InputLabel>
			  <Select 
				value={ Number(this.state.rfn.server.channel) }
				required 
					onChange={
					  (e) => {
						this.state.rfn.server.channel = e.target.value.toString();  
						this.setState({ rfn: this.state.rfn });  
					  }	
					}>
				<MenuItem key={0} value={0} style={{ maxHeight: '100px' }}>0</MenuItem>
				<MenuItem key={1} value={1} style={{ maxHeight: '100px' }}>1</MenuItem>
				<MenuItem key={2} value={2} style={{ maxHeight: '100px' }}>2</MenuItem>
				<MenuItem key={3} value={3} style={{ maxHeight: '100px' }}>3</MenuItem>	
				<MenuItem key={4} value={4} style={{ maxHeight: '100px' }}>4</MenuItem>					
				<MenuItem key={5} value={5} style={{ maxHeight: '100px' }}>5</MenuItem>	
				<MenuItem key={6} value={6} style={{ maxHeight: '100px' }}>6</MenuItem>	
				<MenuItem key={7} value={7} style={{ maxHeight: '100px' }}>7</MenuItem>	
			  </Select>
		  </FormControl>
		  <br/>
		  <br/>
		  <FormControl className={ classes.formControl }>
		      <InputLabel>
		        { __('Advertising Channel') }
              </InputLabel>
			  <Select 
				value={ Number(this.state.rfn.server.advChannel) }
				required 
					onChange={
					  (e) => {
						this.state.rfn.server.advChannel = e.target.value.toString();  
						this.setState({ rfn: this.state.rfn });  
					  }	
					}>
				<MenuItem key={0} value={0} style={{ maxHeight: '100px' }}>0</MenuItem>
				<MenuItem key={1} value={1} style={{ maxHeight: '100px' }}>1</MenuItem>
				<MenuItem key={2} value={2} style={{ maxHeight: '100px' }}>2</MenuItem>
				<MenuItem key={3} value={3} style={{ maxHeight: '100px' }}>3</MenuItem>	
				<MenuItem key={4} value={4} style={{ maxHeight: '100px' }}>4</MenuItem>					
				<MenuItem key={5} value={5} style={{ maxHeight: '100px' }}>5</MenuItem>	
				<MenuItem key={6} value={6} style={{ maxHeight: '100px' }}>6</MenuItem>	
				<MenuItem key={7} value={7} style={{ maxHeight: '100px' }}>7</MenuItem>	
			  </Select>
		  </FormControl>
		  <br/>
		  <br/>
		  <TextField 
		    type="text"
			helperText={ __('Sync Word') }
			style={{ width: '100%' }}
			required 
			label={ __('Sync Word') }
			defaultValue={ this.state.rfn.server.syncWord || '46443' }
			onChange={
			  (e) => {
				if(validator.isNumeric(e.target.value) && parseInt(e.target.value,10) >= 0 && parseInt(e.target.value,10) <= 65535 ) {  
				  this.state.rfn.server.syncWord = e.target.value;  
				  this.setState({ rfn: this.state.rfn });
				}
			  }	
			}
			variant="outlined"/>
		  <br/>
		  <br/>
		  <FormControl className={ classes.formControl }>
		      <InputLabel>
		        { __('Base Time') }
              </InputLabel>
			  <Select 
				value={ Number(this.state.rfn.server.basetime) }
				required 
					onChange={
					  (e) => {
						this.state.rfn.server.basetime = e.target.value.toString();  
						this.setState({ rfn: this.state.rfn });  
					  }	
					}>
				<MenuItem key={0} value={0} style={{ maxHeight: '100px' }}>125</MenuItem>
				<MenuItem key={1} value={1} style={{ maxHeight: '100px' }}>250</MenuItem>
				<MenuItem key={2} value={2} style={{ maxHeight: '100px' }}>500</MenuItem>
				<MenuItem key={3} value={3} style={{ maxHeight: '100px' }}>1000</MenuItem>	
			  </Select>
		  </FormControl>
		  <br/>
		  <br/>
		  <FormControl className={ classes.formControl }>
		      <InputLabel>
		        { __('Frames In Cycle') }
              </InputLabel>
			  <Select 
				value={ Number(this.state.rfn.server.framesInCycle) }
				required 
					onChange={
					  (e) => {
						this.state.rfn.server.framesInCycle = e.target.value.toString();  
						this.setState({ rfn: this.state.rfn });  
					  }	
					}>
				<MenuItem key={0} value={0} style={{ maxHeight: '100px' }}>16</MenuItem>
				<MenuItem key={1} value={1} style={{ maxHeight: '100px' }}>32</MenuItem>
				<MenuItem key={2} value={2} style={{ maxHeight: '100px' }}>64</MenuItem>
				<MenuItem key={3} value={3} style={{ maxHeight: '100px' }}>128</MenuItem>	
			  </Select>
		  </FormControl>
		  <br/>
		  <br/>
		  
		  <TextField 
		    type="text"
			helperText={ __('Network ID') }
			style={{ width: '100%' }}
			required 
			label={ __('Network ID') }
			defaultValue={ this.state.rfn.server.networkID || '170' }
			onChange={
			  (e) => {
				if(validator.isNumeric(e.target.value) && parseInt(e.target.value,10) >= 0 && parseInt(e.target.value,10) <= 255 ) {    
				  this.state.rfn.server.networkID = e.target.value;  
				  this.setState({ rfn: this.state.rfn });
				}
			  }	
			}
			variant="outlined"/>
		  <br/>
		  <br/>
		  
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
			  }}
			  onClick={ () => { 
				this.state.rfn = this.props.boardInfo.rfn || '';
				this._editDeviceSettingsBlock(false);  
			  } }>
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
			  onClick={ () => { 
				this._submitDeviceSettingsBlock();
			  } }>
			  { __('Configure') }
			</Button>
		  </div>
	    </div>
	  );
	} else {
		serverParams = (
		  <div>
			<h3 className={ classes.panelTitle }>{ __('Server ip') }</h3>
			<p className={ classes.panelContent }>{ this.state.rfn.server.serverIP }</p>
			<h3 className={ classes.panelTitle }>{ __('Server port') }</h3>
			<p className={ classes.panelContent }>{ this.state.rfn.server.serverPort }</p>
		  </div>
		);
		
		switch (parseInt(this.state.rfn.server.mode)) {
		  case 0:
			workingMode = 'Standard';
			break;
		  case 1:
			workingMode = 'Transparent';
			break;
		  case 2:
			workingMode = 'Bridge';
			break;
		  case 3:
			workingMode = 'DeviceWise (Telit Cloud)';
			serverParams = (
			  <div>
				<h3 className={ classes.panelTitle }>{ __('Cloud URL') }</h3>
				<p className={ classes.panelContent }>{ this.state.rfn.server.cloudurl }</p>
				<h3 className={ classes.panelTitle }>{ __('Application ID') }</h3>
				<p className={ classes.panelContent }>{ this.state.rfn.server.appid }</p>
				<h3 className={ classes.panelTitle }>{ __('Token') }</h3>
				<p className={ classes.panelContent }>{ this.state.rfn.server.token }</p>
			  </div>
			);
			break;
		  case 4:
			workingMode = 'AWS (Amazon IoT Cloud)';
			serverParams = (
			  <div>
				<h3 className={ classes.panelTitle }>{ __('Cloud URL') }</h3>
				<p className={ classes.panelContent }>{ this.state.rfn.server.awscloudurl }</p>
				<DropzoneDialog
					open={this.state.filedialogopen}
					acceptedFiles={[]}
					showPreviews={false}
					maxFileSize={3000}
					onClose={()=>{this.setState({ filedialogopen: false });}}
					onSave={(e)=>{ 
					  return AppActions.uploadFile(e[0], this.state.awsfilename, window.session)
					  .then(() => {
						this.setState({ filedialogopen: false });  
					  })
					  .catch((err) => {
						  this.setState({ filedialogopen: false });
						  if (err === 'Access denied') {
						  }
						  alert(err);
					  });
					}}
				/>
				
				<h4 className={ classes.panelTitle }>{ __('Trust Store Certificate') }</h4>
				<Button
				  style={{
					width: '100px',
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
				  onClick={ () => { 
					this.setState({awsfilename: '/root/aws.ca' , filedialogopen: true});  
				  } }>
				  { __('Upload') }
				</Button>
				<h4 className={ classes.panelTitle }>{ __('Key Store Certificate') }</h4>
				<Button
				  style={{
					width: '100px',
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
				  onClick={ () => { 
					this.setState({awsfilename: '/root/aws.crt' , filedialogopen: true});  
				  } }>
				  { __('Upload') }
				</Button>
				<h4 className={ classes.panelTitle }>{ __('Private Key Certificate') }</h4>
				<Button
				  style={{
					width: '100px',
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
				  onClick={ () => { 
					this.setState({awsfilename: '/root/aws.key' , filedialogopen: true});  
				  } }>
				  { __('Upload') }
				</Button>
			  </div>
			);
			break;
		}
		
		DeviceSettingsBlock = (
		  <div className={ classes.content } key="DeviceSettingsBlock">
			<h3>{__('Device settings')}</h3>
			<h3 className={ classes.panelTitle }>{ __('Device imei') }</h3>
			<p className={ classes.panelContent }>{ this.state.rfn.server.imei }</p>
			<h3 className={ classes.panelTitle }>{ __('Reboot after') }</h3>
			<p className={ classes.panelContent }>{ this.state.rfn.server.rebootAfter }</p>
			<h3 className={ classes.panelTitle }>{ __('Socket inactive timeout') }</h3>
			<p className={ classes.panelContent }>{ this.state.rfn.server.socketIdleInterval }</p>
			<h3 className={ classes.panelTitle }>{ __('Accelerometer sensitivity') }</h3>
			<Slider valueLabelDisplay="on" min={0} max={127} disabled={true} value={ parseInt(this.state.rfn.server.accsens) } />
			<h3 className={ classes.panelTitle }>{ __('GPS period') }</h3>
			<Slider valueLabelDisplay="on" min={0} max={86400} disabled={true} value={ parseInt(this.state.rfn.server.gpsperiod) } />
			<h3 className={ classes.panelTitle }>{ __('GPS threshold') }</h3>
			<Slider valueLabelDisplay="on" min={0} max={180} disabled={true} value={ parseInt(this.state.rfn.server.gpsthreshold) } />
			<h3 className={ classes.panelTitle }>{ __('Mode') }</h3>
			<p className={ classes.panelContent }>{ workingMode }</p>
			<h4>{ __('Connection settings') }</h4>
			{ serverParams }
			<h4>{ __('Mesh settings') }</h4>
			<h3 className={ classes.panelTitle }>{ __('Channel') }</h3>
			<p className={ classes.panelContent }>{ this.state.rfn.server.channel }</p>
			<h3 className={ classes.panelTitle }>{ __('Advertising Channel') }</h3>
			<p className={ classes.panelContent }>{ this.state.rfn.server.advChannel }</p>
			<h3 className={ classes.panelTitle }>{ __('Sync Word') }</h3>
			<p className={ classes.panelContent }>{ this.state.rfn.server.syncWord } ({ "0x" + parseInt(this.state.rfn.server.syncWord).toString(16).toUpperCase() })</p>
			<h3 className={ classes.panelTitle }>{ __('Base Time') }</h3>
			<p className={ classes.panelContent }>{ 125 << parseInt(this.state.rfn.server.basetime) }</p>
			<h3 className={ classes.panelTitle }>{ __('Frames In Cycle') }</h3>
			<p className={ classes.panelContent }>{ 16 << parseInt(this.state.rfn.server.framesInCycle) }</p>
			<h3 className={ classes.panelTitle }>{ __('Network ID') }</h3>
			<p className={ classes.panelContent }>{ parseInt(this.state.rfn.server.networkID) } ({ "0x" + parseInt(this.state.rfn.server.networkID).toString(16).toUpperCase() })</p>
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
				  marginLeft: '10px',
				  color: '#ffffff',
				  backgroundColor: green[500],
				  '&:hover': {
					backgroundColor: green[700],  
				  },
				}}
				onClick={ () => { this._editDeviceSettingsBlock(true); } }>
				{ __('Configure') }
			  </Button>
			</div>
		  </div>
		);
	}
	return (
	  <div>
		<Card>
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

	  let params = { 
		rebootAfter: this$.state.rfn.server.rebootAfter, 
		socketIdleInterval: this$.state.rfn.server.socketIdleInterval,
		mode: this$.state.rfn.server.mode,
		serverIP: this$.state.rfn.server.serverIP,
		serverPort: this$.state.rfn.server.serverPort,
		cloudurl: this$.state.rfn.server.cloudurl,
		awscloudurl: this$.state.rfn.server.awscloudurl,
		appid: this$.state.rfn.server.appid,
		token: this$.state.rfn.server.token,
		channel: this$.state.rfn.server.channel,
		advChannel: this$.state.rfn.server.advChannel,
		basetime: this$.state.rfn.server.basetime,
		framesInCycle: this$.state.rfn.server.framesInCycle,
		syncWord: this$.state.rfn.server.syncWord,
		networkID: this$.state.rfn.server.networkID,
	  };
	  
	  return AppActions.setRFN(params, window.session)
	  .then((result) => {
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
  
  _onModeChanged = event => {
	  const this$ = this;
	  this$.state.rfn.server.mode = event.target.value.toString();  
	  this$.setState({ rfn: this$.state.rfn });  
  }
}

rfnComponent.childContextTypes = {
  classes: PropTypes.object,
};

export default withStyles(styles, { withTheme: true })(rfnComponent);