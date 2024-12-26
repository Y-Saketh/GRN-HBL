// Table data

export interface Table {
  selected: unknown;
  gateEntryNumber: string; // Entry Gate Pass Number
  vehicleNumber: string; // Vehicle Number
  invoiceDate: string; // Invoice Date
  gateEntryDate: string; // Gate Entry Date
  DocumentDate: string; // Document Date
  MATNR: string; // Material Number
  SHORT_TEXT: string; // Material Description
  ORGQTY: number; // Original Quantity
  supplier: string; // Supplier/Vendor Code
  WERKS: string; // Plant
  LGORT: string; // Storage Location
  incoterms: string; // Incoterms
  transportationGroup: string; // Transportation Group
  transporterName: string; // Transporter Name
  MEINS: string; // Base Unit of Measure
  PO_NUMBER: string; // Purchasing Document Number
  PO_ITEM: string; // Item Number of Purchasing Document
  tolerance: string; // Over & Under Tolerance

  // Newly added fields
  VBELN: string; // Inbound Delivery
  POSNR: string; // Inbound Delivery Item
  ERDAT: string; // Inbound Created On
  MBLNR: string; // Material Document
  BUDAT: string; // Posting Date
  AGE: string; // Days Taken for GR
  BELNR_MIRO: string; // MIRO No
  BUDAT_MIRO: string; // MIRO Date
  XBLNR: string; // Invoice No
  BLDAT: string; // Invoice Date
  VGBEL: string; // Purchase Order
  VGPOS: string; // Purchase Order Item
  AEDAT: string; // Purchase Order Date
  ERNAM: string; // Created By
  LGOBE: string; // Storage Location Name
  MAKTX: string; // Material Description
  LFIMG: string; // Quantity
  GATEENTRY: string; // Gate Entry No
  GATEDATE: string; // Gate Entry Date
  AGE1: string; // Days Taken for IBD
}


  


export interface SearchResult {
    tables: Table[];
    total: number;
}
