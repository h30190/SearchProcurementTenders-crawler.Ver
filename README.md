# Taiwan Tender MCP (爬蟲增強版)

![Version](https://img.shields.io/badge/version-v0.0.2-blue.svg)

基於 MCP 協定的台灣標案自動化查詢工具，直接介接政府電子採購網官網，提供最即時、精確且高品質的標案情報。

---

## 核心特色 (Key Features)
- **官網直接介接**: 採用增強型爬蟲技術直接抓取 [政府電子採購網](https://web.pcc.gov.tw/)，確保資料與官網同步，無 API 延遲。
- **智慧解析技術**: 
  - **編碼自動偵測**：智慧辨識並處理官網常見的 Big5 與 UTF-8 編碼，杜絕亂碼。
- **高品質預格式化**: 在 Node.js 端即時生成美化的 Markdown 表格報告，確保 AI (如 Claude) 呈現給使用者的格式穩定且易讀。
- **智慧邏輯運算**: 自動計算「等標期 (公告至截止)」與「剩餘天數 (今日至截止)」，方便使用者快速判斷急迫性。
- **AI 整合**: 作為 Model Context Protocol (MCP) 伺服器，讓 AI 能直接理解並分析台灣最新標案趨勢。

## 技術架構 (Technical Architecture)
- **Runtime**: Node.js (v20+)
- **Protocol**: Model Context Protocol (MCP)
- **Data Source**: 
  - 來源：[政府電子採購網 (web.pcc.gov.tw)](https://web.pcc.gov.tw/)
  - 方法：自動化網頁解析 (Web Scraping via Cheerio & Axios)
- **篩選邏輯**:
  1. **等標期內查詢**：預設僅抓取「尚未截止」的可投標案件。
  2. **雜訊過濾**：自動識別並跳過網頁中的圖例說明、注意事項等非標案列。
  3. **欄位標準化**：精準提取案號、案名、預算金額、公告日、截止日。
  4. **鏈結還原**：自動補全標案詳細頁面之絕對路徑網址。

## 部署與安裝 (Deployment & Setup)

### 1. 環境準備
- 安裝 [Node.js](https://nodejs.org/) (v20 或以上版本)。
- 確認已安裝 `npm`。

### 2. 下載與編譯 (Build)
```bash
# 進入專案目錄
npm install
npm run build
```

### 3. 設定 AI 客戶端 (Configure Client)
本服務為本機運行的 MCP Server，請將其加入 AI 客戶端（以 Claude Desktop 為例）。

找到 Claude Desktop 的設定檔 `claude_desktop_config.json`：
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

將以下內容加入 `mcpServers` 區塊（請將路徑修改為您本機的**絕對路徑**）：

```json
{
  "mcpServers": {
    "taiwan-tender-crawler": {
      "command": "node",
      "args": [
        "C:/Users/[您的使用者名稱]/.../SearchProcurementTenders-crawler.Ver/build/index.js"
      ]
    }
  }
}
```
*注意：Windows 路徑建議使用正斜線 `/` 避免 JSON 格式錯誤。*

## 使用範例 (Usage Examples)
您可以對 AI 說：
- 「幫我找關於『室內裝修』的標案。」
- 「最近有哪些『新建工程』的標案快截止了？」
- 「列出預算金額超過 100 萬的標案。」

## 關於作者 (About the Author)
- **作者**: 加號設計數位工程有限公司 HJPLUS.DESIGN
- **網站**: [加號設計數位工程有限公司](https://hjplus.design)
- **粉絲專頁**: [加號設計數位工程有限公司](https://www.facebook.com/hjplus.design)
- **電子郵件**: [info@hjplusdesign.com](mailto:info@hjplusdesign.com)

我們是設計、建築與製造產業的外部研發夥伴，專門協助缺乏內部技術團隊的公司導入數位工作流程、工具與 AI，自動化你的知識與作業流程，以補足團隊技能升級的能量。我們專門解決以下情況：

- **技術缺口**：團隊中沒技術人員或團隊，卻需要自動化或資料串接。
- **整合困難**：專案複雜、資料格式多，但缺乏整合經驗。
- **轉型迷惘**：想導入 AI 或 BIM，但不知道從哪開始。
- **研發支援**：需要專案型的數位顧問或工具開發支援。

更多數位轉型諮詢與服務內容歡迎與我們聯絡。

## 授權與宣告 (License & Disclaimer)
- **免責聲明**：本工具僅供個人查詢輔助、學術研究或技術展示使用。資料內容以「政府電子採購網」官方公告為準。使用者在進行投標決定前，應自行核實資料的準確性與時效性，開發者不對因使用本工具資料而產生的任何損失負責。嚴禁將本工具用於任何形式的惡意爬取或違反相關法律之行為。
- **授權條款**：本專案採用 [MIT License](./LICENSE) 開源授權。
- **版權所有**：Copyright (c) 2026 加號設計數位工程有限公司 (HJPLUS.DESIGN Ltd.)。