import Order from "../models/orderModel.js";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// to create a order
export const createOrder = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, address, notes } = req.body;

    let { items, paymentMethod } = req.body;

    if (!name || !email || !phoneNumber || !address) {
      return res.status(400).json({
        success: false,
        message: "Name, email, mobile and address are required.",
      });
    }

    const normalizedItems = items.map((it, idx) => {
      const productId = it.productId ?? it.id ?? it._id ?? null;
      const name = String(it.name ?? "");
      const img = it.img ?? null;
      const price = Number(it.price);
      const qty = Number(it.qty ?? it.quantity ?? 1);
      const description = String(it.description);

      return {
        productId: String(productId),
        name,
        img,
        price,
        qty,
        description,
      };
    });

    const normalizedPaymentMethod =
      paymentMethod === "Cash on Delivery" ? "Cash on Delivery" : "Online";

    const subtotal = normalizedItems.reduce(
      (s, it) => s + it.price * it.qty,
      0,
    );
    const taxRate = 0.08;
    const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));
    const shippingCharge = 0;
    const finalAmount = parseFloat(
      (subtotal + taxAmount + shippingCharge).toFixed(2),
    );

    const orderId = `ORD-${uuidv4()}`;
    const orderPayload = {
      orderId,
      user: req.user?._id || undefined,
      name,
      email,
      phoneNumber,
      address,
      items: normalizedItems,
      shippingCharge,
      totalAmount: subtotal,
      taxAmount,
      finalAmount,
      paymentMethod,
      paymentStatus: "Unpaid",
      notes: notes ?? undefined,
    };

    if (normalizedPaymentMethod === "Online") {
      const line_items = normalizedItems.map((it) => ({
        price_data: {
          currency: "pkr",
          product_data: { name: it.name },
          unit_amount: Math.round(it.price * 100),
        },
        quantity: it.qty,
      }));

      if (taxAmount > 0) {
        line_items.push({
          price_data: {
            currency: "pkr",
            product_data: { name: `Tax (${(taxRate * 100).toFixed(2)}%)` },
            unit_amount: Math.round(taxAmount * 100),
          },
          quantity: 1,
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items,
        customer_email: email,
        success_url: `${process.env.FRONTEND_URL}orders/success?session_id={CHECKOUT_SESSION_ID}&payment_status=success`,
        cancel_url: `${process.env.FRONTEND_URL}orders/cancel?payment_status=cancel`,
        metadata: { orderId },
      });

      const order = new Order({
        ...orderPayload,
        sessionId: session.id,
        paymentIntentId: session.payment_intent ?? undefined,
        paymentStatus: "Unpaid",
      });

      await order.save();

      return res.status(201).json({
        success: true,
        order,
        checkoutUrl: session.url,
      });
    }

    const order = new Order(orderPayload);
    await order.save();

    return res.status(201).json({
      success: true,
      order,
      checkoutUrl: null,
    });
  } catch (err) {
    if (err?.status) {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    next(err);
  }
};

// to confirm the payment done or not
export const confirmPayment = async (req, res, next) => {
  try {
    const { session_id } = req.params;
    if (!session_id)
      return res
        .status(400)
        .json({ success: false, message: "Session id is required." });

    if (!stripe)
      return res
        .status(500)
        .json({ success: false, message: "Stripe is not configured." });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Invalid session" });

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: true,
        message: "Payment not completed",
      });
    }

    const order = await Order.findOne(
      { sessionId: session_id },
      {
        paymentStatus: "Paid",
        paymentIntentId: session.payment_intent,
      },
      { new: true },
    );

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    return res.json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
};
