import { fetchAndFilterTenders } from './src/tender-service.js';

async function test() {
    console.log('--- 開始測試：搜尋「室內裝修」 ---');
    try {
        const result = await fetchAndFilterTenders('室內裝修');
        
        // 模擬 index.ts 中的 JSON 轉換邏輯
        const responseData = {
            count: result.results.length,
            source: result.source,
            tenders: result.results.map(t => ({
                publishDate: t.publishDate,
                deadline: t.deadline,
                tenderPeriod: (t as any).tenderPeriod,
                remainingDays: (t as any).remainingDays,
                type: t.type,
                caseId: t.caseId,
                title: t.title,
                budget: t.budget,
                viewLink: (t as any).viewLink || t.link
            }))
        };

        console.log(JSON.stringify(responseData, null, 2));
    } catch (e) {
        console.error('測試發生錯誤:', e);
    }
}

test();
