module.exports = verifyToken;

function verifyToken(req) {
  const bearerHeaders = req.headers['authorization'];
  if(typeof bearerHeaders !== undefined || typeof bearerHeaders !== null) {
    // split at the space
    const bearer = bearerHeaders.split(' ');
    //get Token from array
    const bearerToken = bearer[1];
    //set the token
    req.token = bearerToken;
    //next middleware
    return req.token;
  } else {
    return {message : 'not authorized'}
    //res.status(403).json({message : 'not authorized'});
  }
}
