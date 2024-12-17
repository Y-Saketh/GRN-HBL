export interface Table {
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
}
  
  
export interface SearchResult {
    tables: Table[];
    total: number;
  }
  
  