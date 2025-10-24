import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useSearchParams } from 'react-router-dom';

// --- STYLING (for demonstration) ---
const styles = {
    nav: {
        background: '#333',
        padding: '1rem',
        textAlign: 'center'
    },
    navLink: {
        color: 'white',
        margin: '0 1rem',
        textDecoration: 'none',
        fontSize: '1.2rem'
    },
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: '#f4f7f6',
        fontFamily: 'sans-serif',
        padding: '2rem'
    },
    card: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        width: '300px',
        textAlign: 'center',
        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
        backgroundColor: 'white'
    },
    button: {
        backgroundColor: '#528FF0',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        marginTop: '10px'
    },
    purchased: {
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '5px',
        fontSize: '16px',
        fontWeight: 'bold',
        marginTop: '10px',
        cursor: 'default'
    },
    purchasesContainer: {
        padding: '2rem',
        textAlign: 'center'
    }
};

// --- Reusable Card Component ---
const Card = ({ product, checkoutHandler, isPurchased }) => {
    return (
        <div style={styles.card}>
            <img 
                src={product.imageUrl} 
                alt={product.name} 
                style={{ width: '100%', height: 'auto', borderRadius: '4px' }} 
            />
            <h3 style={{ margin: '15px 0' }}>{product.name}</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{product.price}</p>
            {isPurchased ? (
                <div style={styles.purchased}>
                    Purchased
                </div>
            ) : (
                <button 
                    style={styles.button}
                    onClick={() => checkoutHandler(product)}
                >
                    Buy Now
                </button>
            )}
        </div>
    );
};

// --- PAGES ---

// Home Page: Displays a list of products
const Home = ({ products, checkoutHandler, purchases }) => {
    return (
        <div style={{...styles.container, flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start'}}>
            {products.length > 0 ? (
                products.map(product => {
                    // For each product, check if it exists in the user's purchases
                    const isPurchased = purchases.some(p => p._id === product._id);
                    return (
                        <Card 
                            key={product._id}
                            product={product} 
                            checkoutHandler={checkoutHandler} 
                            isPurchased={isPurchased} 
                        />
                    );
                })
            ) : (
                <p>Loading products...</p>
            )}
        </div>
    );
};

// Payment Success Page
const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const referenceNum = searchParams.get("reference");
    return (
        <div style={{...styles.container, backgroundColor: '#eaf7e3'}}>
            <div style={{...styles.card, textAlign: 'center'}}>
                <h1 style={{ color: '#4CAF50' }}>Payment Successful!</h1>
                <p>Thank you for your purchase.</p>
                <p style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>
                    Reference No: <strong>{referenceNum}</strong>
                </p>
            </div>
        </div>
    );
};

// My Purchases Page
const MyPurchases = ({ purchases }) => (
    <div style={{...styles.container, flexDirection: 'column', alignItems: 'center'}}>
        <h1 style={{marginBottom: '2rem'}}>My Purchases</h1>
        {purchases.length > 0 ? (
            purchases.map(item => (
                <div key={item._id} style={{...styles.card, marginBottom: '1rem'}}>
                    <img src={item.imageUrl} alt={item.name} style={{width: '100%'}} />
                    <h3>{item.name}</h3>
                    <p>Price: ₹{item.price}</p>
                </div>
            ))
        ) : (
            <p>You have not made any purchases yet.</p>
        )}
    </div>
);


// --- Main App Component ---
function App2() {
    // --- STATE MANAGEMENT ---
    // In a real app, user ID would come from an authentication context
    const [currentUserId] = useState("68c183d3c9bcb894310ee08f"); // Hardcoded sample user _id from seed
    const [products, setProducts] = useState([]);
    const [purchases, setPurchases] = useState([]);

    // --- DATA FETCHING ---
    useEffect(() => {
        // Fetch all products to display
        axios.get("http://localhost:4000/api/products")
            .then(res => {
                if (res.data.products) {
                    setProducts(res.data.products);
                }
            })
            .catch(err => console.error("Error fetching products:", err));

        // Fetch user's purchases
        fetchPurchases();
    }, [currentUserId]);

    const fetchPurchases = () => {
        if (currentUserId) {
            axios.get(`http://localhost:4000/api/mypurchases/${currentUserId}`)
                .then(res => setPurchases(res.data.purchases))
                .catch(err => console.error("Error fetching purchases:", err));
        }
    };

    // --- PAYMENT LOGIC ---
    const checkoutHandler = async (productToBuy) => {
        try {
            const { data: { key } } = await axios.get("http://localhost:4000/api/getkey");
            const { data: { order } } = await axios.post("http://localhost:4000/api/checkout", {
                amount: productToBuy.price
            });

            const options = {
                key,
                amount: order.amount,
                currency: "INR",
                name: "My MERN App",
                description: `Payment for ${productToBuy.name}`,
                image: productToBuy.imageUrl,
                order_id: order.id,
                handler: async function (response) {
                    const verificationData = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        userId: currentUserId,
                        productId: productToBuy._id,
                        amount: productToBuy.price
                    };

                    const { data } = await axios.post("http://localhost:4000/api/paymentverification", verificationData);
                    
                    if(data.success) {
                        // Refresh purchases and navigate
                        fetchPurchases();
                        window.location.href = `/paymentsuccess?reference=${response.razorpay_payment_id}`;
                    } else {
                        alert("Payment verification failed. Please try again.");
                    }
                },
                prefill: { name: "Test User", email: "test@example.com", contact: "9999999999" },
                theme: { "color": "#3399cc" }
            };
            const razor = new window.Razorpay(options);
            razor.open();
        } catch (error) {
            console.error("Payment initiation failed:", error);
        }
    };

    return (
        <Router>
            <nav style={styles.nav}>
                <Link to="/" style={styles.navLink}>Home</Link>
                <Link to="/mypurchases" style={styles.navLink}>My Purchases</Link>
            </nav>
            <Routes>
                <Route 
                    path="/" 
                    element={<Home 
                        products={products} 
                        checkoutHandler={checkoutHandler} 
                        purchases={purchases} 
                    />} 
                />
                <Route path="/paymentsuccess" element={<PaymentSuccess />} />
                <Route path="/mypurchases" element={<MyPurchases purchases={purchases} />} />
            </Routes>
        </Router>
    );
}

export default App2;

