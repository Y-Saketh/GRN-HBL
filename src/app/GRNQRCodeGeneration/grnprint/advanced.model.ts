export interface Table {
    DCLABS: any;
    DCHARG: any;
    LIFNR: any;
    MBLNR: any;
    MATNR: number; // Material code
    MAKTX: string; // Material description
    EBELN: number; // PO number
    STEUC: string; // HSN code
    MEINS: string; // UOM
    LSMNG: number; // DC quantity
    RATE: number;  // Rate
    NET: number;   // Net value
    CHANGED_ON: string; // Other expenses
    CGST: number; // CGST
    SGST: number; // SGST
    IGST: number; // IGST
    GROSS: number; // Gross value
    
    MAT_DOC: number; // Mat Doc
    MENGE: number; // Quantity

    EBELP: string; // PO Item
    SHORT_TEXT?: string; // Optional description
    ORGQTY?: string; // Optional original quantity
    splitCount?: number; // Number of shadow rows to split
    shadowRows?: Table[]; // Shadow rows
    BUDAT?:string; //Posting Date
    CHARG?:string;
    ZLABEL?:number;
    selected?:boolean;
}
  
  
export interface SearchResult {
    tables: Table[];
    total: number;
  }
  
  