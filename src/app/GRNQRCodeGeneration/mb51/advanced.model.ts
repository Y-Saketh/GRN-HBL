export interface Table {
    PLANT: string;       // Plant
    STG_LOC: string;      // Storage Location
    MATERIAL: string;      // Material
    MAT_DES: string;      // Material Description
    MVT_TYPE: number;      // Movement Type
    MVT_TYPE_TXT: string;      // Movement Type Text
    POSTING_DATE: string;      // Posting Date
    PRICE: number;      // Quantity in Unit of Entry  //d
    L_CUR_AMT: number;      // Amount in Local Currency
    MAT_DOC: string;      // Material Document
    // NAME1: string;      // Vendor Name  //d
    // SGTXT: string;      // Text  //d
    QUANITY: number;      // Quantity
    SUPPLIER: number;      // Supplier
    ORDER: string;      // Order
    GL_ACCOUNT: string;      // GL account
    DOC_HEADER_TXT: string;      // Doc Header Text
    ENTRY_DATE: string;      // Entry Date
    BATCH: number;      // Batch
    CONSUMPTION: string;      // Consumption
}
  
export interface SearchResult {
    tables: Table[];
    total: number;
  }