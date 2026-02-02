import { WebCrawlerService } from './web-crawler.js';
import { SearchParams, Tender } from '../types/tender.js';
import { parseROCDate, getRemainingDays, calculateTenderPeriod } from '../utils/date.js';

export class TenderService {
  private crawler = new WebCrawlerService();

  /**
   * 標案查詢：僅使用 Web Crawler 確保資料最即時且直接來自官網
   */
  async fetchAndFilterTenders(keyword: string) {
    try {
      console.log(`[Crawler] 正在從政府採購網查詢: ${keyword}`);
      
      const crawlerParams: SearchParams = {
        tenderName: keyword,
        startDate: '',
        endDate: ''
      };

      const webResults = await this.crawler.search(crawlerParams);
      
      const results = webResults.map(t => this.formatTender(t));

      return { 
        results, 
        hasMore: false, 
        source: 'web' 
      };

    } catch (error: any) {
      console.error(`[Crawler Error] 查詢失敗: ${error.message}`);
      throw new Error(`無法從政府採購網取得資料: ${error.message}`);
    }
  }

  /**
   * 格式化標案資料，計算日期差等資訊
   */
  private formatTender(t: Tender) {
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
      source: t.source || 'web'
    };
  }
}

// 導出實例
const service = new TenderService();
export const fetchAndFilterTenders = (keyword: string) => service.fetchAndFilterTenders(keyword);
