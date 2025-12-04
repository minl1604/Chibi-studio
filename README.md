<!-- Banner / Logo tùy thêm sau -->
<h1 align="center">🎨 Chibi Studio</h1>
<p align="center"><b>AI biến ảnh thật thành nhân vật Chibi Anime</b></p>

<p align="center">
  <img src="https://cdn.simpleicons.org/google/4285F4" width="24" /> Powered by Gemini AI
  &nbsp;•&nbsp;
  <img src="https://cdn.simpleicons.org/javascript/F7DF1E" width="24" /> Web Frontend
  &nbsp;•&nbsp;
  <img src="https://cdn.simpleicons.org/php/777BB4" width="24" /> Proxy Backend
</p>

---
# <h1 align="center"> Website demo : https://chibi.minlgne.xyz/</h1>
## 🧬 Giới thiệu

**Chibi Studio** là ứng dụng AI giúp bạn chuyển ảnh chân dung thành phong cách **Chibi Anime** cực kỳ đáng yêu.  
Không cần skill Photoshop – upload ảnh, bấm nút, đợi vài giây là có kết quả.

Ứng dụng được thiết kế để:

- Dễ deploy trên shared hosting / Spaceship
- Không lộ API key
- Có thể nâng cấp thành SaaS bán credit sau này

---

## ✨ Tính năng nổi bật

- 🖼️ Upload ảnh → AI phân tích khuôn mặt & phong cách
- 🎨 Tạo prompt Chibi theo style anime
- 🤝 Hỗ trợ nhiều model Gemini tuỳ mục đích
- 🔐 Ẩn API key hoàn toàn phía server
- 🧩 Tối ưu để scale thành dịch vụ thực chiến

---

## 🏗️ Tech Stack

| Layer | Công nghệ |
|------|-----------|
| UI/UX | HTML, CSS, JavaScript |
| AI Engine | Google Gemini API |
| Proxy | PHP (Spaceship / cPanel) / Serverless |
| Deploy | Vercel, Cloudflare Pages, Shared Hosting |
---

## ▶️ Chạy ứng dụng trên máy (Local)

### Yêu cầu

- Đã cài **Node.js** (khuyến nghị bản LTS)

### Cài đặt & chạy

npm install

Tạo file:

.env.local

Thêm:

GEMINI_API_KEY=YOUR_API_KEY_HERE

❗ KHÔNG commit file `.env.local` lên GitHub để tránh lộ API key.

Chạy app:

npm run dev

Truy cập:

http://localhost:5173

---

## 🔐 Cấu hình API Key Gemini

1. Truy cập: https://aistudio.google.com  
2. Tạo **Cloud Project**  
3. Tạo **API Key**  
4. Bật **Generative Language API**  
5. Dán key vào `.env.local` (khi chạy local) hoặc vào file proxy backend (khi deploy)

⚠️ Lưu ý:

- Các model tạo ảnh (`...-image`) hiện **không còn Free Tier**  
- Để dùng miễn phí, nên dùng model text như `gemini-2.0-flash`, `gemini-pro`

---

## 🖧 Ẩn API Key bằng Proxy (khuyến nghị khi deploy)

Tạo file:

/api/gemini.php

Nội dung:

<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$API_KEY = "YOUR_API_KEY_HERE";

$input = json_decode(file_get_contents("php://input"), true);
$prompt = $input["prompt"] ?? "";

$payload = [
  "model" => "gemini-2.0-flash",
  "contents" => [[ "parts" => [["text" => $prompt]] ]]
];

$ch = curl_init();
curl_setopt_array($ch, [
  CURLOPT_URL => "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $API_KEY,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
  CURLOPT_POSTFIELDS => json_encode($payload),
  CURLOPT_RETURNTRANSFER => true
]);

echo curl_exec($ch);
curl_close($ch);
?>

Frontend gọi proxy:

await fetch("/api/gemini.php", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt }),
});

---

## 🌐 Hướng dẫn deploy

### 1️⃣ Deploy lên Spaceship / cPanel / shared hosting

- Upload toàn bộ source code vào thư mục `public_html`
- Tạo thư mục `api`
- Thêm file `gemini.php` vào `public_html/api/gemini.php`
- Đảm bảo frontend đang gọi tới `/api/gemini.php`

### 2️⃣ Deploy lên Vercel

npm run build

Deploy folder `dist` lên Vercel.

Tạo serverless function proxy:

/api/gemini.js

Nội dung:

export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const { prompt } = req.body;

  const payload = {
    model: "gemini-2.0-flash",
    contents: [{ parts: [{ text: prompt }] }],
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();
  res.status(response.status).json(data);
}

### 3️⃣ Deploy lên Cloudflare Pages

- Build ra static files (`npm run build`)
- Deploy lên Cloudflare Pages
- Dùng Cloudflare Workers làm proxy API

---

## 🧪 Lỗi thường gặp

| Mã lỗi | Nguyên nhân | Cách xử lý |
|-------|-------------|-----------|
| 429 | Hết quota / model ảnh không Free | Đổi sang model text hoặc bật billing |
| 403 | API chưa bật / key sai | Bật **Generative Language API** |
| Model returned text instead of image | Model text không trả ảnh | Dùng model image (billing) hoặc sửa code xử lý text |

---

## 🧭 Lộ trình phát triển

- [x] Upload ảnh và phân tích  
- [x] Generate prompt Chibi từ ảnh người dùng  
- [ ] Cập nhật thêm ....

---

## 🫶 Đóng góp

Đóng góp PR hoặc mở Issue đều được chào đón.  
Hỗ trợ nâng cấp bản thương mại → mở Issue để liên hệ.

---

## 📄 License

**MIT** – Tự do sử dụng, chỉnh sửa, thương mại hóa.

## Tác Giả 
<p align="center">
  <a href="https://facebook.com/NguyenMinhLong160403" target="_blank">
    <img src="https://cdn.simpleicons.org/facebook/1877F2" width="40" alt="Facebook" />
  </a>
  &nbsp;&nbsp;
  <a href="https://discord.com/users/784602751421251606" target="_blank">
    <img src="https://cdn.simpleicons.org/discord/5865F2" width="40" alt="Discord" />
  </a>
</p>
