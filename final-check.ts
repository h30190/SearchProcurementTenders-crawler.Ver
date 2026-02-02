import { TenderService } from './src/services/tender-service.js';

async function test() {
    const service = new TenderService();
    console.log("開始測試：搜尋「室內裝修」...");
    const result = await service.fetchAndFilterTenders("室內裝修");
    
    console.log("\n--- 抓取到的標案清單 ---");
    result.results.forEach((t, i) => {
        console.log(`[${i+1}] 案號: ${t.caseId} | 標題: ${t.title} | 預算: ${t.budget}`);
    });
    
    if (result.results.some(t => t.title.includes("更正公告") && t.title.length < 10)) {
        console.error("\n❌ 錯誤：仍然抓到只有「更正公告」標籤的標題！");
    } else if (result.results.some(t => t.caseId.includes("說明"))) {
        console.error("\n❌ 錯誤：仍然抓到說明文字列！");
    } else {
        console.log("\n✅ 成功：資料解析正確，雜訊已排除！");
    }
}

test().catch(console.error);
