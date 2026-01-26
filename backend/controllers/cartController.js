import cartModel from "../models/cartModel.js";

// to add watch to cart
export async function addToCart(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { productId, quantity, name, img, price, description } = req.body;
    if (!productId || !name || !img || !price) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const itemPayload = {
      productId,
      name,
      img,
      price,
      qty: quantity,
      description,
    };

    let cart = await cartModel.findOne({ user: userId });

    // addToCart
    if (!cart) {
      cart = await cartModel.create({ user: userId, items: [itemPayload] });
    } else {
      const idx = cart.items.findIndex(
        (it) => String(it.productId) === String(productId),
      );
      if (idx > -1)
        cart.items[idx].qty = (Number(cart.items[idx].qty) || 0) + quantity;
      else cart.items.push(itemPayload);
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error("addToCart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
}
