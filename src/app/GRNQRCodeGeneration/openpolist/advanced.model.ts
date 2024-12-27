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
  EBELN: string; // PO
  EBELP: string; // PO Item
  MATNR: string; // Material
  TXZ01: string; // Material Description
  LIFNR: string; // Vendor Code
  NAME1: string; // Vendor Name
  EKGRP: string; // Purchase Group
  WERKS: string; // Plant
  MEINS: string; // Unit of Measure (UOM)
  MENGE: number; // PO Qty
  ERNAM: string; // Created By
  BUYER: string; // Buyer
  EKNAM: string; // Purchase Group Description
  NETWR: number; // PO Value
  LOEKZ: string; // Deletion/Blocked Indicator
  EINDT: string; // Delivery Date
  MEINS1: string; // Base Unit of Measure
  BEDAT: string; // Purchase Document Date
  
  deleveryChallanNumber: number; // Delevery Challan Number
  DocumentDate: string; // Document Date
  XBLNR: string; // Invoice Number
  BLDAT: string; // Invoice Date
  vehicleNumber: string; // Vehicle Number
  transporterName: string; // Transporter Name
  GATEENTRY: string; // Gate Entry Number
  GATEDATE: string; // Gate Entry Date
  lrDate: string; // LR Date
  lrNo: string; // LR Number
  
  MENGE1: number; // Bill of Quantity (BOM)
  DMBTR1: number; // Sum of Amount
  DATUM: string; // Current Date
  LV_MENGE_SUM: number; // -
  DAYS: number; // -
  WRBTR: number; // Local Current Amount
  ELIKZ: string; // Delivery Indicator

  BSART_F: string;
  BSART_T: string;
  BEDAT_F: string;
  BEDAT_T: string;
}


export interface SearchResult {
    tables: Table[];
    total: number;
}
