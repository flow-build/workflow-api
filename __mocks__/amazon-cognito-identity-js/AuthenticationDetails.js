function AuthenticationDetails(data) {
  const { Username, Password } = data;
  this.username = Username;
  this.password = Password;
  this.getDetails = jest.fn().mockReturnValue('cognitouserattribute');
}

module.exports = AuthenticationDetails;
