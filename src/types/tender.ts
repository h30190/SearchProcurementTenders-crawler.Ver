export interface Tender {
  /** 標案案號 */
  id: string;
  /** 標案名稱 */
  name: string;
  /** 機關名稱 */
  orgName: string;
  /** 剩餘天數 (截止 - 現在) */
  remainingDays?: string;
  /** 等標期 (截止 - 公告) */
  tenderPeriod?: string;
  /** 招標方式 */
  tenderWay: string;
  /** 招標類型 */
  tenderType: string;
  /** 公告日期 */
  publishDate: string;
  /** 截止投標日期 */
  endDate: string;
  /** 預算金額 */
  budget?: number;
  /** 標案連結 */
  link: string;
  /** 檢視連結 (通常同 link) */
  viewLink?: string;
  /** 來源 (API 或 Web) */
  source?: 'api' | 'web';
}

export interface SearchParams {
  tenderName: string;
  startDate: string; // YYYY/MM/DD
  endDate: string;   // YYYY/MM/DD
  tenderType?: string;
  tenderWay?: string;
}
