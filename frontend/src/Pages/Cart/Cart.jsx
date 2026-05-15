import styles from "./Cart.module.css";
import { RxCross2 } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { CartItem } from "../../pages/Cart/CartItem";
import axios from "axios";
import { Navbar } from "../../components/Navbar/Navbar";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export const Cart = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // The home page should navigate here with:
  //   navigate("/cart", { state: { transactionId } })
  const incomingTransactionId = location.state?.transactionId ?? null;

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [paying, setPaying]       = useState(null);

  // ── 1. Fetch the single pending transaction passed from the home page ────────
  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (!incomingTransactionId) {
          // No transaction passed — cart is empty
          setCartItems([]);
          return;
        }

        // Fetch the specific transaction
        const { data: tx } = await api.get(`/transactions/${incomingTransactionId}`);

        // Fetch book copy images
        let imageUrl = "https://via.placeholder.com/80";
        try {
          const { data: imgData } = await api.get(`/copies/${tx.book_copy_id}/images`);
          if (imgData?.copy_images?.length > 0) {
            imageUrl = imgData.copy_images[0].image_url;
          }
        } catch {
          // image fetch failure is non-fatal; keep placeholder
        }

        setCartItems([
          {
            id:               tx.id,
            book_copy_id:     tx.book_copy_id,
            title:            tx.book_title,       // CartItem reads item.title
            author:           tx.book_author,
            buy_price:        Number(tx.amount),   // CartItem reads item.buy_price
            transaction_type: tx.transaction_type,
            rent_start_date:  tx.rent_start_date,
            rent_end_date:    tx.rent_end_date,
            rent_price_per_day: tx.rent_price_per_day, // CartItem reads item.rent_price_per_day
            status:           tx.status,           // CartItem reads item.status
            image_url:        imageUrl,            // CartItem reads item.image_url
          },
        ]);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [incomingTransactionId]);

  // ── 2. Cancel (remove) a pending transaction ────────────────────────────────
  const handleDelete = async (transactionId) => {
    if (!window.confirm("Remove this item from cart?")) return;
    try {
      await api.patch(`/transactions/${transactionId}/cancel`, {
        reason: "Removed from cart",
      });
      setCartItems([]);
    } catch (err) {
      alert(`Could not remove item: ${err.response?.data?.error || err.message}`);
    }
  };

  // ── 3. Razorpay loader ──────────────────────────────────────────────────────
  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s       = document.createElement("script");
      s.src         = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload      = () => resolve(true);
      s.onerror     = () => resolve(false);
      document.body.appendChild(s);
    });

  // ── 4. Pay for the transaction ───────────────────────────────────────────────
  const handlePayment = async (transactionId) => {
    const loaded = await loadRazorpay();
    if (!loaded) return alert("Razorpay SDK failed to load.");

    setPaying(transactionId);

    try {
      // Step A — create Razorpay order
      const { data: orderData } = await api.post("/api/payments/create-order", {
        transaction_id: transactionId,
      });

      // Step B — open Razorpay checkout
      const options = {
        key:         orderData.key_id,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        "BookABook",
        description: cartItems.find((i) => i.id === transactionId)?.title ?? "Order",
        order_id:    orderData.order_id,

        handler: async (response) => {
          // Step C — verify payment
          try {
            await api.post("/api/payments/verify", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              transaction_id:      orderData.transaction_id,
            });

            alert("Payment Successful ✅");
            navigate("/orders");
          } catch (err) {
            alert(`Verification failed: ${err.response?.data?.error || err.message}`);
          } finally {
            setPaying(null);
          }
        },

        modal: {
          ondismiss: () => setPaying(null),
        },

        prefill: { name: "", email: "" },
        theme:   { color: "#ff6b00" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      alert(`Payment failed: ${err.response?.data?.error || err.message}`);
      setPaying(null);
    }
  };

  // ── 5. Total ────────────────────────────────────────────────────────────────
  const totalAmount = cartItems.reduce((sum, i) => sum + i.buy_price, 0);

  // ── 6. Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className={styles.cart}>
        <div className={styles.header}>
          <h2>
            My Cart <span className={styles.count}>{cartItems.length}</span>
          </h2>
          <RxCross2 className={styles.close} onClick={() => navigate("/")} />
        </div>

        {loading && <p style={{ padding: "10px" }}>Loading cart…</p>}
        {error   && <p style={{ padding: "10px", color: "red" }}>{error}</p>}

        {!loading && !error && cartItems.length === 0 && (
          <p style={{ padding: "10px" }}>Your cart is empty.</p>
        )}

        {cartItems.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onDelete={() => handleDelete(item.id)}
          />
        ))}

        {cartItems.length > 0 && (
          <>
            <hr />
            <div style={{ padding: "10px", fontWeight: "bold" }}>
              Total: ₹{totalAmount}
            </div>
            <div className={styles.cta}>
              {cartItems.map((item) => (
                <button
                  key={item.id}
                  className={styles.ctabtn}
                  disabled={paying === item.id}
                  onClick={() => handlePayment(item.id)}
                >
                  {paying === item.id
                    ? "Processing…"
                    : `Pay ₹${item.buy_price} — ${item.title}`}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};