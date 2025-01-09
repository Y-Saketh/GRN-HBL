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
    WERKS: string;        // Plant
    VBELN: string;        // Inbound Delivery
    POSNR: string;        // Inbound Delivery Item
    ERDAT: string;        // Inbound Created On
    VGBEL: string;        // PO
    VGPOS: string;        // PO Item
    LGORT: string;        // Storage Location
    MATNR: string;        // Material
    MAKTX: string;        // Material Description
    MEINS: string;        // Unit of Measure
    LFIMG: number;        // Quantity
    GATEENTRY: string;    // Gate Entry Number
    GATEDATE: string;     // Gate Entry Date
  
    MBLNR: string;        // Material Document
    BUDAT: string;        // Posting Date
    AGE: number;          // Days Taken for GR
    BELNR_MIRO: string;   // MIRO Number
    BUDAT_MIRO: string;   // MIRO Date
    XBLNR: string;        // Invoice Number
    BLDAT: string;        // Invoice Date
    AEDAT: string;        // PO Date
    ERNAM: string;        // Created By
    LGOBE: string;        // Storage Location Name
    AGE1: number;         // Days Taken for IBD
  }
  

export interface TableRow {
    RES_NO: any;
    INSPCHAR: any;
    MATNR: string;
    WERKS: string;
    LGORT: string;
    BWART: string;
    Batch: string;
    PostingDate: string;
    MENGE: string | number;
    MEINS: string;
    EBELN: string;
    EBELP: string | number;
  }
  

  export interface SearchResult {
      tables: Table[];
      total: number;
  }
  