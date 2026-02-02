/**
 * 解析民國日期字串 (例如: 112/01/01 10:00) 為 JavaScript Date 物件
 */
export function parseROCDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === "-" || dateStr.trim() === "") return null;
  
  // 匹配 112/01/01 或 112/01/01 10:00
  const match = dateStr.match(/(\d+)\/(\d+)\/(\d+)(?:\s+(\d+):(\d+))?/);
  if (!match) return null;
  
  const year = parseInt(match[1]) + 1911;
  const month = parseInt(match[2]) - 1;
  const day = parseInt(match[3]);
  const hour = match[4] ? parseInt(match[4]) : 0;
  const minute = match[5] ? parseInt(match[5]) : 0;
  
  return new Date(year, month, day, hour, minute);
}

/**
 * 計算剩餘天數
 */
export function getRemainingDays(deadline: Date): string {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  
  if (diff < 0) return "已截止";
  
  const totalHours = diff / (1000 * 60 * 60);
  const days = Math.floor(totalHours / 24);
  
  if (days === 0 && totalHours > 0) return "今日截止";
  
  return `${days} 天`;
}

/**
 * 計算標案公告期間
 */
export function calculateTenderPeriod(startDate: Date, endDate: Date): string {
  const diff = endDate.getTime() - startDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return `${days} 天`;
}
