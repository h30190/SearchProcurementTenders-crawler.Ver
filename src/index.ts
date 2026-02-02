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
  "搜尋台灣政府採購網標案 (web.pcc.gov.tw)。支援『等標期內』即時查詢，回傳案號、預算、等標期、截止日等 JSON 數據。本工具僅供個人或學術查詢輔助使用，資料版權屬原發布機關所有。",
  {
    keyword: z.string().describe("搜尋關鍵字 (例如：室內裝修、新建工程)"),
  },
  async ({ keyword }) => {
    try {
      const { results, hasMore } = await fetchAndFilterTenders(keyword);

      if (results.length === 0) {
        return { content: [{ type: "text", text: `找不到與「${keyword}」相關且可投標的案件。` }] };
      }

      // 直接回傳 JSON 格式，讓 LLM 自行決定如何呈現
      const responseData = {
        keyword,
        count: results.length,
        hasMore,
        source: (results as any).source || 'unknown', // 標記資料來源 (api/web)
        tenders: results.map(t => ({
          publishDate: t.publishDate,
          deadline: t.deadline,
          tenderPeriod: t.tenderPeriod,   // 截止 - 公告
          remainingDays: t.remainingDays, // 截止 - 現在
          type: t.type,
          caseId: t.caseId,
          title: t.title,
          budget: t.budget,
          viewLink: (t as any).viewLink || t.link
        }))
      };

      return {
        content: [
          {
            type: "text", 
            text: JSON.stringify(responseData, null, 2)
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
