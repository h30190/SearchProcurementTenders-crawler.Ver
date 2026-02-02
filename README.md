# Taiwan Tender MCP Server (台灣標案查詢工具)

這是一個基於 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 的伺服器，讓 LLM (如 Claude) 能夠直接查詢 **台灣政府電子採購網 (web.pcc.gov.tw)** 的即時標案資訊。

## 特色

- **官網直接介接**：採用爬蟲技術直接抓取政府官網資料，確保資訊最即時。
- **等標期智慧查詢**：自動搜尋「等標期內」(尚未截止) 的案件。
- **智慧編碼與解析**：自動處理 Big5 編碼，並破解 JavaScript 混淆以提取正確的標案名稱。
- **即時格式化**：直接輸出美化的 Markdown 表格，讓 LLM 能夠原封不動地呈現精確結果。
- **完整欄位**：包含案號、案名、預算金額、公告日、截止日、剩餘天數。

## 專案結構

- `src/index.ts`: MCP 伺服器入口、工具定義與表格格式化邏輯。
- `src/services/`: 核心服務層，包含 `web-crawler.ts` (爬蟲) 與 `tender-service.ts` (業務邏輯)。
- `src/utils/`: 工具類，如日期解析 `date.ts`。
- `src/types/`: TypeScript 型別定義。

## 安裝與執行

### 1. 安裝依賴
```bash
npm install
```

### 2. 編譯
```bash
npm run build
```

### 3. 設定 MCP 客戶端 (Claude Desktop)
將以下配置加入您的 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "taiwan-tender-crawler": {
      "command": "node",
      "args": [
        "C:/您的路徑/SearchProcurementTenders-crawler.Ver/build/index.js"
      ]
    }
  }
}
```

## 使用範例

您可以對 Claude 說：
- 「幫我找關於『室內裝修』的標案。」
- 「最近有哪些『新建工程』的標案快截止了？」
- 「列出預算金額超過 100 萬的採購案。」

## 免責聲明 (Disclaimer)

### 1. 資料來源與準確性
本工具所提供的資料均抓取自「政府電子採購網 (web.pcc.gov.tw)」。儘管本工具盡力確保資料解析的正確性，但網頁結構變動或網路傳輸可能導致資料缺失、延遲或錯誤。**所有資訊應以政府電子採購網官方公告為準。**

### 2. 使用目的
本工具僅供**個人查詢輔助、學術研究或技術開發展示使用**。嚴禁將本工具用於任何形式的惡意爬取、商業牟利、干擾政府網站運作或違反相關法律之行為。

### 3. 法律責任
使用者須自行承擔使用本工具所產生的一切風險。開發者對於因使用本工具而導致的任何直接或間接損失（包括但不限於錯失投標機會、法律訴訟等）概不負責。

### 4. 版權說明
標案內容之版權均屬原發布機關所有。本工具僅作為資訊檢索之媒介，不對資料內容擁有任何權利。

---

## 更新日誌
詳見 [CHANGELOG.md](./CHANGELOG.md)

## License
MIT
