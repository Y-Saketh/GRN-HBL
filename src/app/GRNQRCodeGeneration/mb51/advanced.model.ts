export interface Table {
    WERKS: string;        // Plant
    LGORT: string;        // Storage Location
    MATNR: string;        // Material
    BWART: string;        // Movement Type
    mvtTypeText: string;  // Movement Type Text
    BUDAT: string;        // Posting Date
    MAKTX: string;        // Material Description
    qtyInUnitofEntry: number; // Quantity in Unit of Entry
    amtInLocCur: number; // Amount in Local Currency
    MBLNR: string;        // Material Document
    NAME1: string;        // Vendor Name
    TEXT: string;           // Text
    LFIMG: number; // Quantity
    supplier: string; // Supplier
    order: string; // Order
}
  
export interface SearchResult {
    tables: Table[];
    total: number;
  }
  
  