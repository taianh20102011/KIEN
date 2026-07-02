// Kết nối bộ thư viện Firebase Firestore chính hãng qua CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ĐẶT MẬT KHẨU CỦA BẠN TẠI ĐÂY
const MAT_KHAU_ADMIN = "kien2026"; 

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Khai báo các biến DOM cần thiết
const gallery = document.getElementById('antGallery');
const antModal = document.getElementById('antModal');
const detailModal = document.getElementById('detailModal');
const addBtn = document.getElementById('addBtn');
const closeForm = document.getElementById('closeForm');
const closeDetail = document.getElementById('closeDetail');
const form = document.getElementById('antForm');

// Mảng tạm để quản lý dữ liệu sau khi tải từ mạng về
let loadedAnts = [];

// 1. HÀM TẢI DỮ LIỆU TỪ FIRESTORE VÀ HIỂN THỊ
async function loadAntKingdom() {
    gallery.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--primary);">
            <p style="font-weight: 600; letter-spacing: 1px;">🍁 Đang mở cửa hang kiến...</p>
        </div>
    `;
    
    try {
        const q = query(collection(db, "ants"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        gallery.innerHTML = ''; 
        loadedAnts = []; // Xóa trắng mảng cũ

        if (querySnapshot.empty) {
            gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-body);">Vương quốc chưa có cư dân nào. Hãy đăng loài đầu tiên!</p>';
            return;
        }

        let index = 0;
        querySnapshot.forEach((doc) => {
            const ant = doc.data();
            // Lưu id tự sinh của Firebase vào luôn để quản lý
            ant.id = doc.id; 
            loadedAnts.push(ant);

            const card = document.createElement('div');
            card.className = 'card';
            // Gán số thứ tự mảng vào thẻ để khi click biết là con nào
            card.dataset.index = index; 

            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${ant.image}" alt="${ant.name}" onerror="this.src='https://images.unsplash.com/photo-1605092676920-8cb5ae46c9d1?q=80&w=600'">
                </div>
                <div class="card-content">
                    <h3>${ant.name}</h3>
                    <p>${ant.desc}</p>
                    <div class="card-footer">
                        <span>Xem chi tiết</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                </div>
            `;
            gallery.appendChild(card);
            index++;
        });

        // Kích hoạt sự kiện click mở popup chi tiết bài viết
        setupCardClicks();

    } catch (error) {
        console.error(error);
        gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff7043;">Lỗi kết nối máy chủ dữ liệu Firebase.</p>';
    }
}

// 2. XỬ LÝ SỰ KIỆN CLICK VÀO CARD ĐỂ MỞ POPUP CHI TIẾT
function setupCardClicks() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.onclick = () => {
            const idx = card.dataset.index;
            const targetAnt = loadedAnts[idx];

            // Gán dữ liệu vào Modal Chi tiết
            document.getElementById('detailImg').src = targetAnt.image;
            document.getElementById('detailImg').alt = targetAnt.name;
            document.getElementById('detailName').innerText = targetAnt.name;
            document.getElementById('detailDesc').innerText = targetAnt.desc;

            // Hiển thị modal chi tiết lên màn hình
            detailModal.style.display = "block";
            document.body.style.overflow = "hidden"; // Khóa thanh cuộn trang chính
        };
    });
}

// 3. ĐIỀU KHIỂN ĐÓNG/MỞ CÁC ĐỐI TƯỢNG MODAL
addBtn.onclick = () => { antModal.style.display = "block"; document.body.style.overflow = "hidden"; };
closeForm.onclick = () => { antModal.style.display = "none"; document.body.style.overflow = "auto"; };
closeDetail.onclick = () => { detailModal.style.display = "none"; document.body.style.overflow = "auto"; };

window.onclick = (e) => {
    if (e.target == antModal) { antModal.style.display = "none"; document.body.style.overflow = "auto"; }
    if (e.target == detailModal) { detailModal.style.display = "none"; document.body.style.overflow = "auto"; }
};

// 4. KIỂM TRA MẬT KHẨU VÀ GỬI DỮ LIỆU LÊN FIRESTORE
form.onsubmit = async (e) => {
    e.preventDefault();

    const pass = document.getElementById('adminPassword').value;
    if (pass !== MAT_KHAU_ADMIN) {
        alert("❌ Sai mật khẩu quản trị! Bạn không được cấp quyền đăng dữ liệu.");
        return;
    }

    const newAnt = {
        name: document.getElementById('antName').value,
        image: document.getElementById('antImage').value,
        desc: document.getElementById('antDesc').value,
        createdAt: new Date()
    };

    try {
        await addDoc(collection(db, "ants"), newAnt);
        alert("🎉 Tuyệt vời! Loài kiến mới đã được thêm vào vương quốc.");
        form.reset();
        antModal.style.display = "none";
        document.body.style.overflow = "auto";
        
        // Tải lại toàn bộ bảng danh sách để cập nhật con mới lên đầu
        loadAntKingdom();
    } catch (err) {
        console.error(err);
        alert("❌ Đăng bài thất bại! Hãy kiểm tra lại tab Rules trên Firebase của bạn.");
    }
};

// Khởi động trang web lần đầu tiên
loadAntKingdom();
