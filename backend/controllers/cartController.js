import catchAsync from "../utils/catchAsync.js";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import AppError from "../utils/appError.js";
export const getMyCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate({
    path: "items.product",
    select: "name price images stock",
  });

  if (!cart) {
    return res.status(200).json({
      status: "success",
      results: 0,
      data: { items: [] },
    });
  }

  res.status(200).json({
    status: "success",
    results: cart.items.length,
    data: cart,
  });
});

export const addItemToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity, operation } = req.body;
  const userId = req.user.id;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    if (quantity > product.stock) {
      return next(
        new AppError(`Only ${product.stock} items left in stock`, 400)
      );
    }

    cart = await Cart.create({
      user: userId,
      items: [{ product: productId, quantity }],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const currentInCart = cart.items[itemIndex].quantity;
      let newQuantity;

      if (operation === "add") {
        newQuantity = currentInCart + quantity;
      } else {
        newQuantity = quantity;
      }

      if (newQuantity > product.stock) {
        return next(
          new AppError(`Cannot add more. Max stock is ${product.stock}`, 400)
        );
      }

      cart.items[itemIndex].quantity = newQuantity;
    } else {
      if (quantity > product.stock) {
        return next(
          new AppError(`Only ${product.stock} items left in stock`, 400)
        );
      }
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
  }

  const updatedCart = await Cart.findById(cart._id).populate({
    path: "items.product",
    select: "name price image stock",
  });

  res.status(200).json({
    status: "success",
    data: updatedCart,
  });
});

export const removeItemFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    {
      $pull: { items: { product: productId } },
    },
    { returnDocument: "after" }
  ).populate({
    path: "items.product",
    select: "name price image stock",
  });

  if (!cart) {
    return next(new AppError("No cart found for this user", 404));
  }

  res.status(200).json({
    status: "success",
    data: cart,
  });
});

export const clearUserCart = async (userId, session = null) => {
  await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { items: [] } },
    { session }
  );
};
