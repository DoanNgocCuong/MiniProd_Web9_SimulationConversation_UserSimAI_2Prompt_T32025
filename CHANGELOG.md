# Changelog

Tất cả những thay đổi đáng chú ý trong dự án này sẽ được ghi lại trong tệp này.

## [1.1.0] - 2025-03-17

### Thêm mới
- Thêm giao diện người dùng (UI) cho ứng dụng mô phỏng hội thoại
- Tích hợp với API bên ngoài để mô phỏng hội thoại giữa hai vai trò
- Thêm chức năng chọn Bot ID hoặc sử dụng Custom Prompt
- Thêm chức năng chọn nhiều User Prompt cùng lúc
- Thêm chức năng hiển thị kết quả mô phỏng trong thời gian thực
- Thêm chế độ tối/sáng (Dark/Light mode)

### Thay đổi
- Cải thiện hiệu suất khi xử lý nhiều cuộc hội thoại cùng lúc
- Tối ưu hóa giao diện người dùng cho các thiết bị khác nhau
- Cải thiện cách hiển thị tin nhắn trong cuộc hội thoại

### Sửa lỗi
- Sửa lỗi kết nối API trong môi trường Docker
- Sửa lỗi hiển thị tin nhắn dài
- Sửa lỗi JSX không đóng đúng cách trong component

## [1.0.0] - 2025-03-15

### Thêm mới
- Phiên bản đầu tiên của ứng dụng mô phỏng hội thoại
- Tích hợp với OpenAI API để tạo phản hồi
- Hỗ trợ hai vai trò: User và Bot
- Giao diện cơ bản cho việc nhập prompt và hiển thị kết quả 