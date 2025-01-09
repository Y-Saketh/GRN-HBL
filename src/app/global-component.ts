export const GlobalComponent = {
    // Api Calling
    // API_URL: 'https://api-node.themesbrand.website/',
    // API_URL_DEV : 'http://127.0.0.1:3000/',
    // API_URL_DEV:"https://ims.hbl.in/grn/",
    // API_URL_DEV:"http://10.10.4.178:3000/",
    // API_URL: 'https://org/',

    
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
    headerToken: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },

    // Auth Api
    AUTH_API: "https://api-node.themesbrand.website/auth/",
    // AUTH_API:"http://127.0.0.1:3000/auth/",


    // Products Api
    product: 'apps/product',
    productDelete: 'apps/product/',

    // Orders Api
    order: 'apps/order',
    orderId: 'apps/order/',

    // Customers Api
    customer: 'apps/customer',
}