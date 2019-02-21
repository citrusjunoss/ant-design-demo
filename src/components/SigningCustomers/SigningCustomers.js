import React from 'react';
import { Tabs } from 'antd-mobile';
import Header from '../Commom/Header';

const tabs = [{ title: '我的签约客户' }, { title: '签约客户库' }];
class MyCustomer extends React.Component {
  componentDidMount() {}

  render() {
    return (
      <div>
        <Header title="签约客户" />
        <Tabs
          tabs={tabs}
          initialPage={1}
          onChange={(tab, index) => {
            console.log('onChange', index, tab);
          }}
          onTabClick={(tab, index) => {
            console.log('onTabClick', index, tab);
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '150px',
              backgroundColor: '#fff'
            }}
          >
            Content of first tab
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
              backgroundColor: '#fff'
            }}
          >
            Content of second tab
          </div>
        </Tabs>
      </div>
    );
  }
}

export default MyCustomer;
