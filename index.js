const functions = require('firebase-functions')
const admin = require('firebase-admin')

require('dotenv').config();

let serviceAccount = { 
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X_CERT_URL
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://yourProjectName.firebaseio.com"
})

const request = require('request-promise')

    const kakaoRequestMeUrl = 'https://kapi.kakao.com/v1/user/me?secure_resource=true'
    
    /**
     * requestMe - Returns user profile from Kakao API
     *
     * @param  {String} kakaoAccessToken Access token retrieved by Kakao Login API
     * @return {Promiise<Response>}      User profile response in a promise
     */
    function requestMe(kakaoAccessToken) {
      console.log('Requesting user profile from Kakao API server.')
      return request({
        method: 'GET',
        headers: {'Authorization': 'Bearer ' + kakaoAccessToken},
        url: kakaoRequestMeUrl,
      })
    }

/**
   * updateOrCreateUser - Update Firebase user with the give email, create if
   * none exists.
   *
   * @param  {String} userId        user id per app
   * @param  {String} email         user's email address
   * @param  {String} displayName   user
   * @param  {String} photoURL      profile photo url
   * @return {Prommise<UserRecord>} Firebase user record in a promise
   */
  function updateOrCreateUser(userId, email, displayName, photoURL) {
    console.log('updating or creating a firebase user');
    const updateParams = {
      provider: 'KAKAO',
      displayName: displayName,
    };
    if (displayName) {
      updateParams['displayName'] = displayName;
    } else {
      updateParams['displayName'] = email;
    }
    if (photoURL) {
      updateParams['photoURL'] = photoURL;
    }
    console.log(updateParams);
    return admin.auth().updateUser(userId, updateParams)
    .catch((error) => {
      if (error.code === 'auth/user-not-found') {
        updateParams['uid'] = userId;
        if (email) {
          updateParams['email'] = email;
        }
        return admin.auth().createUser(updateParams);
      }
      throw error;
    });
  }

  /**
   * createFirebaseToken - returns Firebase token using Firebase Admin SDK
   *
   * @param  {String} kakaoAccessToken access token from Kakao Login API
   * @return {Promise<String>}                  Firebase token in a promise
   */
  function createFirebaseToken(kakaoAccessToken) {
    return requestMe(kakaoAccessToken).then((response) => {
      const body = JSON.parse(response)
      console.log(body)
      const userId = `kakao:${body.id}`
      if (!userId) {
        return res.status(404)
        .send({message: 'There was no user with the given access token.'})
      }
      let nickname = null
      let profileImage = null
      if (body.properties) {
        nickname = body.properties.nickname
        profileImage = body.properties.profile_image
      }
      return updateOrCreateUser(userId, body.kaccount_email, nickname,
        profileImage)
    }).then((userRecord) => {
      const userId = userRecord.uid
      console.log(`creating a custom firebase token based on uid ${userId}`)
      return admin.auth().createCustomToken(userId, {provider: 'KAKAO'})
    })
  }

  exports.kakaoCustomAuth = functions.region('asia-northeast1').https
  .onRequest((req, resp) => {
    const token = req.body.token
    if (!token) return resp.status(400).send({error: 'There is no token.'})
    .send({message: 'Access token is a required parameter.'})

    console.log(`Verifying Kakao token: ${token}`)
    createFirebaseToken(token).then((firebaseToken) => {
      console.log(`Returning firebase token to user: ${firebaseToken}`)
      res.send({firebase_token: firebaseToken});
    })

    return
  })
