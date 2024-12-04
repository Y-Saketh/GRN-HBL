export interface Table {
    CLOSE: string;
    BANFN: string; // Purchase Requisition
    BNFPO: number; // Item
    BADAT: string; // Requisition Date
    BSART: string; // Document Type
    EKGRP: string; // Purchase Group
    MATNR: string; // Material Number
    WERKS: string; // Plant
    MENGE: number; // Quantity Requested
    MEINS: string; // UOM
    LOEKZ: string; // Deletion Indicator
    AFNAM: string; // Requisitioner
    TXZ01: string; // Short Text
    LFDAT: string; // Delivery Date
    FRGDT: string; // Release Date
    TOT_VAL: string; // Total Value
    AGE: number; // Pending Days
  }
  
  export interface SearchResult {
    tables: Table[];
    total: number;
  }
  