import React from 'react';
import { Intro } from 'components/Intro';
import { User } from 'containers/User';

export class RegisterPage extends React.Component {
  componentDidMount() {
    $('#the-header').removeClass('navbar-fixed');
  }
  render() {
    return (
      <div>
        <Intro className="intro-panel" />
        <div className="main-wrap">
          <User isRegister />
        </div>
      </div>
    );
  }
}
