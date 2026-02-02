import axios from 'axios';
import * as cheerio from 'cheerio';

async function inspect() {
    const url = "https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic?pageSize=50&firstSearch=true&searchType=basic&isBinding=N&isLogIn=N&level_1=on&tenderName=%E6%96%B0%E5%BB%BA%E5%B7%A5%E7%A8%8B&tenderType=TENDER_DECLARATION&tenderWay=TENDER_WAY_ALL_DECLARATION&dateType=isSpdt";
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, responseType: 'arraybuffer' });
        const html = Buffer.from(response.data).toString('utf-8');
        const $ = cheerio.load(html);
        console.log("HEADERS:");
        $('table th').each((i, el) => console.log(`${i}: ${$(el).text().trim()}`));
        console.log("\nROW 1:");
        $('table tr').eq(1).find('td').each((i, el) => console.log(`${i}: ${$(el).text().trim().replace(/\s+/g, ' ')}`));
    } catch (e) { console.error(e); }
}
inspect();
