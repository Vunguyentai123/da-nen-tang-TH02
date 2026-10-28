# Hướng dẫn cấu hình Firebase cho UDU Chat (Bài Thực Hành 2 / 5)

Ứng dụng đã được tích hợp đầy đủ tính năng thời gian thực với **Firebase JS SDK (Authentication & Realtime Database)** và **Chia sẻ vị trí (@react-native-community/geolocation)**.

---

## 1. Cấu hình thông tin Firebase vào ứng dụng

Mở file [`src/services/firebase.ts`](file:///c:/Users/NGUYEN%20TAI%20VU/CODE/ReactNative/TH2/src/services/firebase.ts) và điền các khóa cấu hình từ Firebase Console của bạn:

```typescript
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com", // Lưu ý: Cần URL của Realtime Database
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
};
```

> **Lưu ý quan trọng**: Đảm bảo điền đúng trường `databaseURL`. Nếu database đặt tại khu vực Đông Nam Á (asia-southeast1), URL thường có dạng: `https://<project-id>-default-rtdb.asia-southeast1.firebasedatabase.app`.

---

## 2. Bật Authentication trên Firebase Console

1. Truy cập [Firebase Console](https://console.firebase.google.com/) -> Chọn Project của bạn.
2. Vào mục **Build** -> **Authentication** -> **Get Started**.
3. Chọn thẻ **Sign-in method** -> Chọn **Email/Password** -> Bật **Enable** -> Nhấn **Save**.

---

## 3. Cấu hình Realtime Database & Luật bảo mật (Security Rules)

1. Vào mục **Build** -> **Realtime Database** -> Nhấn **Create Database** (chọn vị trí gần bạn, ví dụ Singapore / United States).
2. Chuyển sang tab **Rules** (Quy tắc), dán nội dung sau và nhấn **Publish**:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "chats": {
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "userConversations": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

---

## 4. Các tính năng đã phát triển hoàn chỉnh

1. **Đăng ký & Đăng nhập (Authentication)**:
   - Màn hình Đăng ký: Họ tên, Email, Mật khẩu (tối thiểu 6 ký tự), Xác nhận mật khẩu. Bật/tắt ẩn hiện mật khẩu 👁️.
   - Bắt lỗi tiếng Việt rõ ràng khi sai tài khoản/mật khẩu, email trùng, mật khẩu yếu.
   - Đăng xuất ở Cài đặt lập tức trở về màn hình Đăng nhập.

2. **Danh bạ thời gian thực (Contacts)**:
   - Tải danh sách người dùng đã đăng ký từ Firebase (tự động loại trừ tài khoản đang đăng nhập).
   - Trạng thái **Online / Offline** cập nhật theo thời gian thực (hỗ trợ tự động offline qua `onDisconnect` khi ngắt mạng).
   - Thanh tìm kiếm theo tên hoặc email. Nhấn vào người dùng để mở màn hình chat 1-1.

3. **Chat 1-1 thời gian thực**:
   - Gửi và nhận tin nhắn lập tức không cần tải lại trang.
   - Tin của mình nằm bên phải (màu xanh thương hiệu `#2563EB`), tin của đối phương nằm bên trái (nền trắng, viền tinh tế).
   - Chặn gửi tin nhắn rỗng. Tự động cuộn xuống tin nhắn mới nhất.
   - Thanh tiêu đề hiển thị tên và chấm xanh trực tuyến theo thời gian thực.
   - Đã bọc `cleanup` trong `useEffect` (`off()` / unsubscribe) để không bị hiện lặp tin nhắn.

4. **Chia sẻ vị trí & Google Maps**:
   - Nút 📍 nằm ngay thanh nhập tin nhắn.
   - Tự động xin quyền vị trí (`ACCESS_FINE_LOCATION`); hiển thị thông báo rõ ràng nếu bị từ chối hoặc GPS tắt.
   - Tin nhắn vị trí hiển thị dưới dạng Card bản đồ chuyên biệt gồm tọa độ GPS rõ ràng.
   - Nhấn vào tin nhắn vị trí sẽ mở ngay ứng dụng **Google Maps** đúng tọa độ đã gửi.

5. **Màn hình Cuộc trò chuyện (Home)**:
   - Hiển thị danh sách các cuộc trò chuyện đã có (ảnh đại diện, tên, tin nhắn cuối, thời gian). Cuộc trò chuyện mới nhất tự động đẩy lên trên cùng.
   - Số tin nhắn chưa đọc (Badge màu đỏ) tăng ngay khi có tin nhắn mới gửi đến.
   - Tự động đặt số tin chưa đọc về `0` ngay khi mở cuộc trò chuyện.
