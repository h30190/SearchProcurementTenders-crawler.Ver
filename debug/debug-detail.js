import axios from 'axios';
import * as cheerio from 'cheerio';

async function testDetail() {
    // 這是一個範例標案連結 (若連結失效，可能需要重新抓取新的連結)
    // 這裡我們先用爬蟲抓一個最新的連結來測試
    const listUrl = "https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic?pageSize=50&firstSearch=true&searchType=basic&isBinding=N&isLogIn=N&level_1=on&tenderName=%E6%96%B0%E5%BB%BA%E5%B7%A5%E7%A8%8B&tenderType=TENDER_DECLARATION&tenderWay=TENDER_WAY_ALL_DECLARATION&dateType=isSpdt";
    
    try {
        console.log("1. 取得最新標案列表以獲取測試連結...");
        const listRes = await axios.get(listUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $list = cheerio.load(listRes.data);
        
        let targetLink = '';
        let targetName = '';

        const rows = $list('table tr');
        for (let i = 1; i < rows.length; i++) {
            const cols = $list(rows[i]).find('td');
            const link = $list(cols[2]).find('a').attr('href');
            if (link) {
                targetLink = `https://web.pcc.gov.tw${link}`;
                targetName = $list(cols[2]).text().trim();
                break;
            }
        }

        if (!targetLink) {
            console.log("找不到任何標案連結");
            return;
        }

        console.log(`2. 測試抓取內頁: ${targetName}`);
        console.log(`   URL: ${targetLink}`);

        const detailRes = await axios.get(targetLink, { 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000 
        });
        const html = detailRes.data; // axios auto handles utf-8 usually, but let's check
        const $ = cheerio.load(html);

        // 尋找預算金額
        // 通常在 th 包含 "預算金額" 的下一個 td
        let budget = "未找到";
        
        // 遍歷所有 th 尋找關鍵字
        $('th').each((i, el) => {
            const text = $(el).text().trim();
            if (text.includes("預算金額")) {
                const value = $(el).next('td').text().trim();
                if (value) {
                    budget = value;
                }
            }
        });

        console.log(`\n=== 解析結果 ===`);
        console.log(`預算金額: ${budget}`);

    } catch (e) {
        console.error(e);
    }
}

testDetail();
