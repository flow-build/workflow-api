module.exports = {
  CognitoUserPool: jest.fn().mockImplementation(
    require('./CognitoUserPool')
  ),
  CognitoUserAttribute: jest.fn().mockImplementation(
    require('./CognitoUserAttribute')
  ),
  CognitoUser: jest.fn().mockImplementation(
    require('./CognitoUser')
  ),
  AuthenticationDetails: jest.fn().mockImplementation(
    require('./AuthenticationDetails')
  )
}
