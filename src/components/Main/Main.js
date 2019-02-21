import React from 'react';
import { TabBar } from 'antd-mobile';
import { Switch, Route } from 'react-router';
import PropTypes from 'prop-types';
import MyCustomer from '../MyCustomer';
import SigningCustomers from '../SigningCustomers';
import Tools from '../Tools';
import Personal from '../Personal';
import './less/main.less';

const Tabs = [
  {
    title: '我的客户',
    icon: 'mycus',
    path: '/myCustomer'
  },
  {
    title: '签约客户',
    icon: 'signcus',
    path: '/signingCustomers'
  },
  {
    title: '工具',
    icon: 'tools',
    path: '/tools'
  },
  {
    title: '我的',
    icon: 'personal',
    path: '/personal'
  }
];
class Main extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  handeleSwitchTabs = item => {
    const { path } = item;
    const { history } = this.props;
    history.push(path);
  };

  renderContent = () => {
    return (
      <div
        style={{
          backgroundColor: 'white',
          height: '100%',
          textAlign: 'center'
        }}
      />
    );
  };

  render() {
    const { pathname } = this.props.history.location;
    const isHidden = Tabs.findIndex(item => item.path === pathname) === -1;
    return (
      <div className="main">
        <div className="main-content">
          <Switch>
            <Route exact path="/myCustomer" component={MyCustomer} />
            <Route
              exact
              path="/signingCustomers"
              component={SigningCustomers}
            />
            <Route exact path="/tools" component={Tools} />
            <Route exact path="/personal" component={Personal} />
          </Switch>
        </div>
        <TabBar
          unselectedTintColor="#949494"
          tintColor="#33A3F4"
          barTintColor="white"
          hidden={isHidden}
          noRenderContent
        >
          {Tabs.map(item => (
            <TabBar.Item
              title={item.title}
              key={item.icon}
              icon={
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    background:
                      'url(https://zos.alipayobjects.com/rmsportal/sifuoDUQdAFKAVcFGROC.svg) center center /  21px 21px no-repeat'
                  }}
                />
              }
              selectedIcon={
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    background:
                      'url(https://zos.alipayobjects.com/rmsportal/iSrlOTqrKddqbOmlvUfq.svg) center center /  21px 21px no-repeat'
                  }}
                />
              }
              selected={item.path === pathname}
              onPress={() => this.handeleSwitchTabs(item)}
              data-seed="logId"
            />
          ))}
        </TabBar>
      </div>
    );
  }
}

export default Main;
