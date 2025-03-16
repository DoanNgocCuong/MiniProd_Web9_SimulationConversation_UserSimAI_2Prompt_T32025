# Framework này là của Purecode 

# Framework UI đang được sử dụng: App.jsx và index.html . hết

Dựa trên code của bạn, bạn đang sử dụng một cách tiếp cận khá đơn giản nhưng hiệu quả:

## React với Babel in-browser và Tailwind CSS

Cụ thể, bạn đang sử dụng:

1. **React** - Thư viện UI chính
   - Được tải trực tiếp từ CDN: `unpkg.com/react@18`
   - Không sử dụng build tool như webpack hay vite

2. **Babel** - Để biên dịch JSX trong trình duyệt
   - Sử dụng `@babel/standalone` từ CDN
   - Cho phép viết code React/JSX mà không cần biên dịch trước

3. **Tailwind CSS** - Framework CSS utility-first
   - Được tải trực tiếp từ CDN: `cdn.tailwindcss.com`
   - Cung cấp các class CSS tiện ích để styling nhanh chóng

4. **React Icons** - Thư viện icon cho React
   - Sử dụng bộ icon Feather (FI) từ `unpkg.com/react-icons`

Đây không phải là một framework UI hoàn chỉnh như Material UI, Chakra UI hay Ant Design, mà là một cách tiếp cận "micro-frontend" đơn giản:

- Tất cả code nằm trong một file HTML duy nhất
- Không có build step
- Không cần cài đặt npm/yarn
- Dễ dàng triển khai (chỉ cần một web server đơn giản)

Cách tiếp cận này rất phù hợp cho các ứng dụng nhỏ, demo, hoặc prototype, vì nó đơn giản và dễ bảo trì. Tuy nhiên, nó sẽ gặp khó khăn khi ứng dụng phát triển lớn hơn.

Nếu bạn muốn đặt tên cho cách tiếp cận này, có thể gọi nó là:
- "React CDN + Tailwind"
- "No-build React"
- "In-browser React"

Đây là một cách tiếp cận pragmatic (thực dụng) và hiệu quả cho các ứng dụng nhỏ và trung bình.
