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
}

export interface SearchResult {
    tables: Table[];
    total: number;
  }
