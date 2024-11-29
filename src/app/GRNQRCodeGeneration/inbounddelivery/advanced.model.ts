// Table data

export interface Table {
  MATNR: string; // Material Number
  WERKS: string; // Plant
  LGORT: string; // Storage Location
  BWART: string; // Movement Type (Inventory Management)
  MENGE: number; // Quantity
  MEINS: string; // Base Unit of Measure
  EBELN: string; // Purchasing Document Number
  EBELP: string; // Item Number of Purchasing Document
  MAKT: string; // Material Description
}

  


export interface SearchResult {
    tables: Table[];
    total: number;
}
