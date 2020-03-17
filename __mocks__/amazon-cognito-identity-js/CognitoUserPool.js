const mock_response = {
  user: {
    username: 'DummyUser',
    pool: {
      userPoolId: 'user_pool_id',
      clientId: 'client_id',
      client: ['function'],
      advancedSecurityDataCollectionFlag: true,
      storage: ['function']
    },
    Session: null,
    client: {
      endpoint: 'https://cognito-idp.us-east-1.amazonaws.com/',
      userAgent: 'aws-amplify/0.1.x js'
    },
    signInUserSession: null,
    authenticationFlowType: 'USER_SRP_AUTH',
    storage: {
      setItem: ['function'],
      getItem: ['function'],
      removeItem: ['function'],
      clear: ['function']
    },
    keyPrefix: 'CognitoIdentityServiceProvider.<client_id>',
    userDataKey: 'CognitoIdentityServiceProvider.<client_id>.DummyUser.userData'
  },
  userConfirmed: false,
  userSub: 'user_sub',
  codeDeliveryDetails: {
    AttributeName: 'email',
    DeliveryMedium: 'EMAIL',
    Destination: 'd***@e***.com'
  }
}

function CognitoUserPool(data) {
  const { UserPoolId, ClientId } = data;
  this.userPoolId = UserPoolId;
  this.clientId = ClientId;
  this.signUp = function(name, password, attributes, params, callback) {
    return callback(null, mock_response);
  };
}

module.exports = CognitoUserPool;
