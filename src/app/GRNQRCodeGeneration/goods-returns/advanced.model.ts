export interface Table {
    selected: any;
    MATNR: string; // Material Code
    MAKTX: string; // Material Description
    MEINS: string; // UOM
    WERKS: string // Plant
    LGORT: string; // Storage Location
    LIFNR: string; // Vendor Code
    GRUND: string; // Reason for Movement
    shadowRows?: Table[]; // Shadow rows
    BLDAT: string; // Doc Date
    BUDAT: string; // Posting Date
    MATKL: string; // Material Group
    EBELNL: string; // PO Number
    LFBNR: number; // Reference Doc Number
    VENDORNAME: string; // Vendor Name
    WEMPF: string; // Goods Receipt Name
  }
  
  
  
  export interface SearchResult {
      tables: Table[];
      total: number;
  }
  