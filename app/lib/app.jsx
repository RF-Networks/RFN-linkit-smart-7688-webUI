require('../css/main.css');

import React, { Component } from "react";
import { render } from 'react-dom';
import AppConstants from './constants/appConstants.js';
import Favicon from 'react-favicon';
import { withStyles, MuiThemeProvider, createMuiTheme, withTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';

import FaviconImg from '../img/favicon.ico';

/* component */
import Login from './components/login.jsx';
import Content from './components/content.jsx';
import Header from './components/header.jsx';
import Resetpassword from './components/resetpassword.jsx';

/* store */
import AppStore from './stores/appStore.js';

function appState() {
  return AppStore.init();	
}

const theme = createMuiTheme({
  palette: {
    primary: green,
  },
  typography: {
    useNextVariants: true,
  },
});

export default class App extends Component {
  constructor(props) {
	super(props);
	this.state = {};
	this._onChange = this._onChange.bind(this);
  }
  
  componentDidMount() { 
    AppStore.addChangeListener(this._onChange);
  }
  
  componentWillUnmount() {
	AppStore.removeChangeListener(this._onChange);
  }
  
  getInitialState() {
	return appState();  
  }
  
  render() {
	let elem = '';	
	switch (this.state.APP_PAGE) {
	  case AppConstants.FIRSTLOGIN:
	    elem = <Resetpassword { ... this.state }/>;
	    break;
	  case AppConstants.LOGIN:
	    elem = <Login { ... this.state }/>;
	    break;
	  case AppConstants.CONTENT:
	    elem = (
		  <div>
		    <Header { ... this.state } />
			<Content { ... this.state } />
		  </div>
		);
	    break;
	  default:
		break;
	}
	
	return (
	  <MuiThemeProvider theme={theme}>
	  <div>
	    <Favicon url={FaviconImg}/>
		{elem}
	  </div>
	  </MuiThemeProvider>
    );	
  }	  
  
  _onChange() {
	this.setState(appState());  
  }
};

render(
  <App />,
  document.getElementById('app')
);