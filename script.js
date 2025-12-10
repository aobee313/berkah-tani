// Produk dengan stok
let products = [
    { id: 1, name: "Pupuk Urea 50kg", price: 500000, stock: 20 },
    { id: 2, name: "Pupuk NPK 25kg", price: 300000, stock: 15 },
    { id: 3, name: "Pupuk Organik 20kg", price: 150000, stock: 30 },
    { id: 4, name: "Pupuk ZA 50kg", price: 450000, stock: 10 }
];

let cart = [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Render Produk
function renderProducts(filter = "") {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    products
        .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(product => {
            const div = document.createElement('div');
            div.className = "col-6";
            div.innerHTML = `
                <div class="card p-2">
                    <div class="card-body text-center">
                        <h6>${product.name}</h6>
                        <p>Rp ${product.price} <br> Stok: ${product.stock}</p>
                        <button class="btn btn-sm btn-success" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>Tambah</button>
                    </div>
                </div>
            `;
            productList.appendChild(div);
        });
}

// Tambah ke Keranjang
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (product.stock <= 0) return alert("Stok habis!");
    
    const item = cart.find(i => i.id === id);
    if (item) {
        if (item.quantity < product.stock) {
            item.quantity += 1;
            item.subtotal = item.quantity * item.price;
        } else {
            alert("Stok tidak cukup!");
        }
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1, subtotal: product.price });
    }
    renderCart();
}

// Render Keranjang
function renderCart() {
    const cartBody = document.getElementById('cart-body');
    cartBody.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.subtotal;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.price}</td>
            <td>${item.quantity}</td>
            <td>${item.subtotal}</td>
            <td><button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">Hapus</button></td>
        `;
        cartBody.appendChild(tr);
    });

    document.getElementById('total').textContent = total;
    renderProducts();
}

// Hapus item
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}

// Checkout
function checkout() {
    const payment = parseInt(document.getElementById('payment').value);
    const total = cart.reduce((sum, i) => sum + i.subtotal, 0);
    if (cart.length === 0) return alert("Keranjang kosong!");
    if (payment < total) return alert("Uang tidak cukup!");

    const change = payment - total;
    document.getElementById('change').textContent = `Kembalian: Rp ${change}`;

    // Update stok
    cart.forEach(item => {
        const p = products.find(prod => prod.id === item.id);
        p.stock -= item.quantity;
    });

    // Simpan transaksi
    const transaction = {
        date: new Date().toLocaleString(),
        items: [...cart],
        total, payment, change
    };
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderTransactions();

    // Cetak struk
    printReceipt(transaction);

    cart = [];
    document.getElementById('payment').value = '';
    renderCart();
}

// Cetak struk rapi
function printReceipt(t) {
    let receipt = `<h3>STRUK BERKAH TANI</h3><p>Tanggal: ${t.date}</p><hr>`;
    t.items.forEach(i => {
        receipt += `<p>${i.name} x${i.quantity} = Rp ${i.subtotal}</p>`;
    });
    receipt += `<hr><p>Total: Rp ${t.total}</p><p>Bayar: Rp ${t.payment}</p><p>Kembalian: Rp ${t.change}</p>`;
    const newWindow = window.open('', '', 'width=400,height=600');
    newWindow.document.write(receipt);
    newWindow.document.close();
    newWindow.print();
}

// Render Riwayat Transaksi
function renderTransactions() {
    const history = document.getElementById('transaction-history');
    history.innerHTML = '';
    transactions.slice().reverse().forEach((t, index) => {
        const li = document.createElement('li');
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            ${t.date} - Total: Rp ${t.total}
            <button class="btn btn-sm btn-danger" onclick="deleteTransaction(${transactions.length - 1 - index})">Hapus</button>
        `;
        history.appendChild(li);
    });
}

// Hapus transaksi
function deleteTransaction(idx) {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    transactions.splice(idx,1);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderTransactions();
}

// Cari produk
function searchProduct() {
    const query = document.getElementById('search').value;
    renderProducts(query);
}

// Inisialisasi
renderProducts();
renderCart();
renderTransactions();