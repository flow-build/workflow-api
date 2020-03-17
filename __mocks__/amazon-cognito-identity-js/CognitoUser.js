const jwt = {
  getJwtToken: () => {
    return "eyJraWQiOiJQY0RhOGpLUEo4VkhHc3ZHTWFwWlF6VzkrUlM0Z05aelBPZG9wZTRsMk1RPSIsIm\
FsZyI6IlJTMjU2In0.eyJzdWIiOiI3NGE1NjY2Ni1kZDkzLTQwNWYtYTUyZC0wYjE1ZDVjYjhhZTkiLCJl\
dmVudF9pZCI6ImZiZDNlNjM5LWUxYjctNDY4ZS04YWNmLThmY2MwNzAwNDIwMSIsInRva2VuX3VzZSI6Im\
FjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE1\
NzU5MTAwODQsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbV\
wvdXMtZWFzdC0xX0ppbEpScVRzcCIsImV4cCI6MTU3NTkxMzY4NCwiaWF0IjoxNTc1OTEwMDg0LCJqdGki\
OiJhNThlODk2Yi04YzYxLTRhMjItYWI4NC03MzEyZTI5NTA1OTYiLCJjbGllbnRfaWQiOiIxMGQ2NmJja2\
1jbjh2dHFhNmxrcGd1ajNxciIsInVzZXJuYW1lIjoiRHVtbXlVc2VyIn0.HWSsqgldIgIEe8ugscThHSKi\
pRwUc7gOrLzd_xF1Xim34TcjPkUVe6pHMsSl_fKsnaJvAC3nrJYsFweXc1QtOcHMV2V4hzynxE2JhspVPd\
nvAW6VROaWOJ6mtlKAP3dPu3xuBo50t8I8_BHJze2F0d5q_aNM8BDCqpL9X2EqMB9M9fU6EV1ytlOLpH2e\
46tU7Mp5-7pHzzdP-nIxCQLD28J-O_jt_NzvtuJKug0Sz8Quh6qa5eRtIjBa7Vi3tM7ErGeknCr-6r9Ykf\
3oq02qhQsZ39STXU-jFAGUq7ZLdFe4wyxveanKzZMGdCLh6VT8X5uQJ4CzPetCqNzVw_vMgg";
  }
}

const wrongPasswordResult = () => {
    return {"code": "NotAuthorizedException", "message": "Incorrect username or password.", "name": "NotAuthorizedException"};
}

const userNotExistant = () => {
    return {"code": "UserNotFoundException", "message": "User does not exist.", "name": "UserNotFoundException"};
}

const invalidParameterResponse = () => {
    return {"code": "InvalidParameterException", "message": "Missing required parameter USERNAME", "name": "InvalidParameterException"};
}

const authenticateResult = {
  getAccessToken: () => {
    return jwt;
  }
}

const forgotPasswordResult = {
  CodeDeliveryDetails: {
    AttributeName: 'email',
    DeliveryMedium: 'EMAIL',
    Destination: 'd***@e***.com'
  }
};

const confirmPasswordResult = {
  response: "Password confirmed!"
};

const wrongCodeResult = {
  response: "Password not confirmed!"
};

function CognitoUser(data) {
  const { Username, Pool } = data;
  this.username = Username;
  this.pool = Pool;
  this.confirmRegistration = function(name, password, callback) {
    return callback(null, "Mock confirmation result");
  };
  this.authenticateUser = function(authenticationDetails, callback) {
    if (authenticationDetails.password !== "DummyPassword123#") {
      return callback.onFailure(wrongPasswordResult());
    }
    return callback.onSuccess(authenticateResult);
  };
  this.forgotPassword = function(callback) {
    return callback.onSuccess(forgotPasswordResult);
  };
  this.confirmPassword = function(verification_code, new_password, callback) {
    if (verification_code !== "dummyCode") {
      return callback.onFailure(wrongCodeResult);
    }
    return callback.onSuccess(confirmPasswordResult);
  };
}
module.exports = CognitoUser;
