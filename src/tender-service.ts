import { WebCrawlerService } from './services/web-crawler.js';
import { SearchParams } from './types/tender.js';

function parseROCDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === "-") return null;
  const match = dateStr.match(/(\d+)\/(\d+)\/(\d+)(?:\s+(\d+):(\d+))?/);
  if (!match) return null;
  const year = parseInt(match[1]) + 1911;
  const month = parseInt(match[2]) - 1;
  const day = parseInt(match[3]);
  const hour = match[4] ? parseInt(match[4]) : 0;
  const minute = match[5] ? parseInt(match[5]) : 0;
  return new Date(year, month, day, hour, minute);
}

function getRemainingDays(deadline: Date): string {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const totalHours = diff / (1000 * 60 * 60);
  const days = Math.floor(totalHours / 24);
  if (diff < 0) return "已截止";
  if (days === 0 && totalHours > 0) return "今日截止";
  return `${days} 天`;
}

function calculateTenderPeriod(startDate: Date, endDate: Date): string {
  const diff = endDate.getTime() - startDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return `${days} 天`;
}

export class TenderService {
  private crawler = new WebCrawlerService();

  /**
   * 標案查詢：僅使用 Web Crawler 確保資料最即時且直接來自官網
   */
  async fetchAndFilterTenders(keyword: string) {
    try {
      console.log(`[Crawler] 正在從政府採購網查詢: ${keyword}`);
      
      // 使用 isSpdt (等標期內) 查詢，獲取所有未截止案件
      const crawlerParams: SearchParams = {
        tenderName: keyword,
        startDate: '',
        endDate: ''
      };

      const webResults = await this.crawler.search(crawlerParams);
      
      const results = webResults.map(t => {
        let remainingDays = "-";
        let tenderPeriod = "-";
        
        const deadlineDate = parseROCDate(t.endDate);
        const publishDate = parseROCDate(t.publishDate);

        if (deadlineDate) {
          remainingDays = getRemainingDays(deadlineDate);
        }
        
        if (deadlineDate && publishDate) {
          tenderPeriod = calculateTenderPeriod(publishDate, deadlineDate);
        }

        return {
          publishDate: t.publishDate,
          deadline: t.endDate,
          tenderPeriod,
          remainingDays,
          type: `${t.tenderWay} (${t.tenderType})`,
          caseId: t.id,
          title: t.name,
          budget: (t.budget ?? 0) > 0 ? t.budget!.toLocaleString() : "未提供或需登入",
          link: t.link,
          viewLink: t.link,
          source: 'web'
        };
      });

      return { results, hasMore: false, source: 'web' };

    } catch (error: any) {
      console.error(`[Crawler Error] 查詢失敗: ${error.message}`);
      throw new Error(`無法從政府採購網取得資料: ${error.message}`);
    }
  }
}

// 導出實例
const service = new TenderService();
export const fetchAndFilterTenders = (keyword: string) => service.fetchAndFilterTenders(keyword);