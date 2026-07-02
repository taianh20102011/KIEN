// Nhúng thư viện Firebase Firestore từ CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Đổi chuỗi này thành MẬT KHẨU bạn muốn thiết lập
const MAT_KHAU_CUA_BAN = "kien2026"; 

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtp4izpF1GCH2qWpeLtZOdk33A_iNKzqg",
  authDomain: "nknl-d7b54.firebaseapp.com",
  projectId: "nknl-d7b54",
  storageBucket: "nknl-d7b54.firebasestorage.app",
  messagingSenderId: "792185587281",
  appId: "1:792185587281:web:585e98f2f87d7d59031a70",
  measurementId: "G-TC7XHSSCBX"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const gallery = document.getElementById('antGallery');
const modal = document.getElementById('antModal');
const addBtn = document.getElementById('addBtn');
const closeBtn = document.querySelector('.close');
const form = document.getElementById('antForm');

// 2. HÀM LẤY DỮ LIỆU TỪ FIRESTORE VỀ WEB (Ai cũng xem được)
async function renderAnts() {
    gallery.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: #8bc34a;">Đang mở cửa tổ kiến...</p>';
    
    try {
        // Lấy dữ liệu từ bảng "ants" và sắp xếp theo thời gian mới nhất
        const q = query(collection(db, "ants"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        gallery.innerHTML = ''; // Xóa dòng chữ đang tải
        
        if (querySnapshot.empty) {
            gallery.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Chưa có loài kiến nào được đăng.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const ant = doc.data();
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${ant.image}" alt="${ant.name}">
                <div class="card-content">
                    <h3>${ant.name}</h3>
                    <p>${ant.desc}</p>
                </div>
            `;
            gallery.appendChild(card);
        });
    } catch (error) {
        console.error("Lỗi tải dữ liệu: ", error);
        gallery.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: #ff5722;">Lỗi! Không thể kết nối dữ liệu Firebase.</p>';
    }
}

// Bật/tắt Form nhập bài
addBtn.onclick = () => modal.style.display = "block";
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }

// 3. XỬ LÝ KHI BẤM NÚT ĐĂNG BÀI (Kiểm tra pass)
form.onsubmit = async (e) => {
    e.preventDefault();

    const inputPassword = document.getElementById('adminPassword').value;

    // KIỂM TRA MẬT KHẨU
    if (inputPassword !== MAT_KHAU_CUA_BAN) {
        alert("❌ Sai mật khẩu quản trị! Bạn không có quyền đăng loài kiến này.");
        return; // Dừng lại luôn, không cho chạy tiếp xuống dưới
    }

    // Nếu đúng pass, chuẩn bị dữ liệu gửi lên Firebase
    const newAnt = {
        name: document.getElementById('antName').value,
        image: document.getElementById('antImage').value,
        desc: document.getElementById('antDesc').value,
        createdAt: new Date() // Lưu thời gian đăng để sắp xếp bài mới lên đầu
    };

    try {
        // Gửi lên bảng dữ liệu tên là "ants" trên mạng
        await addDoc(collection(db, "ants"), newAnt);
        
        alert("🎉 Đăng thành công loài kiến mới lên hệ thống!");
        form.reset();
        modal.style.display = "none";
        
        // Tải lại giao diện để cập nhật con kiến mới vừa đăng
        renderAnts();
    } catch (error) {
        console.error("Lỗi khi lưu: ", error);
        alert("❌ Lỗi cấu hình quyền ghi dữ liệu của Firebase!");
    }
};

// Chạy hàm hiển thị ngay khi mở trang web
renderAnts();
