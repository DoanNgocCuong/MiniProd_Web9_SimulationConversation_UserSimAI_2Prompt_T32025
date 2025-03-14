1. Tham khảo code trong @src 
- Code Backend sẽ là 1 API WebSocket. (FastAPI)
Input nhận vào là: 2 Prompt: 1 Prompt của Agent và 1 Prompt giả lập User. 
2 Prompt này bắn qua bắn lại nhau: 
+, Ở version code trong @src thì 2 Prompt này tương tác với nhau và lần lượt tạo nên Conversation. Sau đó được lưu xuống file excel theo từng dòng với RoleA, RoleB. 
+, Ở version update này: 2 Prompt sẽ bắn nhau ở dưới Backend và WebSocket lên UI. 

2. Frontend: - Lovable.dev + Purcode
---
UI (JSX/TSX + TypeScript) sẽ là: 
1. 2 Prompt được nhập ở 2 ô. 
2. 1 Button "Start" để bắt đầu. 
3. 1 ô chứa Conversation được hiển thị ở dưới. 
Từng dòng từng dòng được hiển thị lên. 

=======
## Cho qua lovable:
![](../2Prompt_SimulationConversation.png)

---
ChatGPT để define kỹ UI hơn. 


============


## Luồng dữ liệu chi tiết

```
Frontend                   Backend                         API bên ngoài            OpenAI
   |                          |                                |                       |
   | Khởi tạo cuộc hội thoại  |                                |                       |
   |------------------------->|                                |                       |
   |                          | Khởi tạo cuộc hội thoại        |                       |
   |                          |------------------------------->|                       |
   |                          |<-------------------------------|                       |
   |<-------------------------|                                |                       |
   |                          |                                |                       |
   |                          | Gửi tin nhắn ban đầu           |                       |
   |                          |------------------------------->|                       |
   |                          |                                |                       |
   |                          | Nhận phản hồi từ Role B        |                       |
   |                          |<-------------------------------|                       |
   |                          |                                |                       |
   | Hiển thị phản hồi Role B |                                |                       |
   |<-------------------------|                                |                       |
   |                          |                                |                       |
   |                          | Gửi lịch sử hội thoại          |                       |
   |                          |------------------------------------------------------>|
   |                          |                                |                       |
   |                          | Nhận phản hồi cho Role A       |                       |
   |                          |<------------------------------------------------------|
   |                          |                                |                       |
   | Hiển thị phản hồi Role A |                                |                       |
   |<-------------------------|                                |                       |
   |                          |                                |                       |
   |                          | Gửi phản hồi Role A            |                       |
   |                          |------------------------------->|                       |
   |                          |                                |                       |
   |                          | Nhận phản hồi từ Role B        |                       |
   |                          |<-------------------------------|                       |
   |                          |                                |                       |
   | Hiển thị phản hồi Role B |                                |                       |
   |<-------------------------|                                |                       |
   |                          |                                |                       |
   |        ... Lặp lại cho đến khi đạt số lượt tối đa ...    |                       |
```


```mermaid
sequenceDiagram
    participant User as Người dùng
    participant Frontend
    participant Backend
    participant ExternalAPI as API Bên ngoài
    participant OpenAI

    User->>Frontend: Nhập prompt và chọn Bot ID
    User->>Frontend: Nhấn "Start Simulation"
    Frontend->>Backend: Gửi yêu cầu qua WebSocket
    Backend->>Frontend: Trả về conversation_id
    
    Note over Backend, Frontend: Kết nối WebSocket vẫn mở

    Backend->>Frontend: Gửi thông báo "Đang khởi tạo cuộc hội thoại..."
    Backend->>ExternalAPI: Gửi yêu cầu khởi tạo (bất đồng bộ)
    
    alt Khởi tạo thành công
        ExternalAPI-->>Backend: Trả về kết quả khởi tạo
        Backend->>Frontend: Gửi thông báo "Đã khởi tạo thành công"
        
        Backend->>Frontend: Gửi tin nhắn người dùng đầu tiên
        Backend->>Frontend: Gửi thông báo "Đang chờ phản hồi từ bot..."
        Backend->>ExternalAPI: Gửi tin nhắn người dùng (bất đồng bộ)
        ExternalAPI-->>Backend: Trả về phản hồi của Role B
        Backend->>Frontend: Gửi phản hồi của Role B
        
        loop Cho mỗi lượt hội thoại
            Backend->>Frontend: Gửi tin nhắn người dùng tiếp theo
            Backend->>Frontend: Gửi thông báo "Đang chờ phản hồi từ bot..."
            Backend->>ExternalAPI: Gửi tin nhắn người dùng (bất đồng bộ)
            ExternalAPI-->>Backend: Trả về phản hồi của Role B
            Backend->>Frontend: Gửi phản hồi của Role B
            
            Backend->>OpenAI: Gửi lịch sử hội thoại đến OpenAI
            OpenAI-->>Backend: Trả về phản hồi cho Role A
            Backend->>Frontend: Gửi phản hồi của Role A
        end
        
        Backend->>Frontend: Gửi thông báo hoàn thành cuộc hội thoại
    else Khởi tạo thất bại
        ExternalAPI-->>Backend: Trả về lỗi hoặc timeout
        Backend->>Frontend: Gửi thông báo lỗi với gợi ý sử dụng Bot ID 16
    end
    
    Frontend->>User: Hiển thị toàn bộ cuộc hội thoại

```