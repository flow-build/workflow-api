function CognitoUserAttribute(data) {
  const { Name, Value } = data;
  this.name = Name;
  this.value = Value;
  this.getAttribute = jest.fn().mockReturnValue('cognitouserattribute');
}

module.exports = CognitoUserAttribute;
