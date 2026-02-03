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

// to get orders
export const getOrders = async (req, res, next) => {
  try {
    const { search = "", status } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;

    // acts as a filter
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { orderId: regex },
        { name: regex },
        { email: regex },
        { "items.name": regex },
      ];
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    const counts = orders.reduce(
      (acc, o) => {
        acc.totalOrders += 1;
        acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
        if (o.paymentStatus === "Unpaid") acc.pendingPayment += 1;
        return acc;
      },
      { totalOrders: 0, pendingPayment: 0 },
    );

    return res.json({
      success: true,
      counts: {
        totalOrders: counts.totalOrders,
        pending: counts.Pending || 0,
        processing: counts.Processing || 0,
        shipped: counts.Shipped || 0,
        delivered: counts.Delivered || 0,
        cancelled: counts.Cancelled || 0,
        pendingPayment: counts.pendingPayment,
      },
      orders,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    if (!req.user?._id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("Get User Orders error:");
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// to update the order
export const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    if (orderStatus === undefined) {
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true },
    );
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    return res.json({
      success: true,
      order: updated,
    });
  } catch (err) {
    next(err);
  }
};

// to delete an order
export const deleteOrder = async (req, res, next) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });

    return res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
