import axios from 'axios';
import * as cheerio from 'cheerio';

async function testCrawler() {
    const url = "https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic?pageSize=50&firstSearch=true&searchType=basic&isBinding=N&isLogIn=N&level_1=on&orgName=&orgId=&tenderName=%E5%AE%A4%E5%85%A7%E8%A3%9D%E4%BF%AE&tenderId=&tenderType=TENDER_DECLARATION&tenderWay=TENDER_WAY_ALL_DECLARATION&dateType=isSpdt&tenderStartDate=2026%2F01%2F27&tenderEndDate=2026%2F02%2F02&radProctrgCate=&policyAdvocacy=";

    console.log('正在抓取網頁資料...');

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const tenders: any[] = [];

        // 觀察網頁結構，標案資料通常在 id 為 "print_area" 內的表格中
        // 我們抓取表格中的每一行 (tr)
        $('table tr').each((i, el) => {
            // 跳過標題行
            if (i === 0) return;

            const cols = $(el).find('td');
            if (cols.length > 5) {
                const orgName = $(cols[1]).text().trim();
                const tenderNameAndId = $(cols[2]).text().trim();
                const tenderLink = $(cols[2]).find('a').attr('href');
                const tenderWay = $(cols[3]).text().trim();
                const date = $(cols[4]).text().trim();

                // 處理標案名稱與編號（通常混在一起）
                // 網頁上通常是 [標案案號] 標案名稱
                const nameMatch = tenderNameAndId.match(/\[(.*?)\]\s*(.*)/);
                const tenderId = nameMatch ? nameMatch[1] : '';
                const tenderName = nameMatch ? nameMatch[2] : tenderNameAndId;

                tenders.push({
                    id: tenderId,
                    name: tenderName,
                    org: orgName,
                    method: tenderWay,
                    date: date,
                    link: tenderLink ? `https://web.pcc.gov.tw${tenderLink}` : ''
                });
            }
        });

        console.log(`成功抓取到 ${tenders.length} 筆標案：`);
        tenders.slice(0, 5).forEach((t, idx) => {
            console.log(`--- [${idx + 1}] ---`);
            console.log(`標案名稱: ${t.name}`);
            console.log(`機關名稱: ${t.org}`);
            console.log(`招標方式: ${t.method}`);
            console.log(`公告日期: ${t.date}`);
            console.log(`連結: ${t.link}`);
        });

        if (tenders.length === 0) {
            console.log('警告：抓取到 0 筆資料，可能選擇器 (Selector) 需要調整。');
            // 印出部分 HTML 結構以供偵錯
            console.log('HTML 結構片段：', $('table').html()?.substring(0, 1000));
        }

    } catch (error) {
        console.error('抓取失敗:', error.message);
    }
}

testCrawler();
