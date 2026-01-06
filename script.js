/***************
 * GLOBAL
 ***************/
let currentUser = localStorage.getItem("currentUser");
let cart = [];

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

  if(!u || !p) return alert("กรอกข้อมูลให้ครบ");
  if(u === "admin") return alert("ไม่สามารถใช้ชื่อนี้ได้");

  let users = JSON.parse(localStorage.getItem("users") || "{}");
  if(users[u]) return alert("มีผู้ใช้นี้แล้ว");

  users[u] = p;
  localStorage.setItem("users", JSON.stringify(users));

  alert("สมัครสมาชิกเรียบร้อยแล้ว ✅ กรุณาล็อกอิน");
  user.value = "";
  pass.value = "";
}

function login(){
  let u = user.value.trim();
  let p = pass.value.trim();

  if(!u || !p) return alert("กรอกชื่อผู้ใช้และรหัสผ่าน");

  if(u === "admin" && p === "admin123"){
    localStorage.setItem("currentUser","admin");
    location.href = "admin.html";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users") || "{}");
  if(users[u] !== p) return alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");

  localStorage.setItem("currentUser", u);
  location.href = "index.html";
}

function logout(){
  localStorage.removeItem("currentUser");
  location.href = "login.html";
}

function checkCustomer(){
  if(!currentUser || currentUser === "admin"){
    location.href = "login.html";
    return;
  }
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
    <div class="card">
      <h3>${m.name}</h3>
      <p>${m.price} บาท</p>

      <div class="qty-box">
        <button onclick="changeQty(${i},-1)">-</button>
        <span id="qty${i}">1</span>
        <button onclick="changeQty(${i},1)">+</button>
      </div>

      <textarea id="note${i}" placeholder="หมายเหตุ"></textarea>
      <button onclick="addCart(${i})">เพิ่มลงตะกร้า</button>
    </div>`;
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
  if(!cartList) return;

  cartList.innerHTML = "";
  let sum = 0;

  cart.forEach(c=>{
    let t = c.price * c.qty;
    sum += t;
    cartList.innerHTML += `
      <div class="card">
        <b>${c.name}</b><br>
        จำนวน: ${c.qty}<br>
        หมายเหตุ: ${c.note || "-"}<br>
        รวม: ${t} บาท
      </div>`;
  });

  totalEl.innerText = "รวมทั้งหมด " + sum + " บาท";
}

function checkout(){
  if(cart.length === 0) return alert("ตะกร้าว่าง");
  showPage("payment");
}

function confirmPayment(){
  let orders = JSON.parse(localStorage.getItem("orders") || "[]");

  orders.push({
    user: currentUser,
    items: cart,
    date: new Date().toLocaleString("th-TH"),
    status: "กำลังทำ"
  });

  localStorage.setItem("orders", JSON.stringify(orders));
  cart = [];

  alert("สั่งซื้อสำเร็จ 🎉");
  showPage("orders");
}

/***************
 * CUSTOMER ORDERS
 ***************/
function loadCustomerOrders(){
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
    <div class="card">
      <b>ลูกค้า:</b> ${o.user}<br>
      <b>เวลา:</b> ${o.date}<br>
      <hr>
      ${o.items.map(i=>`${i.name} x${i.qty} (${i.note||"-"})`).join("<br>")}
      <hr>
      <button onclick="toggleOrderStatus('${o.date}')">
        ${status==="กำลังทำ" ? "ทำเสร็จแล้ว" : "ย้อนกลับ"}
      </button>
    </div>`;
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

function showPage(page){ ["menu","cart","payment","orders"] .forEach(p=>document.getElementById(p).classList.add("hidden")); document.getElementById(page).classList.remove("hidden"); if(page==="cart") showCart(); if(page==="orders") loadOrders(); }