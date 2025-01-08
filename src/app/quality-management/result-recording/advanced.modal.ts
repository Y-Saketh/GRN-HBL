export interface Table {
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

  isSaved: boolean;
  isEditing: boolean;
  INSPOPER:string;
  duplicatedINSPCHAR:any,
  originalINSPCHAR: number;
  INSPCHAR: any;
  KATAB1: string;
  CODE:string;
  CODE_1:string;
  KURZTEXT: string;
  TOLGRENZE: string;
  SOLLSTPUMF: number;
  result: string;
  AUSWMENGE1: string; 
  BEWERTUNG: string;  
  remarks:string;
  REMARK:string;
  CODEGRUPPE: string;
  isMainRow: boolean;
  isDuplicated: boolean;
  isVisible?: boolean;
  CODE_DESP_1:string;
  CODE_DESP:string;
  BEWERTUNG_1:string;
  NONCONF:string;
  MEAN_VALUE:string;
  isGreyedOut?: boolean; 
  RES_NO:string;
  RES_VALUE:string;
  RES_VALUAT:string;
  INSPECTOR:string;
  CODE1:string;
  CODE_GRP1:string;
  ORIGINAL_INPUT:string;
  REMARKS:string;
  RESVAL:string;

  ZZPARM: string;   
  ZZSPEC: string;   // Specifications
  ZZRES?: string;   // Result (Optional, initially empty)
  Remarks?: string; // Remarks (Optional, initially empty)
  isSplit?: boolean; // Split flag to toggle split/close
  parentIndex?: number; // Optional index to track 
  isVisibleBtn:boolean;
  duplicateInspChar:string;
}
  
export interface SearchResult {
    tables: Table[];
    total: number;
  }