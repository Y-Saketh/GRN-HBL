
export interface Table {
    MATNR: string; // Material Number
    WERKS: string; // Plant
    LGORT: string; // Storage Location
    BWART: string; // Movement Type
    Batch: string; // Batch
    PostingDate: string; // Posting Date
    MENGE: string; // Quantity
    MEINS: string; // Unit of Measure
    EBELN: string; // Purchase Order
    EBELP: string; // PO Item
    SHORT_TEXT?: string; // Optional description
    ORGQTY?: string; // Optional original quantity
    splitCount?: number; // Number of shadow rows to split
    shadowRows?: Table[]; // Shadow rows
    BUDAT?:string; //Posting Date
  }
  


// Search Data
export interface SearchResult {
    tables: Table[];
    total: number;
}
