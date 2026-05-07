import styles from "./Cart.module.css";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { CartItem } from "../../pages/Cart/CartItem";

export const Cart = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "A Little Life",
      price: 564,
      oldPrice: 699,
      image: "https://via.placeholder.com/80",
      quantity: 1,
    },
  ]);

  // 🔥 Quantity handlers
  const increaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleDelete = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // 🔥 Total calculation
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 🔥 Load Razorpay
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 🔥 Handle Payment
  const handlePayment = async () => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      alert("Razorpay failed to load");
      return;
    }

    try {
      // 1. Create order — send transaction_id, not amount
      const res = await fetch("http://localhost:3000/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${yourAuthToken}`, // required — backend reads req.user
        },
        body: JSON.stringify({
          transaction_id: yourTransactionId, // pass this as a prop or from context
        }),
      });

      const data = await res.json();

      const options = {
        key: data.key_id,           // ✅ use key from backend, not hardcoded
        amount: data.amount,
        currency: data.currency,
        name: "BookABook",
        description: "Order Payment",
        order_id: data.order_id,    // ✅ was data.id — backend returns order_id

        handler: async function (response) {
          // 2. Verify payment — this is what actually marks the transaction active
          try {
            const verifyRes = await fetch(
              "http://localhost:3000/api/payments/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${yourAuthToken}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  transaction_id: data.transaction_id,
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              alert("Payment Successful ✅");
              navigate("/orders"); // or wherever after payment
            } else {
              alert(`Verification failed: ${verifyData.error}`);
            }
          } catch (err) {
            console.error("Verify error:", err);
            alert("Payment verification failed");
          }
        },

        prefill: {
          name: "Saurabh",
          email: "test@gmail.com",
        },
        theme: {
          color: "#ff6b00",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  return (
    <div className={styles.cart}>
      {/* Header */}
      <div className={styles.header}>
        <h2>
          My Cart{" "}
          <span className={styles.count}>{cartItems.length}</span>
        </h2>
        <RxCross2
          className={styles.close}
          onClick={() => {
            navigate("/");
          }}
        />
      </div>

      {/* Items */}
      {cartItems.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onDelete={handleDelete}
          onIncrease={increaseQty}
          onDecrease={decreaseQty}
        />
      ))}

      <hr />

      {/* Total */}
      <div style={{ padding: "10px", fontWeight: "bold" }}>
        Total: ₹{totalAmount}
      </div>

      {/* Pay Button */}
      <div className={styles.cta}>
        <button className={styles.ctabtn} onClick={handlePayment}>
          Pay Now
        </button>
      </div>
    </div>
  );
};