<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>
🎨 Chibi Studio – AI tạo ảnh Chibi từ chân dung

Chibi Studio là ứng dụng AI cho phép người dùng tải ảnh chân dung và chuyển nó thành phong cách Chibi Anime dễ thương. Dự án kết hợp:

Google Gemini AI

Web UI tối ưu UX/UI

Proxy backend ẩn API key

Triển khai dễ dàng trên hosting phổ thông (Spaceship, cPanel) hoặc nền tảng serverless hiện đại

🚀 Tính năng nổi bật

🖼️ Upload ảnh trực tiếp

🤖 AI phân tích khuôn mặt / outfit / mood

🎨 Sinh prompt Chibi theo style anime

🛠️ Hỗ trợ nhiều model Gemini

🚫 Không lộ API key

🌍 Triển khai nhanh, không cần DevOps

🏗️ Tech Stack
Thành phần	Công nghệ
Frontend	HTML, CSS, JavaScript
AI Backend	Google Gemini API
Proxy Server	PHP (Spaceship / cPanel) hoặc Serverless
Deploy	Vercel / Cloudflare Pages / Shared Hosting
▶️ Chạy ứng dụng trên máy (Local)
Yêu cầu:

Node.js (khuyến nghị bản LTS)

Cài đặt & chạy
npm install


Tạo file:

.env.local


Thêm key:

GEMINI_API_KEY=YOUR_API_KEY_HERE


KHÔNG đưa file .env.local lên GitHub

Chạy app:

npm run dev


Truy cập:

http://localhost:5173

🔐 Cấu hình API Key Gemini

Vào: https://aistudio.google.com

Tạo project mới

Vào mục API Keys → Create key

Bật Generative Language API

Copy key dùng cho .env.local hoặc proxy

Lưu ý:

Model tạo ảnh (...-image) không miễn phí

Dùng text model (gemini-2.0-flash, gemini-pro) nếu muốn free

🖧 Ẩn API Key bằng Proxy (bắt buộc khi deploy)

Tạo file PHP:

/api/gemini.php

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


Frontend gọi proxy thay vì gọi Gemini trực tiếp:

await fetch("/api/gemini.php", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt }),
});

🌐 Hướng dẫn deploy
1️⃣ Deploy lên Spaceship / cPanel / Hosting thường

Upload toàn bộ mã nguồn vào public_html

Thêm folder api + file gemini.php

Sửa URL fetch của frontend thành /api/gemini.php

Xong!

2️⃣ Deploy lên Vercel

Chạy npm run build

Deploy folder dist

Dùng Vercel Functions để tạo proxy API:

/api/gemini.js

3️⃣ Deploy lên Cloudflare Pages

Build ra static assets

Dùng Cloudflare Workers để tạo proxy Gemini API

🧪 Kiểm tra lỗi thường gặp
Lỗi	Nguyên nhân	Cách sửa
429 RESOURCE_EXHAUSTED	Hết quota model ảnh	Đổi sang model text hoặc bật billing
403 PERMISSION_DENIED	API chưa bật	Bật Generative Language API
Model returned text instead of image	Dùng model text nhưng code đòi ảnh	Sửa logic hoặc dùng image model (billing)
🧭 Roadmap

 Upload ảnh

 Tạo prompt Chibi

 Generate ảnh anime full body

 Marketplace style packs

 Subscription / token credit

🫶 Đóng góp

PR welcome. Nếu muốn tham gia phát triển hoặc thương mại hóa, mở Issue trên repo.

📄 License

MIT – được phép sử dụng, chỉnh sửa, thương mại hóa.

💥 KẾT THÚC

README này đủ đẹp để public GitHub + đăng Product Hunt luôn.
