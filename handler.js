'use strict';
const connectToDatabase = require('./utils/dbConnect');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
require('dotenv').config({ path: './variables.env' });

module.exports.getShoppingCart = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase();
    const cart = await Cart.find().populate('product');

    return {
      statusCode: 200,
      body: JSON.stringify(cart)
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({
        error: 'Could not fetch cart',
        description: err.message
      })
    }
  }
};

module.exports.addProductToCart = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  let cartData = JSON.parse(event.body);
  if (!cartData) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'You must provide User and Product ID'
      })
    }
  }

  try {
    await connectToDatabase();
    const getCart = await Cart.findOne({product_id: cartData.product_id});
    cartData.product = cartData.product_id;
    let cart = {};

    if (!getCart) {
      cart = await Cart.create(cartData);
    } else {
      getCart.quantity += cartData.quantity;
      cart = await getCart.save();
    }

    return {
      statusCode: 200,
      body: JSON.stringify(cart)
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({
        error: 'Could not add product to cart.',
        description: err.message
      })
    }
  }
};

module.exports.removeProductToCart = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await connectToDatabase();

    const cart = await Cart.findByIdAndRemove(event.pathParameters.id);

    return {
      statusCode: 200,
      body: JSON.stringify(cart)
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({
        error: 'Could not delete product to cart.',
        description: err.message
      })
    }
  }
};

