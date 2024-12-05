export interface Table {
    WERKS: string;        // Plant
    VBELN: string;        // Inbound Delivery
    POSNR: string;        // Inbound Delivery Item
    ERDAT: string;        // Inbound Created On
    VGBEL: string;        // PO
    VGPOS: string;        // PO Item
    LGORT: string;        // Storage Location
    MATNR: string;        // Material
    MAKTX: string;        // Material Description
    MEINS: string;        // Unit of Measure
    LFIMG: number;        // Quantity
    GATEENTRY: string;    // Gate Entry Number
    GATEDATE: string;     // Gate Entry Date
  
    MBLNR: string;        // Material Document
    BUDAT: string;        // Posting Date
    AGE: number;          // Days Taken for GR
    BELNR_MIRO: string;   // MIRO Number
    BUDAT_MIRO: string;   // MIRO Date
    XBLNR: string;        // Invoice Number
    BLDAT: string;        // Invoice Date
    AEDAT: string;        // PO Date
    ERNAM: string;        // Created By
    LGOBE: string;        // Storage Location Name
    AGE1: number;         // Days Taken for IBD
  }
  
  
  
  export interface SearchResult {
      tables: Table[];
      total: number;
  }
  