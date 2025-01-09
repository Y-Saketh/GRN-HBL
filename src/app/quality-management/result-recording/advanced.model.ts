export interface Table {
    WERKS: string;
    PRUEFLOS: string;
    MATNR: string;
    MAKTX: string;
    CHARG: string;
    EBELN: string;
    EBELP: string;
    LOSMENGE: number;
    ZZREQUES: number;
    LMENGEZUB: number;
}

export interface PeriodicElement {
    status: string;
    werk: string;
    prueflos: string;
    matnr: string;
    maktx: string;
    charg: string;
    ebeln: string;
    ebelp: string;
    losmenge: string;
    lmengezub: string;
    ZZTECH1: string;
    ZZTECH2: string;
    ZZTECH3: string;
    ZZTECH4: string;
  }
  
  export interface Lot89Row {
    INSPCHAR: string; 
    ZZPARM: string;   
    ZZSPEC: string;   // Specifications
    ZZRES?: string;   // Result (Optional, initially empty)
    Remarks?: string; // Remarks (Optional, initially empty)
    isSplit?: boolean; // Split flag to toggle split/close
    parentIndex?: number; // Optional index to track 
    isVisibleBtn:boolean;
    isMainRow?: boolean;
    duplicateInspChar:string;
  }
  
export interface SearchResult {
    tables: Table[];
    lot89: Lot89Row[];
    lot89Total: number;
    lot89RowsTotal: number;
    total: number;
  }
