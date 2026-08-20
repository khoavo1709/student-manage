# Student Management System

Website quản lý học sinh: danh sách học sinh, lớp học, điểm số, bài tập, nhận xét, học phí, lịch học.

Repo gồm 2 phần nằm chung 1 project:
- `client/` — giao diện web (những gì người dùng nhìn thấy trên trình duyệt)
- `server/` — phần xử lý dữ liệu phía sau (API + kết nối database)

## 1. Cài đặt công cụ cần thiết (chỉ làm 1 lần)

Cần cài **Node.js** (bản 20 trở lên) — đây là công cụ để chạy code JavaScript/TypeScript của project này.

- Tải tại: https://nodejs.org (chọn bản LTS, cứ bấm Next liên tục khi cài)
- Kiểm tra đã cài xong chưa: mở terminal (Command Prompt / PowerShell / Git Bash), gõ:
  ```
  node -v
  npm -v
  ```
  Nếu hiện ra số phiên bản (ví dụ `v20.11.0`) là đã cài thành công.

## 2. Lấy code về máy

Nếu dùng Git:
```
git clone <link-repo-này>
cd student-management-system
```
Nếu không quen dùng Git, có thể tải file zip của repo về và giải nén, rồi mở terminal tại thư mục vừa giải nén.

## 3. Cài thư viện cho project

Đứng tại thư mục gốc (`student-management-system`), chạy:
```
npm install
```
Lệnh này sẽ tự động cài đặt thư viện cho cả `client/` và `server/`. Chỉ cần chạy 1 lần (chạy lại nếu sau này có người thêm thư viện mới).

## 4. Xem thử giao diện (chưa cần chuẩn bị gì thêm)

Nếu chỉ muốn xem giao diện web đang được xây dựng tới đâu (chưa cần đăng nhập thật hay dữ liệu thật):

```
cd client
npm run dev
```

Terminal sẽ hiện ra một đường link, thường là `http://localhost:5173` — mở link đó bằng trình duyệt (Chrome, Edge...) là xem được.

Ở trang Đăng nhập, dùng tài khoản demo sau để vào xem giao diện (tài khoản này chỉ dùng để xem thử, không cần database thật):
```
Tên đăng nhập: khoaadmin
Mật khẩu: khoaadmin
```
Nhập sai thông tin trên (hoặc dùng tài khoản khác) sẽ báo lỗi, vì phần xử lý dữ liệu (`server/`) chưa được bật lên — đây là bình thường, không phải lỗi cần sửa.

Để dừng lại, quay lại terminal và bấm `Ctrl + C`.

## 5. Chạy đầy đủ cả hệ thống (có đăng nhập, có dữ liệu thật)

Phần này cần thêm 1 database (nơi lưu dữ liệu học sinh, điểm số...). Việc chuẩn bị database và các bước chạy đầy đủ sẽ được bổ sung hướng dẫn riêng khi phần đó hoàn thiện — hiện tại dự án đang trong giai đoạn xây dựng.

## Cần giúp đỡ?

Nếu chạy lệnh mà gặp thông báo lỗi, chụp lại màn hình lỗi đó và gửi cho người phụ trách kỹ thuật của project để được hỗ trợ.
