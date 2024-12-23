export interface Table {
    selected: any; // Optional: Indicates whether the row is selected
    MBLNR: number; // Number of Material Document
    MJAHR: number; // Material Document Year
    BUDAT: string; // Posting Date in the Document
    BLDAT: string; // Document Date in Document
    BKTXT: string; // Document header text
    
    MATNR: number; // Material Number
    LGORT: string; // Storage Location
    BWART: string; // Movement Type (Inventory Management)
    WERKS: string; // Plant
    EBELN: string; // Purchasing Document Number
    EBELP: number; // Item Number of Purchasing Document
    ZEILE: number; // Item in Material Document
    MENGE: number; // Quantity
    MEINS: string; // Base Unit of Measure
    REASON: string; // Reason for Movement
    INSMK: string; // Stock Type
    WEMPF: string; // Goods recipient
    CHARG: string; // Batch Number
    LIFNR: string; // Supplier's Account Number
    RMENGE: number; // Return Quantity
}

  
  
  export interface SearchResult {
      tables: Table[];
      total: number;
  }
