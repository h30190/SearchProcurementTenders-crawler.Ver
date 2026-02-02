import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';
import { Tender, SearchParams } from '../types/tender.js';

export class WebCrawlerService {
  private readonly baseUrl = 'https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic';
  
  private readonly defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };

  /**
   * 從網頁抓取標案資料
   */
  async search(params: SearchParams): Promise<Tender[]> {
    const urlParams = new URLSearchParams({
      pageSize: '50',
      firstSearch: 'true',
      searchType: 'basic',
      isBinding: 'N',
      isLogIn: 'N',
      level_1: 'on',
      tenderName: params.tenderName,
      tenderType: params.tenderType || 'TENDER_DECLARATION',
      tenderWay: params.tenderWay || 'TENDER_WAY_ALL_DECLARATION',
      dateType: 'isSpdt',
    });

    const fullUrl = `${this.baseUrl}?${urlParams.toString()}`;

    try {
      const response = await axios.get(fullUrl, {
        headers: this.defaultHeaders,
        responseType: 'arraybuffer',
        timeout: 15000
      });

      // 處理編碼：政府網站有時用 Big5，有時用 UTF-8
      const html = this.decodeHtml(response.data, response.headers['content-type']);
      const $ = cheerio.load(html);
      const tenders: Tender[] = [];

      // 鎖定主要結果表格，避免抓到外層配置表
      // 通常主要資料在 class 為 "table_7" 或類似的 table 中，或者直接抓 tr
      // 這裡維持原有的 tr 遍歷但加上更嚴格的過濾
      $('table tr').each((_, el) => {
        const cols = $(el).find('td');
        
        // 標案列表通常有 10 欄
        if (cols.length >= 9) {
          const orgName = $(cols[1]).text().trim();
          
          // 處理標案案號與名稱欄位 (通常在第 3 欄)
          const nameCol = $(cols[2]);
          const { id, name, link } = this.parseTenderIdentity(nameCol);

          if (!name) return;

          const tenderWay = $(cols[4]).text().trim();
          const tenderType = $(cols[5]).text().trim();
          const publishDate = $(cols[6]).text().trim();
          const endDate = $(cols[7]).text().trim();
          const budgetStr = $(cols[8]).text().trim();

          tenders.push({
            id,
            name,
            orgName,
            tenderWay,
            tenderType,
            publishDate,
            endDate,
            link: link ? (link.startsWith('http') ? link : `https://web.pcc.gov.tw${link}`) : '',
            budget: this.parseBudget(budgetStr),
            source: 'web'
          });
        }
      });

      return tenders;

    } catch (error: any) {
      console.error('Web Crawler Error:', error);
      throw new Error(`網頁抓取失敗: ${error.message}`);
    }
  }

  /**
   * 處理 HTML 編碼轉換
   */
  private decodeHtml(data: Buffer, contentType?: string): string {
    // 預設先試試 UTF-8
    let html = data.toString('utf8');
    
    // 如果發現標題或內容有亂碼跡象，或者 header 指定了 Big5
    if (contentType?.toLowerCase().includes('big5') || html.includes(' charset=big5') || html.includes(' charset="big5"')) {
      return iconv.decode(data, 'big5');
    }
    
    // 檢查是否有常見的亂碼特徵 (簡單判斷)
    if (html.includes('')) {
        return iconv.decode(data, 'big5');
    }

    return html;
  }

  /**
   * 解析標案身分 (案號、名稱、連結)
   */
  private parseTenderIdentity(col: any) {
    // 移除不必要的標籤
    const tempCol = col.clone();
    tempCol.find('script, style').remove();
    
    const linkEl = tempCol.find('a');
    const link = linkEl.attr('href') || '';
    
    // 將 <br> 換成換行，方便分割案號與名稱
    tempCol.find('br').replaceWith('\n');
    
    const text = tempCol.text().trim();
    const lines = text.split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    let id = '';
    let name = '';

    if (lines.length >= 2) {
      id = lines[0];
      name = lines.slice(1).join(' ');
    } else if (lines.length === 1) {
      // 只有一行時，嘗試用正則拆分或是空格拆分
      // 案號通常是英文數字組合
      const parts = lines[0].split(/\s+/);
      if (parts.length > 1 && /^[a-zA-Z0-9-]/.test(parts[0])) {
        id = parts[0];
        name = parts.slice(1).join(' ');
      } else {
        name = lines[0];
      }
    }

    return { id, name, link };
  }

  /**
   * 解析預算金額
   */
  private parseBudget(budgetStr: string): number {
    if (!budgetStr) return 0;
    // 移除逗號
    const cleanStr = budgetStr.replace(/,/g, '');
    const budget = parseFloat(cleanStr);
    return isNaN(budget) ? 0 : budget;
  }
}