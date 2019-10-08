# FirebaseAuthSocialLogin

개인서버 없이 functions Custom Auth생성이 가능합니다.

firebase functions 세팅후 

firebase 콘솔 홈에서 설정을 들어간다음 서비스 계정에서 AdminKey를 받고 

functions 폴더안에 .env파일으 만들어 

TYPE=""
PROJECT_ID=""
PRIVATE_KEY_ID=""
PRIVATE_KEY=""
CLIENT_EMAIL=""
CLIENT_ID=""
AUTH_URI=""
TOKEN_URI=""
AUTH_PROVIDER_X_CERT_URL=""
CLIENT_X_CERT_URL=""

빈공간을 채워 수정 저장 하신다음에

[dotenv](https://www.npmjs.com/package/dotenv) 를 설치합니다.

그다음 올려져있는 index.js 파일의 코드를 복사해서 사용하시면 됩니다.

