import axios from 'axios';
import * as cheerio from 'cheerio';

async function checkNewConstruction() {
    const baseUrl = "https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic";
    const params = new URLSearchParams({
        pageSize: '50',
        firstSearch: 'true',
        searchType: 'basic',
        isBinding: 'N',
        isLogIn: 'N',
        level_1: 'on',
        tenderName: '新建工程',
        tenderType: 'TENDER_DECLARATION',
        tenderWay: 'TENDER_WAY_ALL_DECLARATION',
        dateType: 'isSpdt',
        tenderStartDate: '',
        tenderEndDate: ''
    });

    try {
        const response = await axios.get(`${baseUrl}?${params.toString()}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            responseType: 'arraybuffer'
        });
        
        const html = Buffer.from(response.data).toString('utf-8');
        const $ = cheerio.load(html);
        
        const tenders = [];
        $('table tr').each((i, el) => {
             if (i === 0) return;
             const cols = $(el).find('td');
             if (cols.length > 5) {
                 tenders.push({
                     org: $(cols[1]).text().trim(),
                     name: $(cols[2]).text().trim().split('\n')[0], // 簡化名稱
                     date: $(cols[4]).text().trim()
                 });
             }
        });

        console.log(`\n=== 查詢結果: 新建工程 ===`);
        console.log(`目前「等標期內」總筆數: ${tenders.length} (頁面顯示上限 50 筆)`);
        console.log(`--- 前 5 筆預覽 ---`);
        tenders.slice(0, 5).forEach((t, i) => {
            console.log(`[${i+1}] ${t.org} - ${t.name}`);
        });

    } catch (e) {
        console.error('查詢失敗:', e.message);
    }
}

checkNewConstruction();
