// Table data

export interface Table {
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
}

  


export interface SearchResult {
    tables: Table[];
    total: number;
}
