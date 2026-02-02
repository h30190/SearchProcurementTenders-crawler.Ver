# Taiwan Tender MCP Server (台灣標案查詢工具)

這是一個基於 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 的伺服器，讓 LLM (如 Claude) 能夠直接查詢 **台灣政府電子採購網 (web.pcc.gov.tw)** 的即時標案資訊。

## 特色

- **官網直接介接**：採用爬蟲技術直接抓取政府官網資料，確保資訊最即時。
- **等標期智慧查詢**：自動搜尋「等標期內」(尚未截止) 的案件。
- **智慧編碼處理**：自動辨識並處理政府網站的 Big5 與 UTF-8 編碼，杜絕亂碼。
- **完整欄位解析**：精準解析案號、案名、預算金額、公告日、截止日、等標期、剩餘天數。
- **JSON 回傳**：專為 LLM 優化的資料結構，方便進行後續分析。

## 專案結構

- `src/index.ts`: MCP 伺服器入口與工具定義。
- `src/services/`: 存放爬蟲邏輯與標案業務處理。
- `src/utils/`: 存放日期解析與計算等工具函數。
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

### 3. 設定 MCP 客戶端
將以下配置加入您的 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "taiwan-tender": {
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

## 免責聲明

本工具僅供個人查詢輔助、學術研究或技術展示使用。資料來源為「政府電子採購網」，資料之正確性與版權歸屬原發布機關。請遵守相關網站使用規範，勿進行大規模惡意爬取。

## License
MIT