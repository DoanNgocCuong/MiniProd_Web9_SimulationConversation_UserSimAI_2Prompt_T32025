# 1. Kiểm tra tất cả container đang chạy
sudo docker ps -a

# 2. Kiểm tra network đang bị treo
sudo docker network ls
sudo docker network inspect web-simulation-conv-doanngoccuong

# 3. Dừng container websim-frontend đang kết nối với network
sudo docker stop websim-frontend
sudo docker stop websim-backend
# 4. Xóa container đó
sudo docker rm websim-frontend
sudo docker rm websim-backend

# 5. Xóa network bị treo
sudo docker network rm web-simulation-conv-doanngoccuong

# 6. Chạy lại project
sudo docker compose up --build -d

---