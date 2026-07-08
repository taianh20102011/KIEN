// Kết nối bộ thư viện Firebase Firestore chính hãng qua CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const formTitle = document.getElementById('formTitle');

let loadedAnts = [];
let isSubmitting = false; 
let editId = null; // BIẾN LƯU ID KHI ĐANG SỬA (null = Đang thêm mới)

// 1. TẢI DỮ LIỆU
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
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                        <div class="card-footer">Xem chi tiết</div>
                        <button class="btn-edit" data-index="${loadedAnts.length - 1}">✏️ Sửa</button>
                    </div>
                </div>
            `;
            gallery.appendChild(card);
        });
        setupCardClicks();
    } catch (error) {
        gallery.innerHTML = '<p style="color: red;">Lỗi kết nối Firebase.</p>';
    }
}

// 2. SỰ KIỆN CLICK MỞ MODAL & SỬA
function setupCardClicks() {
    // Click vào card để xem chi tiết (Trừ khi click trúng nút Sửa)
    document.querySelectorAll('.card').forEach(card => {
        card.onclick = (e) => {
            if (e.target.classList.contains('btn-edit')) return; // Bấm nút sửa thì bỏ qua hàm này

            const ant = loadedAnts[card.dataset.index];
            document.getElementById('detailImg').src = ant.image;
            document.getElementById('detailName').innerText = ant.name;
            document.getElementById('detailDesc').innerText = ant.desc;
            detailModal.style.display = "block";
        };
    });

    // Xử lý sự kiện khi bấm nút Sửa
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation(); // Ngăn chặn sự kiện mở modal xem chi tiết
            
            const ant = loadedAnts[btn.dataset.index];
            
            // Đổ dữ liệu cũ vào Form
            editId = ant.id; // Chuyển sang chế độ Chỉnh sửa
            formTitle.innerText = "Chỉnh Sửa Cư Dân";
            document.getElementById('antName').value = ant.name;
            document.getElementById('antImage').value = ant.image;
            document.getElementById('antDesc').value = ant.desc;
            document.getElementById('adminPassword').value = ""; // Để trống bắt nhập lại mật khẩu

            antModal.style.display = "block";
        };
    });
}

// 3. XỬ LÝ ĐÓNG MODAL
document.getElementById('closeForm').onclick = () => antModal.style.display = "none";
document.getElementById('closeDetail').onclick = () => detailModal.style.display = "none";

// Nút "Đăng loài mới" -> Reset Form về trạng thái Thêm mới
document.getElementById('addBtn').onclick = () => {
    editId = null; // Reset về trạng thái Thêm mới
    formTitle.innerText = "Thêm Cư Dân Mới";
    form.reset();
    antModal.style.display = "block";
};

// 4. GỬI DỮ LIỆU (XỬ LÝ CẢ THÊM & SỬA)
form.onsubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; 

    const pass = document.getElementById('adminPassword').value;
    if (pass !== MAT_KHAU_ADMIN) {
        alert("❌ Sai mật khẩu quản trị!");
        return;
    }

    isSubmitting = true; 
    const submitBtn = form.querySelector('.btn-submit');
    submitBtn.innerText = editId ? "Đang cập nhật..." : "Đang đăng...";

    const antData = {
        name: document.getElementById('antName').value,
        image: document.getElementById('antImage').value,
        desc: document.getElementById('antDesc').value,
        updatedAt: new Date() // Lưu thêm thời gian cập nhật
    };

    try {
        if (editId) {
            // Chế độ: CHỈNH SỬA
            const antDocRef = doc(db, "ants", editId);
            await updateDoc(antDocRef, antData);
            alert("🎉 Cập nhật thành công!");
        } else {
            // Chế độ: THÊM MỚI
            antData.createdAt = new Date();
            await addDoc(collection(db, "ants"), antData);
            alert("🎉 Thêm thành công!");
        }
        
        form.reset();
        antModal.style.display = "none";
        await loadAntKingdom(); // Tải lại danh sách mới nhất
    } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra khi thao tác!");
    } finally {
        isSubmitting = false; 
        submitBtn.innerText = "Xác nhận đăng";
    }
};

loadAntKingdom();
