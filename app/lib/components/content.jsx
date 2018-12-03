import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import { withStyles, MuiThemeProvider, createMuiTheme, withTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Sysinfo from './sysinfo.jsx';
import Typography from '@material-ui/core/Typography';
import AppActions from '../actions/appActions';

function TabContainer({ children  }) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {children }
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
};

const styles = props => ({
  block: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    '@media (max-width: 760px)': {
      paddingLeft: '10px',
      paddingRight: '10px',
    },
    border: '1px solid #d1d2d3',
  },
  
  welcomeTitle: {
    lineHeight: '35px',
    '@media (max-width: 760px)': {
      width: '100%',
    },
  },

  welcomeTitleLine: {
    '@media (max-width: 760px)': {
      marginTop: '-20px',
    },
  },
  
  content: {
    maxWidth: '768px',
    width: '100%',
    marginBottom: '30px',
  },
  
  header: {
    maxWidth: '768px',
    width: '100%',
    marginTop: '120px',
    display: 'flex',
    justifyContent: 'space-between',
    '@media (max-width: 760px)': {
      justifyContent: 'none',
      display: 'block',
    },
  },
});

@Radium
class contentComponent extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
	boardInfo: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
	children: PropTypes.node,
  }
  
  constructor(props) {
    super(props);
    this.classes = props;
	this.state = {
		tabsValue: 0,
		boardModel: '',
	};
  }
  
  componentWillMount() {
    const this$ = this;
    AppActions.loadModel(window.session)
    .then((data) => {
      return this$.setState({ boardModel: data.body.result[1].model });
    });
  }
  
  handleChange = (event, value) => {
	var t_state = this.state;
    t_state.tabsValue = value; 
    this.setState(t_state);
  };
  
  render() {
	const { classes } = this.props;
	
    return(
	  <div key="mainBlock" className={ classes.block }>
	    <header className={ classes.header }>
		  <p className={ classes.welcomeTitle } key="welcome">{ __('Welcome to') } <b>{ this.state.boardModel }</b></p>
          <p className={ classes.welcomeTitle + ' ' + classes.welcomeTitleLine } key="advanced">
            {
              __('For advanced network configuration, go to ')
            }<a style={{ color: '#00a1de', textDecoration: 'none' }} href="/cgi-bin/luci">OpenWrt</a>.
          </p>
		</header>
		<AppBar 
          position="relative"
          color="default"
          className={ classes.content }
          >
		  <Tabs
		    value={this.state.tabsValue}
			onChange={ this.handleChange } 
		    TabIndicatorProps={{
              style: {
                backgroundColor: "#54EFE2",
              }
            }}
            style={{ backgroundColor: green[500], borderRadius: '5px 5px 0px 0px', color: '#fff' }}>
			<Tab label={ __('System information') } value={0} fullWidth/>
			<Tab label={ __('Network') } value={1} fullWidth/>
			<Tab label={ __('Configuration') } value={2} fullWidth/>
		  </Tabs>
		  {this.state.tabsValue === 0 && <TabContainer><Sysinfo boardInfo={ this.props.boardInfo } /></TabContainer>}
          {this.state.tabsValue === 1 && <TabContainer>Item Two</TabContainer>}
          {this.state.tabsValue === 2 && <TabContainer>Item Three</TabContainer>}
		</AppBar>
	  </div>
    );
  }
}

contentComponent.childContextTypes = {
  classes: PropTypes.object,
};

export default withStyles(styles)(contentComponent);
