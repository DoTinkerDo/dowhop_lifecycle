// @flow

import React from 'react';
import { filter } from 'lodash';
import { Col, Card, CardBody, CardImg, CardTitle, Row } from 'reactstrap';
import LoadingDots from './LoadingDots';
import CurrentUser from './CurrentUser';

const Profile = (props: {
  currentUser: Object,
  about: Object,
  value: string,
  handleChange: Function,
  handleSubmit: Function,
  appUsers: Object,
  location: Object,
  appUsers: Object
}) => {
  const { currentUser, about, value, handleChange, handleSubmit, appUsers } = props;

  const uid = props.location.search.slice(1);
  const selectedUser = filter(appUsers, user => user.uid === uid);
  const { photoURL, displayName, profileAbout, email } = selectedUser[0] || '';

  if (currentUser.uid === uid || !uid) {
    return (
      <div>
        {!currentUser ? (
          <LoadingDots />
        ) : (
          <CurrentUser
            uid={currentUser.uid}
            email={currentUser.email}
            displayName={currentUser.displayName}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            value={value}
            about={about}
            photoURL={currentUser.photoURL}
          />
        )}
      </div>
    );
  }
  return (
    <Row>
      <Col xs="12" sm="6" md="5">
        {!photoURL && <LoadingDots />}
        <Card>
          <CardImg src={photoURL} alt={`headshot for ${displayName}`} />
          <CardBody>
            <CardTitle>{displayName}</CardTitle>
            <p>{profileAbout || 'Bio'}</p>
            <p>{email}</p>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Profile;
