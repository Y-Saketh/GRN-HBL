export interface Table {
    selected: any; // Optional: Indicates whether the row is selected
    BELNR: string; // Document Number of an Invoice Document
    GJAHR: number; // Fiscal Year
    BUDAT: string; // Posting Date in the Document
    WERKS: string; // Plant
    CREDIT: string; // Credit Memo no
    // STATUS: string; // Credit Status
    VEHICAL: string; // Vehicle No
    TRANS: string; // Transporter name
    LRNO: string; // LR Number
    LRDATE: string; // LR Date
    GROSS: number; // Gross
    NET: number; // Net
    REASON: string; // Reason for Rejection
    SEL: string; // Single-Character Flag
    BUDAT_F: string; // Posting Date in the Document (From)
    BUDAT_T: string; // Posting Date in the Document (To)
}

export interface SearchResult {
    tables: Table[];
    total: number;
}
