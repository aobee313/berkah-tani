// Load produk dari Local Storage atau default
let products = JSON.parse(localStorage.getItem('products')) || [
    { id: 1, name: "Pupuk Urea 50kg", price: 500000, stock: 20 },
    { id: 2, name: "Pupuk NPK 25kg", price: 300000, stock: 15 },
    { id: 3, name: "Pupuk Organik 20kg", price: 150000, stock: 30 },
    { id: 4, name: "Pupuk ZA 50kg", price: 450000, stock: 10 }
];

let cart = [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Simpan produk ke Local Storage
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

// Render produk POS
function renderProducts(filter="") {
    const list = document.getElementById('product-list');
    list.innerHTML = '';
    products
        .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(p => {
            const div = document.createElement('div');
            div.className = "col-6";
            div.innerHTML = `
                <div class="card p-2">
                    <div class="card-body text-center">
                        <h6>${p.name}</h6>
                        <p>Rp ${p.price} <br> Stok: ${p.stock}</p>
                        <button class="btn btn-sm btn-success" onclick="addToCart(${p.id})" ${p.stock===0?'disabled':''}>Tambah</button>
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
}

// Keranjang
function addToCart(id) {
    const p = products.find(pr => pr.id===id);
    if(p.stock<=0) return alert("Stok habis!");
    const item = cart.find(i=>i.id===id);
    if(item){
        if(item.quantity < p.stock){ item.quantity++; item.subtotal = item.price*item.quantity; }
        else alert("Stok tidak cukup!");
    } else { cart.push({id:p.id,name:p.name,price:p.price,quantity:1,subtotal:p.price}); }
    renderCart();
}

// Render keranjang
function renderCart() {
    const tbody = document.getElementById('cart-body');
    tbody.innerHTML = '';
    let total = 0;
    cart.forEach(item=>{
        total += item.subtotal;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${item.name}</td><td>${item.price}</td><td>${item.quantity}</td><td>${item.subtotal}</td><td><button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">Hapus</button></td>`;
        tbody.appendChild(tr);
    });
    document.getElementById('total').textContent = total;
    renderProducts();
}

// Hapus dari keranjang
function removeFromCart(id){ cart = cart.filter(i=>i.id!==id); renderCart(); }

// Checkout
function checkout(){
    const payment = parseInt(document.getElementById('payment').value);
    const total = cart.reduce((sum,i)=>sum+i.subtotal,0);
    if(cart.length===0) return alert("Keranjang kosong!");
    if(payment<total) return alert("Uang tidak cukup!");
    const change = payment - total;
    document.getElementById('change').textContent = `Kembalian: Rp ${change}`;
    cart.forEach(item=>{ const p = products.find(pr=>pr.id===item.id); p.stock-=item.quantity; });
    saveProducts();
    const transaction = { date:new Date().toLocaleString(), items:[...cart], total, payment, change };
    transactions.push(transaction);
    localStorage.setItem('transactions',JSON.stringify(transactions));
    renderTransactions();
    printReceipt(transaction);
    cart=[]; document.getElementById('payment').value=''; renderCart();
}

// Cetak struk
function printReceipt(t){
    let receipt = `<h3>STRUK BERKAH TANI</h3><p>Tanggal: ${t.date}</p><hr>`;
    t.items.forEach(i=>receipt+=`<p>${i.name} x${i.quantity} = Rp ${i.subtotal}</p>`);
    receipt+=`<hr><p>Total: Rp ${t.total}</p><p>Bayar: Rp ${t.payment}</p><p>Kembalian: Rp ${t.change}</p>`;
    const w=window.open('','_blank','width=400,height=600'); w.document.write(receipt); w.document.close(); w.print();
}

// Riwayat transaksi
function renderTransactions(){
    const list = document.getElementById('transaction-history');
    list.innerHTML = '';
    transactions.slice().reverse().forEach((t,i)=>{
        const li = document.createElement('li');
        li.className="list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML=`${t.date} - Total: Rp ${t.total} <button class="btn btn-sm btn-danger" onclick="deleteTransaction(${transactions.length-1-i})">Hapus</button>`;
        list.appendChild(li);
    });
}

// Hapus transaksi
function deleteTransaction(idx){
    if(!confirm("Yakin ingin menghapus transaksi ini?")) return;
    transactions.splice(idx,1);
    localStorage.setItem('transactions',JSON.stringify(transactions));
    renderTransactions();
}

// Pencarian produk
function searchProduct(){ renderProducts(document.getElementById('search').value); }

// Admin Panel
function renderAdminProducts(){
    const tbody = document.getElementById('admin-product-list');
    tbody.innerHTML='';
    products.forEach(p=>{
        const tr = document.createElement('tr');
        tr.innerHTML=`
            <td><input type="text" class="form-control" value="${p.name}" onchange="updateProduct(${p.id}, 'name', this.value)"></td>
            <td><input type="number" class="form-control" value="${p.price}" onchange="updateProduct(${p.id}, 'price', this.value)"></td>
            <td><input type="number" class="form-control" value="${p.stock}" onchange="updateProduct(${p.id}, 'stock', this.value)"></td>
            <td><button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Hapus</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Update produk
function updateProduct(id, field, value){
    const p = products.find(pr=>pr.id===id);
    if(field==='price'||field==='stock') value=parseInt(value);
    p[field]=value;
    saveProducts();
    renderProducts();
}

// Hapus produk
function deleteProduct(id){
    if(!confirm("Yakin ingin menghapus produk ini?")) return;
    products=products.filter(p=>p.id!==id);
    saveProducts(); renderProducts(); renderAdminProducts();
}

// Tambah produk baru
function addNewProduct(){
    const name=document.getElementById('new-name').value.trim();
    const price=parseInt(document.getElementById('new-price').value);
    const stock=parseInt(document.getElementById('new-stock').value);
    if(!name||isNaN(price)||isNaN(stock)) return alert("Isi semua kolom!");
    const id=products.length>0?Math.max(...products.map(p=>p.id))+1:1;
    products.push({id,name,price,stock});
    saveProducts();
    document.getElementById('new-name').value=''; document.getElementById('new-price').value=''; document.getElementById('new-stock').value='';
    renderProducts(); renderAdminProducts();
}

// Inisialisasi
renderProducts();
renderCart();
renderTransactions();
renderAdminProducts();