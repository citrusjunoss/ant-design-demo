import React from 'react';
import PropTypes from 'prop-types';
import { NavBar, Icon } from 'antd-mobile';
import { withRouter } from 'react-router-dom';
import './less/header.less';

@withRouter
class Header extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired,
    rightContent: PropTypes.element
  };

  static defaultProps = {
    rightContent: null
  };

  componentDidMount() {}

  handleBackToPrev = () => {
    const { history } = this.props;
    history.goBack();
  };

  render() {
    const { title, rightContent } = this.props;
    return (
      <NavBar
        mode="light"
        className="header-navbar"
        icon={<Icon type="left" />}
        onLeftClick={this.handleBackToPrev}
        rightContent={rightContent}
      >
        {title}
      </NavBar>
    );
  }
}

export default Header;
