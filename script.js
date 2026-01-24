/***************
 * GLOBAL
 ***************/
let currentUser = localStorage.getItem("currentUser");
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let totalPrice = 0;

const menus = [
  { name:"โรตีธรรมดา", price:10 },
  { name:"โรตีนมทะลัก", price:13 },
  { name:"โรตีช็อกโกแลต", price:15 },
  { name:"โรตีแยม", price:15 },
  { name:"โรตีไมโล", price:15 },
  { name:"โรตีกาแฟ", price:15 },
  { name:"โรตีลูกเกด", price:15 },
  { name:"โรตีใส่ไข่", price:20 },
  { name:"โรตีกล้วย", price:30 },
  { name:"โรตีข้าวโพด", price:30 }
];

/***************
 * AUTH
 ***************/
function register(){
  let u = user.value.trim();
  let p = pass.value.trim();

  if(!u || !p){
    alert("กรอกข้อมูลให้ครบ");
    return;
  }

  if(u === "admin"){
    alert("ไม่สามารถใช้ชื่อนี้ได้");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users") || "{}");

  if(users[u]){
    alert("มีผู้ใช้นี้แล้ว");
    return;
  }

  users[u] = p;
  localStorage.setItem("users", JSON.stringify(users));

  // ✅ แจ้งเตือนสมัครสำเร็จ
  alert("สมัครสมาชิกสำเร็จ 🎉 กรุณาล็อกอิน");

  user.value = "";
  pass.value = "";
}


function login(){
  let u = user.value.trim();
  let p = pass.value.trim();

  if(!u || !p){
    alert("กรอกชื่อผู้ใช้และรหัสผ่าน");
    return;
  }

  // 🔐 แอดมิน
  if(u === "admin" && p === "admin123"){
    localStorage.setItem("currentUser","admin");
    alert("เข้าสู่ระบบแอดมิน");
    location.href = "admin.html";
    return;
  }

  // 👤 ลูกค้า
  let users = JSON.parse(localStorage.getItem("users") || "{}");

  if(users[u] !== p){
    alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    return;
  }

  // ✅ เก็บสถานะล็อกอิน
  localStorage.setItem("currentUser", u);

  alert("เข้าสู่ระบบสำเร็จ ✅");
  location.href = "index.html";
}


function logout(){
  localStorage.removeItem("currentUser");
  location.href = "login.html";
}


function checkCustomer(){
  let u = localStorage.getItem("currentUser");

  if(!u || u === "admin"){
    location.href = "login.html";
    return;
  }

  currentUser = u;   // ⭐ สำคัญ
  loadMenu();
}


function checkAdmin(){
  if(currentUser !== "admin"){
    location.href = "login.html";
  }
}

/***************
 * MENU
 ***************/
let qty = {};

function loadMenu(){
  let menuList = document.getElementById("menuList");
  if(!menuList) return;

  menuList.innerHTML = "";

  menus.forEach((m,i)=>{
    menuList.innerHTML += `
<div class="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-2 hover:shadow-xl transition">
  <h3 class="font-semibold text-lg">${m.name}</h3>
  <p class="text-red-600 font-bold">${m.price} บาท</p>

  <div class="flex items-center justify-between">
    <button class="px-3 py-1 bg-gray-100 rounded"
      onclick="changeQty(${i},-1)">−</button>

    <span id="qty${i}" class="font-bold">1</span>

    <button class="px-3 py-1 bg-gray-100 rounded"
      onclick="changeQty(${i},1)">+</button>
  </div>

  <textarea id="note${i}"
    class="border rounded-lg p-2 text-sm"
    placeholder="หมายเหตุ เช่น ไม่ใส่นม"></textarea>

  <button onclick="addCart(${i})"
    class="bg-red-600 text-white py-2 rounded-xl hover:bg-red-700">
    เพิ่มลงตะกร้า
  </button>
</div>
`;

  });
}


function changeQty(i,val){
  qty[i] = (qty[i] || 1) + val;
  if(qty[i] < 1) qty[i] = 1;
  document.getElementById("qty"+i).innerText = qty[i];
}

function addCart(i){
  let q = qty[i] || 1;
  let note = document.getElementById("note"+i).value;

  cart.push({
    name: menus[i].name,
    price: menus[i].price,
    qty: q,
    note: note
  });

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("เพิ่มสินค้าแล้ว");
  qty[i] = 1;
  document.getElementById("qty"+i).innerText = 1;
  document.getElementById("note"+i).value = "";
}

/***************
 * CART / ORDER
 ***************/
function showCart(){
  let cartList = document.getElementById("cartList");
  let totalEl = document.getElementById("total");

  cartList.innerHTML = "";
  totalPrice = 0;

  if(cart.length === 0){
    cartList.innerHTML = "<p class='text-center text-gray-500'>ยังไม่มีสินค้าในตะกร้า</p>";
    totalEl.innerText = "";
    return;
  }

  cart.forEach((c,index)=>{
    let itemTotal = c.price * c.qty;
    totalPrice += itemTotal;

    cartList.innerHTML += `
      <div class="bg-white rounded-xl shadow p-4 flex justify-between items-start gap-4">

        <div>
          <b>${c.name}</b><br>
          จำนวน: ${c.qty}<br>
          หมายเหตุ: ${c.note || "-"}<br>
          รวม: <b>${itemTotal}</b> บาท
        </div>

        <button
          onclick="removeFromCart(${index})"
          class="text-red-600 hover:text-red-800 text-sm">
          ลบ
        </button>

      </div>
    `;
  });

  totalEl.innerText = `รวมทั้งหมด ${totalPrice} บาท`;
}



function confirmPayment(){
  if(cart.length === 0){
    alert("ไม่มีสินค้าในตะกร้า");
    return;
  }

  let orders = JSON.parse(localStorage.getItem("orders") || "[]");

  orders.push({
    user: currentUser,
    items: cart,
    total: totalPrice, // ⭐ บันทึกราคารวม
    status: "กำลังทำ",
    date: new Date().toLocaleString("th-TH")
  });

  localStorage.setItem("orders", JSON.stringify(orders));

  cart = [];
  totalPrice = 0;

  alert("สั่งซื้อสำเร็จ 🎉");
  showPage("orders");
}

function removeFromCart(index){
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart)); // ⭐
  showCart();
}

