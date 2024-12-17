export interface Table {
    MATNR: string;              // Material
    MAKTX: string;              // Material Description
    plantname1: string;         // Plant Name 1
    LGORT: string;              // Storage Location  
    LAPST: string;                 // sl Description
    UnrestrictedUnit: string;   // Movement Type Text
    transit: string;            // Posting Date   
    inQtyInsp: number;          // In Quantity Insp
    restrictedUse: string;      // Restricted USe
    returns: string;            // Returns
    blocked: string;            // Blocked
}
  
export interface SearchResult {
    tables: Table[];
    total: number;
  }
