export interface Table {
    MAT_DOC: string;           // Material Document
    MAT_DOC_YEAR: string;      // Material Doc. Year
    TRANS_EVENT_TYPE: string;  // Trans./Event Type
    DOC_TYPE: string;          // Document Type
    DOC_TYPE_REVAL: string;    // Doc. Type Reval
    DOC_DATE: string;          // Document Date
    POSTING_DATE: string;      // Posting Date
    ENTRY_DATE: string;        // Entry Date
    ENTRY_TIME: string;        // Time of Entry
    CHANGED_ON: string;        // Changed On
    USER_NAME: string;         // User Name
    AREA: string;              // Area
    REFERENCE: string;         // Reference
    HEADER_TEXT: string;       // Document Header Text
    DEL_COSTS: number;         // Unpl. Del. Costs
    BILL_OF_LADING: string;    // Bill of Lading
    PRINT_VERSION: string;     // Print Version
    GR_ISSUE_SLIP: string;     // Goods Receipt/Issue Slip
    LOGICAL_SYSTEM: string;    // Logical System
    DOC_TYPE_ADD: string;      // Doc. Type Add.
    TRANSACTION_CODE: string;  // Transaction Code
    EXT_WMS_CONTROL: string;   // Ext. WMS Control
    FOREIGN_DATA_NUM: number;  // Foreign Data Num
    GI_TIME: number;           // Goods Issue Time
    TIME_ZONE: string;         // Time Zone
    DELIVERY: string;          // Delivery
    LOGICAL_SYSTEM_EWM: string; // Logical System EWM
    MAT_DOC_EWM: string;       // Material Document EWM
    CUSTOMS_REF_NUM: string;   // Customs Reference Number
    ENH_STORE_RETURN: string;  // Enh. Store Return
    ADV_RETURNS_ACTIVE: string; // Adv. Returns Active
    DOC_CONDITION_NO: number;  // Doc. Condition No.
    CANCEL_IN_FULL: string;    // Cancel in Full
}
  
  
export interface SearchResult {
    tables: Table[];
    total: number;
  }
  
  