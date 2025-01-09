export const environment = {
  production: true,
  //localhost 
    // API_URL_DEV:"http://127.0.0.1:3000/",
    //-------------------------------------------------------//
  //Dev API
  API_URL_DEV:"http://10.10.4.178:3000/",
  apiUrl:'http://10.10.4.178:9091/api/',

 // productionAPI
  // API_URL_DEV:"https://ims.hbl.in/grn/",
  //-------------------------------------------------------//
  //Dev redirecting URL
    URL:"http://10.10.4.178",
    //Prod redirecting URL
  //  URL:"https://ims.hbl.in",
  defaultauth: 'fakebackend',
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  }
};
