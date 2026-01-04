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

function logout(){
localStorage.removeItem("currentUser");
location.href="login.html";
}

function showPage(page){
["menu","cart","payment","orders"]
.forEach(p=>document.getElementById(p).classList.add("hidden"));
document.getElementById(page).classList.remove("hidden");
if(page==="cart") showCart();
if(page==="orders") loadOrders();
}

function loadMenu(){
menuList.innerHTML="";
menus.forEach((m,i)=>{
menuList.innerHTML+=`
<div class="card">
<h3>${m.name}</h3>
<p>${m.price} บาท</p>

<div class="qty-box">
<button onclick="changeQty(${i},-1)">-</button>
<span id="qty${i}">1</span>
<button onclick="changeQty(${i},1)">+</button>
</div>

<textarea id="note${i}" placeholder="หมายเหตุ เช่น ไม่ใส่น้ำตาล"></textarea>

<button onclick="addCart(${i})">เพิ่มลงตะกร้า</button>
</div>`;
});
}

let qty = {};

function changeQty(i,val){
qty[i]=(qty[i]||1)+val;
if(qty[i]<1) qty[i]=1;
document.getElementById("qty"+i).innerText=qty[i];
}

function addCart(i){
let q=qty[i]||1;
let note=document.getElementById("note"+i).value;
cart.push({
name:menus[i].name,
price:menus[i].price,
qty:q,
note:note
});
alert("เพิ่มสินค้าแล้ว");
document.getElementById("note"+i).value="";
qty[i]=1;
document.getElementById("qty"+i).innerText=1;
}

function showCart(){
cartList.innerHTML="";
let sum=0;
cart.forEach(c=>{
let total=c.price*c.qty;
sum+=total;
cartList.innerHTML+=`
<div class="card">
<b>${c.name}</b><br>
จำนวน: ${c.qty}<br>
หมายเหตุ: ${c.note||"-"}<br>
รวม: ${total} บาท
</div>`;
});
total.innerText="รวมทั้งหมด "+sum+" บาท";
}

function checkout(){
if(cart.length===0) return alert("ตะกร้าว่าง");
showPage("payment");
}

function confirmPayment(){
let orders = JSON.parse(localStorage.getItem("orders") || "[]");

orders.push({
user: currentUser,
items: cart,
date: new Date().toLocaleString(),
status: "กำลังทำ"
});

localStorage.setItem("orders", JSON.stringify(orders));
cart = [];

alert("สั่งซื้อสำเร็จ 🎉");
showPage("orders");
}

function loadOrders(){
  // ⭐ ดึง currentUser ใหม่ทุกครั้ง
  currentUser = localStorage.getItem("currentUser");

  let orderListEl = document.getElementById("orderList");
  if(!orderListEl) return;

  orderListEl.innerHTML="";
  let orders = JSON.parse(localStorage.getItem("orders") || "[]");

  if(orders.length === 0){
    orderListEl.innerHTML = "<p>ยังไม่มีคำสั่งซื้อ</p>";
    return;
  }

  orders.forEach((o,index)=>{
    // 🔥 แอดมินเห็นทุกออเดอร์
    if(currentUser !== "admin" && o.user !== currentUser) return;

    let statusColor = o.status==="เสร็จแล้ว" ? "green" : "orange";

    orderListEl.innerHTML += `
    <div class="card">
      <b>ลูกค้า:</b> ${o.user}<br>
      <b>เวลา:</b> ${o.date}<br>
      <b>สถานะ:</b>
      <span style="color:${statusColor}">${o.status}</span>
      <hr>
      ${o.items.map(i=>`${i.name} x${i.qty} (${i.note||"-"})`).join("<br>")}

      ${ currentUser==="admin" ? `
      <hr>
      <button onclick="updateStatus(${index})">
        ${o.status==="กำลังทำ" ? "ทำเสร็จแล้ว" : "กำลังทำ"}
      </button>
      ` : "" }
    </div>`;
  });
}

