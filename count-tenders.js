import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

async function count() {
    const url = "https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic?firstSearch=true&searchType=basic&isBinding=N&isLogIn=N&orgName=&orgId=&tenderName=%E5%AE%A4%E5%85%A7%E8%A3%9D%E4%BF%AE&tenderId=&tenderType=TENDER_DECLARATION&tenderWay=TENDER_WAY_ALL_DECLARATION&dateType=isSpdt&tenderStartDate=2026%2F01%2F27&tenderEndDate=2026%2F02%2F02&radProctrgCate=&policyAdvocacy=";
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            },
            responseType: 'arraybuffer'
        });
        const html = iconv.decode(response.data, 'utf-8'); // 先試 utf-8
        const $ = cheerio.load(html);
        
        let tenderCount = 0;
        let totalRows = 0;
        
        console.log("--- 逐行掃描表格 ---");
        $('table tr').each((i, el) => {
            const cols = $(el).find('td');
            if (cols.length >= 9) {
                totalRows++;
                const orgName = $(cols[1]).text().trim();
                const tenderCol = $(cols[2]);
                const tenderText = tenderCol.text().trim().replace(/\s+/g, ' ');
                
                // 模擬 parseTenderIdentity 邏輯
                const id = tenderText.split(' ')[0];
                
                // 判斷是否為真實標案
                if (id && id.length <= 40 && !id.includes('說明') && !id.includes('◎') && !orgName.includes('圖例說明')) {
                    tenderCount++;
                    console.log(`[標案 ${tenderCount}] 案號: ${id} | 機關: ${orgName.substring(0,10)}... | 內容: ${tenderText.substring(0,30)}...`);
                } else {
                    console.log(`[跳過] 內容: ${tenderText.substring(0,40)}...`);
                }
            }
        });
        
        console.log("\n--- 統計結果 ---");
        console.log(`總 TR 行數: ${$('table tr').length}`);
        console.log(`符合欄位數(>=9)的行數: ${totalRows}`);
        console.log(`最終認定的實際標案數: ${tenderCount}`);

    } catch (e) {
        console.error(e);
    }
}
count();
