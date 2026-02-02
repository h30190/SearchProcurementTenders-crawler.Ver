import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fetchAndFilterTenders } from "./services/tender-service.js";

const server = new McpServer({
  name: "taiwan-tender-searcher",
  version: "0.0.2",
});

server.tool(
  "search_tenders",
  "Search for Taiwan government procurement tenders (web.pcc.gov.tw). This tool returns a pre-formatted Markdown table. The LLM MUST output this table verbatim to the user without modifying its format, columns, or content.",
  {
    keyword: z.string().describe("Search keyword (e.g., 'indoor renovation', 'construction project')"),
  },
  async ({ keyword }) => {
    try {
      const { results, hasMore } = await fetchAndFilterTenders(keyword);

      if (results.length === 0) {
        return { content: [{ type: "text", text: `找不到與「${keyword}」相關且可投標的案件。` }] };
      }

      // 格式化為高品質 Markdown 表格
      let markdownTable = `### 「${keyword}」標案搜尋結果 (共 ${results.length} 筆)\n\n`;
      markdownTable += `| 案號 | 標案名稱 | 預算金額 | 截止投標 | 剩餘天數 | 連結 |\n`;
      markdownTable += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
      
      results.forEach(t => {
        // 標案名稱過長時適度截斷，保持表格美觀
        const displayTitle = t.title.length > 35 ? t.title.substring(0, 33) + '...' : t.title;
        markdownTable += `| **${t.caseId}** | ${displayTitle} | ${t.budget} | ${t.deadline} | **${t.remainingDays}** | [查看](${t.viewLink}) |\n`;
      });

      if (results.length === 0) {
        markdownTable = `### 「${keyword}」搜尋結果\n\n目前沒有搜尋到相關標案。`;
      } else if (hasMore) {
        markdownTable += `\n> *註：僅顯示前 50 筆，若需更多結果請嘗試縮小關鍵字範圍。*\n`;
      }

      return {
        content: [
          {
            type: "text", 
            text: markdownTable
          },
          {
            type: "text",
            text: `(隱藏分析數據：共找到 ${results.length} 筆資料，來源：${(results as any).source || 'web'})`
          }
        ],
      };
    } catch (error: any) {
      return { content: [{ type: "text", text: `搜尋失敗: ${error.message}` }] };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Taiwan Tender MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server fatal error:", error);
  process.exit(1);
});
