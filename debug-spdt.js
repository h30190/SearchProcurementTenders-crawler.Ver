import axios from 'axios';
import * as cheerio from 'cheerio';

async function testSpdt() {
    // 測試：只用 isSpdt (等標期內)，不帶 start/end date
    const baseUrl = "https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic";
    const params = new URLSearchParams({
        pageSize: '50',
        firstSearch: 'true',
        searchType: 'basic',
        isBinding: 'N',
        isLogIn: 'N',
        level_1: 'on',
        tenderName: '室內裝修', // 測試關鍵字
        tenderType: 'TENDER_DECLARATION',
        tenderWay: 'TENDER_WAY_ALL_DECLARATION',
        dateType: 'isSpdt', 
        // 故意留空日期試試看
        tenderStartDate: '',
        tenderEndDate: ''
    });

    const url = `${baseUrl}?${params.toString()}`;
    console.log(`Testing URL: ${url}`);

    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            responseType: 'arraybuffer'
        });
        
        const html = Buffer.from(response.data).toString('utf-8');
        const $ = cheerio.load(html);
        
        let count = 0;
        $('table tr').each((i, el) => {
             if (i === 0) return;
             const cols = $(el).find('td');
             if (cols.length > 5) {
                 const date = $(cols[4]).text().trim(); // 公告日期
                 console.log(`Found tender, Publish Date: ${date}`);
                 count++;
             }
        });

        console.log(`Total found: ${count}`);

    } catch (e) {
        console.error(e);
    }
}

testSpdt();
