# HamHam-Solo - 伺服器免登入個人書籤系統

HamHam-Solo 是一個專為個人（單人自用）設計的 Chrome 新分頁書籤管理擴充功能。

* **資料儲存**：完全存放在您個人的 **Google Sheet (Google 試算表)**。
* **帳號驗證**：免登入，直接與您個人的 **Google 帳號連動**。
* **隱私與安全**：資料 100% 儲存於您個人的 Google 雲端硬碟，不經過任何第三方伺服器。
* **運行成本**：**$0 元**，完全免費。

---

## 🚀 快速開始

### 1. 申請 Google Cloud OAuth 2.0 Client ID

由於需要與您的 Google 帳號和雲端硬碟互動，您需要至 Google Cloud 啟用 API 並建立憑證：

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)。
2. 建立新專案（例如：`HamHam-Solo`）。
3. 至 **「OAuth 同意畫面」** (OAuth Consent Screen)：
   * 選擇 **External**，設定基本名稱與您的 Email。
   * 在「範圍 (Scopes)」步驟，新增這兩個 Scope：
     * `https://www.googleapis.com/auth/spreadsheets` (讀寫試算表)
     * `https://www.googleapis.com/auth/drive.file` (在雲端硬碟建立檔案)
   * 在「測試使用者」區塊，**將您自己的 Google 帳號 (Email) 加入名單**。
4. 至 **「憑證」** (Credentials)：
   * 點選 **「建立憑證」** > **「OAuth 用戶端 ID」**。
   * 應用程式類型選擇 **「Web 應用程式」** (Web Application)。
   * 在 **「已授權的重新導向 URI」** 新增：
     ```text
     https://okmcbeiedplfmdllodgapeinlmmjbioc.chromiumapp.org/
     ```
     *(註：此為 HamHam 固定之 Extension ID 所產生的 Redirect URL)*
   * 點擊建立，取得您的 **Client ID**。

---

### 2. 設定專案與編譯

1. 在 `src/extension/` 資料夾下建立一個 `.env` 檔案，填入您的 Client ID：
   ```env
   VITE_GOOGLE_CLIENT_ID=您的_CLIENT_ID_字串.apps.googleusercontent.com
   ```
2. 進入擴充功能目錄，安裝依賴並編譯：
   ```bash
   cd src/extension
   npm install
   npm run build
   ```

---

### 3. 載入至 Chrome 瀏覽器

1. 打開 Chrome，進入 `chrome://extensions/`。
2. 開啟右上角的 **「開發者模式」**。
3. 點選左上角 **「載入未封裝項目」**，選擇編譯產生的 `src/extension/dist` 資料夾。
4. 開啟新分頁，依照畫面指示點選「連結 Google 帳號」，並點選「自動建立試算表」即可開始使用！

---

## 🛠️ 技術架構

* **前端框架**：React + TypeScript + Vite + Tailwind CSS
* **資料庫**：Google Sheets API v4
* **驗證機制**：Chrome Identity API (OAuth 2.0 Web Auth Flow)
* **本地快取**：Chrome Storage API (用於偏好設定與桌布 Base64 快取)
