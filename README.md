# 🎨 Chibi Studio – AI tạo ảnh Chibi từ chân dung

Chibi Studio là ứng dụng AI cho phép người dùng tải ảnh chân dung và chuyển nó thành phong cách **Chibi Anime** dễ thương. Dự án kết hợp:

- Google **Gemini AI**
- Web UI tối ưu UX/UI
- Proxy backend ẩn API key
- Triển khai dễ dàng trên hosting phổ thông (Spaceship, cPanel) hoặc nền tảng serverless hiện đại

---

## 🚀 Tính năng nổi bật

- 🖼️ Upload ảnh trực tiếp  
- 🤖 AI phân tích khuôn mặt / outfit / mood  
- 🎨 Sinh prompt Chibi theo style anime  
- 🛠️ Hỗ trợ nhiều model Gemini  
- 🚫 Không lộ API key  
- 🌍 Triển khai nhanh, không cần DevOps  

---

## 🏗️ Tech Stack

| Thành phần | Công nghệ |
|-----------|-----------|
| Frontend  | HTML, CSS, JavaScript |
| AI Backend | Google Gemini API |
| Proxy Server | PHP (Spaceship / cPanel) hoặc Serverless |
| Deploy | Vercel / Cloudflare Pages / Shared Hosting |

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

