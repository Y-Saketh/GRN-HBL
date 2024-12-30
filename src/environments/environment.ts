// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  //localhost 
    // API_URL_DEV:"http://127.0.0.1:3000/",
    //-------------------------------------------------------//
  //Dev API
  // API_URL_DEV:"http://10.10.4.178:3000/",
 // productionAPI
  API_URL_DEV:"https://ims.hbl.in/grn/",
  //-------------------------------------------------------//
  //Dev redirecting URL
    // URL:"http://10.10.4.178",
    //Prod redirecting URL
   URL:"https://ims.hbl.in",
  
  defaultauth: 'fakebackend',
  firebaseConfig: {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
