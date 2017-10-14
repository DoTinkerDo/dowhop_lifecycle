// @flow

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../store';
import Wrapper from './Wrapper';
import PrivateRoute from './PrivateRoute';
import PropsRoute from './PropsRoute';
import Login from './Login';
import ProfileIndexContainer from '../containers/ProfileIndexContainer';
import ProfileContainer from '../containers/ProfileContainer';
import FourOhFour from './FourOhFour';
import { startListeningToAuthChanges } from '../actions/authentication';
import startListeningForCurrentUser from '../actions/current-user';
import { startListeningForUserProfileChanges } from '../actions/profile';
import startListeningForAppUsers from '../actions/app-users';

store.dispatch(startListeningToAuthChanges());
store.dispatch(startListeningForCurrentUser());
store.dispatch(startListeningForUserProfileChanges());
store.dispatch(startListeningForAppUsers());

const App = () => (
  <Provider store={store}>
    <Wrapper>
      <Switch>
        <PropsRoute path="/my-profile/login" component={Login} />
        <PrivateRoute exact path="/my-profile" component={ProfileIndexContainer} redirectTo="/my-profile/login" />
        <PrivateRoute path="/my-profile/:uid" component={ProfileContainer} redirectTo="/my-profile/login" />
        <Route component={FourOhFour} />
      </Switch>
    </Wrapper>
  </Provider>
);

export default App;
