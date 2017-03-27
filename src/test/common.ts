export function getExpectError(chaiExpect) {
  return function(err, message?, errConstructor?) {
    errConstructor = errConstructor || Error;
    chaiExpect(err).to.be.instanceof(errConstructor);
    if(message instanceof RegExp) {
      chaiExpect(err.message).to.match(message);
    } else if(typeof message !== "undefined"){
      chaiExpect(err.message).to.equal(message);
    }
  }
}