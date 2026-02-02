# 更新說明 (Changelog)

本文件記錄 Taiwan Tender MCP 的變更細節。

## [0.0.2] - 2026-02-02

### 結構優化 (Refactoring)
- 重構專案架構，將爬蟲邏輯、業務邏輯與工具函數分離至 `services` 與 `utils` 目錄。
- 統一日期處理邏輯，建立 `src/utils/date.ts`。

### 爬蟲功能增強 (Crawler Improvements)
- **編碼修復**：引入 `iconv-lite` 自動處理政府網站的 Big5 編碼問題，修正搜尋結果亂碼。
- **解析優化**：改進標案案號與案名的拆分邏輯，提升抓取成功率。
- **Header 模擬**：優化瀏覽器 Header 模擬，降低被網站攔截的風險。

### 其他變更 (Other Changes)
- 修正 TypeScript 在 strict 模式下的型別錯誤。
- 清理根目錄，將測試腳本移至 `debug/` 資料夾。
- 更新版本號至 0.0.2 並同步 MCP Server 版本資訊。

## [0.0.1] - 2026-01-28

### 新功能 (Added)
- 初始版本：支援基本爬蟲搜尋與 MCP 工具介接。

---
*最後編輯: 2026-02-02*