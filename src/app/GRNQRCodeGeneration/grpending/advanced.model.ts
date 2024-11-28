// Table data
// export interface Table {
//     purchasingDocument: string;
//     item: string;
//     purchasingDocType: string;
//     purchasingGroup: string;
//     documentDate: string;
//     supplier: string;
//     material: string;
//     shortText: string;
//     materialGroup: string;
//     plant: string;
//     orderQuantity: string;
//     orderUnit: string;
//     quantitySKU: string;
//     sku: string;
//     netPrice: string;
//     currency: string;
//     stillToBeDeliveredQty: string;
//     stillToBeDeliveredValue: string;
//     stillToBeInvoicedQty: string;
//     stillToBeInvoicedValue: string;
    
//   }
export interface Table {
    EBELN: string; // Purchase Document Number
    EBELP: string; // Item Number
    EKGRP: string; // Purchase Group
    BEDAT: string; // Purchase Document Date
    LIFNR: string; // Supplier Code
    NAME1: string; // Vendor Address
    LOEKZ: string; // Deletion/Blocked
    MATNR: string; // Material
    TXZ01: string; // Updating Text Field
    WERKS: string; // Plant
    MENGE: number; // Alternative Unit of Measure
    MEINS: string; // Unit of Measure
    MENGE1: number; // Bill of Quantity (BOM)
    MEINS1: string; // Base Unit of Measure
    NETWR: number; // Net Price
    DMBTR1: number; // Sum of Amount
    EINDT: string; // Delivery Date
    DATUM: string; // Current Date
    LV_MENGE_SUM: number; // -
    DAYS: number; // -
    EKNAM: string; // Description of Purchase Group
    WRBTR: number; // Local Current Amount
    BUYER: string; // Supplier Email ID
    CREAT: string; // Created By
    ELIKZ: string; // Open PO
  }
  
  
  export interface SearchResult {
      tables: Table[];
      total: number;
  }
  