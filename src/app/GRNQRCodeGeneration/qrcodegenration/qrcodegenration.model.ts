export interface Table {
    MaterialDocYear: string;
    materialDocItem: string;
    identification: string;
    movementType: string;
    Material: string;
    Plant: string;
    storageLocation: string;
    batch: string;
    stockType: string;
    supplier: string;
    currency: string;
    amountInLocCur: string;
    valuationType: string;
    quantity: number;
    baseUnitofMeasure: string; 
    qtyinunitofentry: string;  
    unitofEntry: string;       
    qtyinOPUn: string;         
}

// Search Data
export interface SearchResult {
    tables: Table[];
    total: number;
}
