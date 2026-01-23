import React, { useState } from "react";
import cartPageStyles from "../assets/dummyStyles";
import { useCart } from "../CartContext";
import { toast, ToastContainer } from "react-toastify";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const CartPage = () => {
  const {
    cart,
    increment,
    decrement,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  // checkout form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const handleMobileChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 11); // limit to 11 digits
    setMobile(digitsOnly);
  };

  const isFormValid = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !address.trim() ||
      !mobile.trim() ||
      !paymentMethod.trim()
    ) {
      return false;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const phoneOk = /^[0-9]{11}$/.test(mobile.replace(/\s+/g, "")); // STRICT 11 digits
    return emailOk && phoneOk;
  };

  const processPayment = (method) => {
    if (method === "Cash on Delivery") return true;
    if (method === "Online") {
      return Math.random() < 0.75;
    }
    return false;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error("Please fill all required fields correctly.", {
        position: "top-right",
      });
      return;
    }

    if (!cart.length) {
      toast.error("Your cart is empty.", { position: "top-right" });
      return;
    }

    const paymentOk = processPayment(paymentMethod);

    if (paymentOk) {
      clearCart();

      setName("");
      setEmail("");
      setAddress("");
      setMobile("");
      setNote("");
      setPaymentMethod("");

      toast.success("Payment successful — order completed.", {
        position: "top-right",
      });
      return;
    } else {
      toast.error("Payment failed. Please try again.", {
        position: "top-right",
      });
      return;
    }
  };

  if (!cart.length) {
    return (
      <>
        <ToastContainer />
        <div className={cartPageStyles.emptyCartContainer}>
          <div className={cartPageStyles.emptyCartCard}>
            <ShoppingBag size={48} className={cartPageStyles.emptyCartIcon} />
            <h2 className={cartPageStyles.emptyCartTitle}>
              Your cart is empty
            </h2>
            <p className={cartPageStyles.emptyCartText}>
              Looks like you haven't added any watches to your cart yet.
            </p>

            <Link to={"/watches"} className={cartPageStyles.emptyCartButton}>
              Browse Watches
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />

      <div className={cartPageStyles.pageContainer}>
        <div className={cartPageStyles.maxWidthContainer}>
          <div className={cartPageStyles.headerContainer}>
            <div className={cartPageStyles.backButtonContainer}>
              <Link to={"/watches"} className={cartPageStyles.backLink}>
                <div className={cartPageStyles.backIconContainer}>
                  <ArrowLeft size={20} />
                </div>
                <span className={cartPageStyles.backText}>Back to Watches</span>
              </Link>
            </div>
            <h1 className={cartPageStyles.cartTitle}>Your Shopping Cart</h1>
            <button
              onClick={clearCart}
              className={cartPageStyles.clearCartButton}
            >
              <Trash2 size={18} />
              Clear Cart
            </button>
          </div>

          <div className={cartPageStyles.mainGrid}>
            <div className={cartPageStyles.leftColumn}>
              <div className={cartPageStyles.formContainer}>
                <h2 className={cartPageStyles.formTitle}>Enter your details</h2>
                <p className={cartPageStyles.formSubtitle}>
                  All fields are required
                </p>

                <form onSubmit={handleSubmit} className={cartPageStyles.form}>
                  <div className={cartPageStyles.inputGrid}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="FullName"
                      className={cartPageStyles.inputBase}
                      required
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className={cartPageStyles.inputBase}
                      required
                    />
                  </div>

                  <input
                    type="text"
                    value={mobile}
                    onChange={handleMobileChange}
                    placeholder="Mobile number (11 digits only)"
                    className={cartPageStyles.inputBase}
                    required
                  />

                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address"
                    rows={3}
                    className={cartPageStyles.textareaBase}
                    required
                  ></textarea>

                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={cartPageStyles.selectBase}
                    required
                  >
                    <option value="">Select Payment Method</option>
                    <option value="Online">Online</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>

                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Message / delivery instructions"
                    rows={2}
                    className={cartPageStyles.textareaBase}
                    required
                  ></textarea>

                  <div className={cartPageStyles.formButtonsContainer}>
                    <button
                      type="submit"
                      className={cartPageStyles.submitButton}
                    >
                      Submit Order
                    </button>

                    <Link
                      to="/"
                      className={cartPageStyles.continueShoppingButton}
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </form>
              </div>
              {/* Cart Items */}
              <div className={cartPageStyles.cartItemsGrid}>
                {cart.map((item) => (
                  <div key={item.id} className={cartPageStyles.cartItemCard}>
                    <div className={cartPageStyles.cartItemImageContainer}>
                      <img
                        src={item.img}
                        alt={item.name}
                        className={cartPageStyles.cartItemImage}
                      />
                    </div>

                    <div className={cartPageStyles.cartItemContent}>
                      <h3 className={cartPageStyles.cartItemName}>
                        {item.name}
                      </h3>
                      <p className={cartPageStyles.cartItemPrice}>
                        {item.price}
                      </p>

                      <div className={cartPageStyles.quantityContainer}>
                        <div className={cartPageStyles.quantityControls}>
                          <button
                            onClick={() => decrement(item.id)}
                            className={cartPageStyles.quantityButton}
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus size={16} />
                          </button>
                          <span className={cartPageStyles.quantityText}>
                            {item.qty}
                          </span>
                          <button
                            onClick={() => increment(item.id)}
                            className={cartPageStyles.quantityButton}
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className={cartPageStyles.removeButton}
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className={cartPageStyles.orderSummaryContainer}>
              <h2 className={cartPageStyles.orderSummaryTitle}>
                Order Summary
              </h2>

              <div className={cartPageStyles.orderSummaryContent}>
                <div className={cartPageStyles.summaryRow}>
                  <span className={cartPageStyles.summaryLabel}>
                    Subtotal ({totalItems} items)
                  </span>
                  <span className={cartPageStyles.summaryValue}>
                    {totalPrice.toFixed(2)}
                  </span>
                </div>

                <div className={cartPageStyles.summaryRow}>
                  <span className={cartPageStyles.summaryLabel}>Shipping</span>
                  <span className={cartPageStyles.summaryValue}>Free</span>
                </div>

                <div className={cartPageStyles.summaryRow}>
                  <span className={cartPageStyles.summaryLabel}>Tax (8%)</span>
                  <span className={cartPageStyles.summaryValue}>
                    {(totalPrice * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className={cartPageStyles.totalContainer}>
                <span>Total</span>
                <span>{(totalPrice * 1.08).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
