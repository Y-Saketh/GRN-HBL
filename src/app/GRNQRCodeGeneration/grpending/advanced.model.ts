// Table data
// export interface Table {
//     purchasingDocument: string;
//     item: string;
//     purchasingDocType: string;
//     purchasingGroup: string;
//     documentDate: string;
//     supplier: string;
//     material: string;
//     shortText: string;
//     materialGroup: string;
//     plant: string;
//     orderQuantity: string;
//     orderUnit: string;
//     quantitySKU: string;
//     sku: string;
//     netPrice: string;
//     currency: string;
//     stillToBeDeliveredQty: string;
//     stillToBeDeliveredValue: string;
//     stillToBeInvoicedQty: string;
//     stillToBeInvoicedValue: string;
    
//   }
export interface Table {
    EBELN?: string; // Purchase Document Number
    EBELP?: string; // Item Number
    EKGRP?: string; // Purchase Group
    BEDAT?: string; // Purchase Document Date
    LIFNR?: string; // Supplier Code
    NAME1?: string; // Vendor Address
    LOEKZ?: string; // Deletion/Blocked
    MATNR?: string; // Material
    TXZ01?: string; // Updating Text Field
    WERKS?: string; // Plant
    MENGE?: string; // Alternative Unit of Measure
    MEINS?: string; // Unit of Measure
    MENGE1?: number; // Bill of Quantity (BOM)
    MEINS1?: string; // Base Unit of Measure
    NETWR?: number; // Net Price
    DMBTR1?: number; // Sum of Amount
    EINDT?: string; // Delivery Date
    DATUM?: string; // Current Date
    LV_MENGE_SUM?: number; // Sum of Quantity
    DAYS?: number; // Days Count
    EKNAM?: string; // Description of Purchase Group
    WRBTR?: number; // Local Current Amount
    BUYER?: string; // Supplier Email ID
    CREAT?: string; // Created By
    ELIKZ?: string; // Open PO Status
    VBELN?: string; // Inbound Delivery
    POSNR?: string; // Inbound Delivery Item
    ERDAT?: string; // Inbound Created On
    MBLNR?: string; // Material Document
    BUDAT?: string; // Posting Date
    AGE?: number; // Days Taken for GR
    BELNR_MIRO?: string; // MIRO Number
    BUDAT_MIRO?: string; // MIRO Date
    XBLNR?: string; // Invoice Number
    BLDAT?: string; // Invoice Date
    VGBEL?: string; // PO
    VGPOS?: string; // PO Item
    AEDAT?: string; // PO Date
    LGORT?: string; // Storage Location
    LGOBE?: string; // Storage Location Name
    MAKTX?: string; // Material Description
    LFIMG?: number; // Quantity
    GATEENTRY?: string; // Gate Entry Number
    GATEDATE?: string; // Gate Entry Date
    AGE1?: number; // Days Taken for IBD
    BADAT?: string; // Requisition Date
    BSART?: string; // Document Type
    AFNAM?: string; // Requisitioner
    LFDAT?: string; // Delivery Date
    FRGDT?: string; // Release Date
    TOT_VAL?: number; // Total Value
    R1?: string; // IBD Done GR Pending
    R2?: string; // IBD Done GR Done
    splitCount?: number; // Number of shadow rows to split
    shadowRows?: Table[]; // Shadow rows
    BWART?: string; // Movement Type
    Batch?: string; // Batch
    PostingDate?: string; // Posting Date
    ORGQT?: number; //
    SHORT_TEXT?: string // 
}


  export interface SearchResult {
      tables: Table[];
      total: number;
  }
  