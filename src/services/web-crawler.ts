import axios from 'axios';
import * as cheerio from 'cheerio';
import { Tender, SearchParams } from '../types/tender.js';

export class WebCrawlerService {
  private readonly baseUrl = 'https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic';

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
      // tenderStartDate & tenderEndDate are not needed when dateType is 'isSpdt'
    });

    const fullUrl = `${this.baseUrl}?${urlParams.toString()}`;

    try {
      const response = await axios.get(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        responseType: 'arraybuffer', // 為了正確處理編碼
        timeout: 15000
      });

      // 嘗試處理可能的編碼問題，如果網站是 UTF-8 就直接轉
      const html = Buffer.from(response.data).toString('utf-8');
      const $ = cheerio.load(html);
      const tenders: Tender[] = [];

      // 解析表格
      $('table tr').each((i, el) => {
        const cols = $(el).find('td');
        // 政府網站的資料列通常有 10 欄
        if (cols.length >= 9) {
          let orgName = $(cols[1]).text().trim();
          
          // 處理標案名稱欄位 (cols[2])
          const col2 = $(cols[2]);
          col2.find('script, style').remove();
          
          // 將 <br> 替換為換行符，以便區分
          col2.find('br').replaceWith('\n');
          
          let fullText = col2.text().trim();

          const tenderLink = col2.find('a').attr('href');
          const tenderWay = $(cols[4]).text().trim(); // 招標方式
          const publishDate = $(cols[6]).text().trim(); // 公告日期
          const endDate = $(cols[7]).text().trim(); // 截止投標
          const budget = $(cols[8]).text().trim(); // 預算金額

          // 將多餘的空白壓縮，但保留換行作為分隔符
          const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

          let id = '';
          let name = '';

          if (lines.length >= 2) {
              // 假設第一行是案號 (可能包含更正公告狀態)，第二行是名稱
              id = lines[0];
              name = lines.slice(1).join(' ');
          } else if (lines.length === 1) {
              // 只有一行，嘗試用空白分割
              const parts = lines[0].split(/\s+/);
              // 如果第一段看起來像案號 (包含數字或英文)
              if (parts[0].match(/[0-9A-Za-z-]/)) {
                   id = parts[0];
                   name = parts.slice(1).join(' ');
              } else {
                   name = lines[0];
              }
          }

          if (name) {
            tenders.push({
              id,
              name,
              orgName,
              tenderWay,
              tenderType: $(cols[5]).text().trim(), // 招標類別 (工程/財物/勞務)
              publishDate,
              endDate,
              link: tenderLink ? `https://web.pcc.gov.tw${tenderLink}` : '',
              budget: budget ? parseFloat(budget.replace(/,/g, '')) || 0 : 0,
              source: 'web'
            });
          }
        }
      });

      return tenders;

    } catch (error: any) {
      console.error('Web Crawler Error:', error);
      throw new Error(`網頁抓取失敗: ${error.message}`);
    }
  }
}
