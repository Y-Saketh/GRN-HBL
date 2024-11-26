// Table data

  export interface Table {
    gateEntryNumber: string;
    vehicleNumber: string;
    invoiceDate: string;
    material: string;
    description: string;
    deliveryQuantity: string;
    storageLocation: string;
    incoterms: string;
    transportationGroup: string;
    transporterName: string;
    supplier: string;
    plant: string;
    tolerance: string;
  }
  


export interface SearchResult {
    tables: Table[];
    total: number;
}