/***************
 * CUSTOMER ORDERS
 ***************/
function loadCustomerOrders(){
  currentUser = localStorage.getItem("currentUser");
  
  let box = document.getElementById("orderList");
  if(!box) return;

  let orders = JSON.parse(localStorage.getItem("orders") || "[]");
  box.innerHTML = "";

  let mine = orders.filter(o => o.user === currentUser);
  if(mine.length === 0){
    box.innerHTML = "<p>ยังไม่มีคำสั่งซื้อ</p>";
    return;
  }

  mine.forEach(o=>{
    box.innerHTML += `
    <div class="card">
      <b>เวลา:</b> ${o.date}<br>
      <b>สถานะ:</b> ${o.status}<br>
      <b>ยอดรวม:</b> ${o.total} บาท
      <hr>
      ${o.items.map(i=>`${i.name} x${i.qty}`).join("<br>")}
    </div>`;
  });
}

/***************
 * ADMIN
 ***************/
function showAdminTab(tab){
  document.getElementById("adminDoing").classList.add("hidden");
  document.getElementById("adminDone").classList.add("hidden");

  document.getElementById("tabDoing").classList.remove("active");
  document.getElementById("tabDone").classList.remove("active");

  if(tab === "doing"){
    document.getElementById("adminDoing").classList.remove("hidden");
    document.getElementById("tabDoing").classList.add("active");
    loadAdminOrders("กำลังทำ");
  }else{
    document.getElementById("adminDone").classList.remove("hidden");
    document.getElementById("tabDone").classList.add("active");
    loadAdminOrders("เสร็จแล้ว");
  }
}

function loadAdminOrders(status){
  let orders = JSON.parse(localStorage.getItem("orders") || "[]");
  let target = status==="กำลังทำ"
    ? document.getElementById("adminDoing")
    : document.getElementById("adminDone");

  target.innerHTML = "";
  let filtered = orders.filter(o=>o.status === status);

  if(filtered.length === 0){
    target.innerHTML = "<p>ไม่มีออเดอร์</p>";
    return;
  }

  filtered.forEach(o=>{
    target.innerHTML += `
  <div class="bg-white rounded-xl shadow p-4 space-y-2">
    <div class="flex justify-between text-sm text-gray-600">
      <span>ลูกค้า: <b>${o.user}</b></span>
      <span>${o.date}</span>
    </div>

    <hr>

    <div class="text-sm">
      ${o.items.map(i =>
        `${i.name} x${i.qty} (${i.note || "-"})`
      ).join("<br>")}
    </div>

    <hr>

    <button
      onclick="toggleOrderStatus('${o.date}')"
      class="w-full py-2 rounded-lg text-white font-semibold
      ${status === "กำลังทำ"
        ? "bg-green-600 hover:bg-green-700"
        : "bg-orange-500 hover:bg-orange-600"}">
      ${status === "กำลังทำ"
        ? "ทำเสร็จแล้ว"
        : "ย้อนกลับเป็นกำลังทำ"}
    </button>
  </div>
`;

  });
}

function toggleOrderStatus(date){
  let orders = JSON.parse(localStorage.getItem("orders"));
  let i = orders.findIndex(o=>o.date === date);

  orders[i].status =
    orders[i].status === "กำลังทำ"
    ? "เสร็จแล้ว"
    : "กำลังทำ";

  localStorage.setItem("orders", JSON.stringify(orders));
  showAdminTab(orders[i].status === "กำลังทำ" ? "doing" : "done");
}

/***************
 * NOTIFICATION
 ***************/
let lastCount = Number(localStorage.getItem("lastOrderCount") || 0);

let lastOrderCount = Number(localStorage.getItem("lastOrderCount") || 0);

function startAdminWatcher(){

  // ขออนุญาตแจ้งเตือน
  if(Notification.permission !== "granted"){
    Notification.requestPermission();
  }

  setInterval(()=>{
    let orders = JSON.parse(localStorage.getItem("orders") || "[]");

    if(orders.length > lastOrderCount){

      new Notification("📢 ออเดอร์ใหม่!",{
        body: "มีออเดอร์ใหม่เข้ามา",
        icon: "icons/icon-192.png"
      });

      lastOrderCount = orders.length;
      localStorage.setItem("lastOrderCount", lastOrderCount);

      // รีเฟรชแท็บกำลังทำ
      showAdminTab("doing");
    }
  },3000);
}

function showPage(page){
  ["menu","cart","payment","orders"]
    .forEach(p=>document.getElementById(p).classList.add("hidden"));

  document.getElementById(page).classList.remove("hidden");

  if(page === "cart"){
    showCart();
  }

  // ⭐⭐ ใส่ตรงนี้ ⭐⭐
  if(page === "payment"){
    document.getElementById("paymentTotal").innerText =
      totalPrice + " บาท";
  }

  if(page === "orders"){
    loadCustomerOrders();
  }
}

function checkout() {
  if (cart.length === 0) {
    alert("❌ ยังไม่มีสินค้าในตะกร้า");
    return;
  }

  // คำนวณยอด
  let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  document.getElementById("paymentTotal").innerText =
    total + " บาท";

  showPage("payment");
}
