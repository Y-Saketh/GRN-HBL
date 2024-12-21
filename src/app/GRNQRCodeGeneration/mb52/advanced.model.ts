export interface Table {
    MATNR: number;              // Material
    MAKTX: string;              // Material Description
    WERKS: number;              // Plant
    LGORT: string;              // Storage Location  
    LGOBE: string;              // sl Description
    MEINS: string;              // Base Unit of Measure
    LABST: number;              // Unrestricted Stock Quantity   
    WLABS: number;              // Unrestricted Stock Value
    INSME: number;            // Quality Inspection Stock Quantity
    WINSM: string;            // Quality Inspection Stock Value
}
  
export interface SearchResult {
    tables: Table[];
    total: number;
  }
