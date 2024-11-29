
export interface Table {
    MATNR: string;           // Material
    WERKS: string;           // Plant
    LGORT: string;           // Storage Location
    BWART: string;           // Movement Type
    MENGE: number;           // Quantity
    MEINS: string;           // Base Unit of Measure
    EBELN: string;           // Supplier
    EBELP: number;           // Material Document Item
}


// Search Data
export interface SearchResult {
    tables: Table[];
    total: number;
}
