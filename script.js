// Kết nối bộ thư viện Firebase Firestore chính hãng qua CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const MAT_KHAU_ADMIN = "kien2026"; 

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

// Biến DOM và State
const gallery = document.getElementById('antGallery');
const antModal = document.getElementById('antModal');
const detailModal = document.getElementById('detailModal');
const form = document.getElementById('antForm');
let loadedAnts = [];
let isSubmitting = false; // BIẾN KHÓA ĐỂ NGĂN GỬI TRÙNG LẶP

// 1. TẢI DỮ LIỆU (Đã làm sạch mảng cũ)
async function loadAntKingdom() {
    gallery.innerHTML = '<p style="text-align: center; color: var(--accent);">🍁 Đang mở cửa hang kiến...</p>';
    try {
        const q = query(collection(db, "ants"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        gallery.innerHTML = ''; 
        loadedAnts = []; 

        if (querySnapshot.empty) {
            gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Vương quốc chưa có cư dân.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const ant = doc.data();
            ant.id = doc.id; 
            loadedAnts.push(ant);

            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = loadedAnts.length - 1; 

            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${ant.image}" alt="${ant.name}" onerror="this.src='https://images.unsplash.com/photo-1605092676920-8cb5ae46c9d1?q=80&w=600'">
                </div>
                <div class="card-content">
                    <h3>${ant.name}</h3>
                    <p>${ant.desc}</p>
                    <div class="card-footer">Xem chi tiết</div>
                </div>
            `;
            gallery.appendChild(card);
        });
        setupCardClicks();
    } catch (error) {
        gallery.innerHTML = '<p style="color: red;">Lỗi kết nối Firebase.</p>';
    }
}

// 2. SỰ KIỆN CLICK MỞ MODAL
function setupCardClicks() {
    document.querySelectorAll('.card').forEach(card => {
        card.onclick = () => {
            const ant = loadedAnts[card.dataset.index];
            document.getElementById('detailImg').src = ant.image;
            document.getElementById('detailName').innerText = ant.name;
            document.getElementById('detailDesc').innerText = ant.desc;
            detailModal.style.display = "block";
        };
    });
}

// 3. XỬ LÝ ĐÓNG MODAL
document.getElementById('closeForm').onclick = () => antModal.style.display = "none";
document.getElementById('closeDetail').onclick = () => detailModal.style.display = "none";
document.getElementById('addBtn').onclick = () => antModal.style.display = "block";

// 4. GỬI DỮ LIỆU (ĐÃ FIX LỖI TRÙNG LẶP)
form.onsubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Nếu đang gửi thì chặn luôn

    const pass = document.getElementById('adminPassword').value;
    if (pass !== MAT_KHAU_ADMIN) {
        alert("❌ Sai mật khẩu quản trị!");
        return;
    }

    isSubmitting = true; // Bật khóa
    const submitBtn = form.querySelector('.btn-submit');
    submitBtn.innerText = "Đang đăng...";

    try {
        await addDoc(collection(db, "ants"), {
            name: document.getElementById('antName').value,
            image: document.getElementById('antImage').value,
            desc: document.getElementById('antDesc').value,
            createdAt: new Date()
        });
        
        form.reset();
        antModal.style.display = "none";
        await loadAntKingdom(); // Tải lại danh sách
        alert("🎉 Thành công!");
    } catch (err) {
        alert("Lỗi đăng bài!");
    } finally {
        isSubmitting = false; // Mở khóa sau khi xong
        submitBtn.innerText = "Xác nhận đăng";
    }
};

loadAntKingdom();
