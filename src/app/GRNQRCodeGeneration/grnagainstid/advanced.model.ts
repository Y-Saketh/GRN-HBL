// Table data
export interface Table {
  MBLNR: string; // Number of Material Document
  EBELN: string; // Purchasing Document Number
  ZEILE: number; // Item in Material Document
  ZRQTY: number; // Reel Quantity
  ZRNUM: number; // Reel Number
  ZQRGEN_DT: string; // QR Generation Date
  ZQRSTAT: string; // QR Status
  ZQRBAL_QTY: number; // QR Balance Qty
  WERKS: string; // Plant
  MATNR: string; // Material Number
  MAKTX: string; // Material Description
  LGORT: string; // Storage Location
  MENGE: number; // Quantity
  MEINS: string; // Base Unit of Measure
  CHARG: string; // Batch Number
  LIFNR: string; // Account Number of Supplier
  NAME1:string;
  selected: boolean;
  generated: boolean; 
}


export interface SearchResult {
    tables: Table[];
    total: number;
}