function register(){
  let u = user.value;
  let p = pass.value;

  if(!u || !p){
    alert("กรอกข้อมูลให้ครบ");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users") || "{}");

  if(users[u]){
    alert("มีผู้ใช้นี้แล้ว");
    return;
  }

  users[u] = p;

  localStorage.setItem("users", JSON.stringify(users));

  alert("สมัครสมาชิกเรียบร้อยแล้ว ✅ กรุณาล็อกอิน");

  user.value = "";
  pass.value = "";

  if(u==="admin"){
  alert("ไม่สามารถใช้ชื่อนี้ได้");
  return;
    }
}

function login(){
  let u = user.value.trim();
  let p = pass.value.trim();

  if(!u || !p){
    alert("กรอกชื่อผู้ใช้และรหัสผ่าน");
    return;
  }

  // 🔐 แอดมิน
  if(u==="admin" && p==="admin123"){
    localStorage.setItem("currentUser","admin");
    alert("เข้าสู่ระบบแอดมิน");
    location.href="admin.html";
    return;
  }

  // 👤 ลูกค้า
  let users = JSON.parse(localStorage.getItem("users") || "{}");

  if(users[u] !== p){
    alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    return;
  }

  localStorage.setItem("currentUser", u);
  alert("เข้าสู่ระบบสำเร็จ");
  location.href="index.html";
}


function updateStatus(index){
let orders = JSON.parse(localStorage.getItem("orders"));
orders[index].status =
orders[index].status==="กำลังทำ" ? "เสร็จแล้ว" : "กำลังทำ";
localStorage.setItem("orders", JSON.stringify(orders));
loadOrders();
}

function checkCustomer(){
if(!currentUser || currentUser==="admin"){
location.href="login.html";
return;
}
loadMenu();   // ⭐ สำคัญมาก
}

function checkAdmin(){
if(currentUser!=="admin"){
location.href="login.html";
}
}

function showAdminTab(tab){
document.getElementById("adminDoing").classList.add("hidden");
document.getElementById("adminDone").classList.add("hidden");

document.getElementById("tabDoing").classList.remove("active");
document.getElementById("tabDone").classList.remove("active");

if(tab==="doing"){
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
currentUser = localStorage.getItem("currentUser");
if(currentUser!=="admin") return;

let orders = JSON.parse(localStorage.getItem("orders") || "[]");

let target =
status==="กำลังทำ"
? document.getElementById("adminDoing")
: document.getElementById("adminDone");

target.innerHTML="";

let filtered = orders.filter(o=>o.status===status);

if(filtered.length===0){
target.innerHTML="<p>ไม่มีออเดอร์</p>";
return;
}

filtered.forEach((o,index)=>{
target.innerHTML += `
<div class="card">
<b>ลูกค้า:</b> ${o.user}<br>
<b>เวลา:</b> ${o.date}<br>
<hr>
${o.items.map(i=>`${i.name} x${i.qty} (${i.note||"-"})`).join("<br>")}
<hr>
<button onclick="toggleOrderStatus(${getRealIndex(o)})">
${status==="กำลังทำ" ? "ทำเสร็จแล้ว" : "ย้อนกลับเป็นกำลังทำ"}
</button>
</div>
`;
});
}

function toggleOrderStatus(realIndex){
let orders = JSON.parse(localStorage.getItem("orders"));
orders[realIndex].status =
orders[realIndex].status==="กำลังทำ"
? "เสร็จแล้ว"
: "กำลังทำ";

localStorage.setItem("orders", JSON.stringify(orders));

// รีโหลดแท็บปัจจุบัน
showAdminTab(
orders[realIndex].status==="กำลังทำ"
? "doing"
: "done"
);
}

function getRealIndex(order){
let orders = JSON.parse(localStorage.getItem("orders") || "[]");
return orders.findIndex(o =>
o.user===order.user &&
o.date===order.date
);
}

