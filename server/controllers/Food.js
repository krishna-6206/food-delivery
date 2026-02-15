import mongoose from "mongoose";
import Food from "../models/Food.js";
import createError from "../utils/createError.js"; // added missing import

export const addProducts = async (req, res, next) => {
  try {
    const foodData = req.body;

    if (!Array.isArray(foodData)) {
      return next(
        createError(400, "Invalid request. Expected an array of foods.")
      );
    }

    let createdfoods = [];

    for (const foodInfo of foodData) {
      const { name, desc, img, price, ingredients, category } = foodInfo;

      const product = new Food({
        name,
        desc,
        img,
        price,
        ingredients,
        category,
      });

      const createdFood = await product.save(); // fixed variable name
      createdfoods.push(createdFood);
    }

    return res.status(201).json({
      message: "Products added successfully",
      createdfoods,
    });

  } catch (err) {
    next(err);
  }
};

export const getFoodItems = async (req, res, next) => {
  try {
    let { categories, minPrice, maxPrice, ingredients, search } = req.query;

    // safely convert to arrays
    if (categories) categories = categories.split(",");
    if (ingredients) ingredients = ingredients.split(",");

    const filter = {};

    if (categories?.length) {
      filter.category = { $in: categories };
    }

    if (ingredients?.length) {
      filter.ingredients = { $in: ingredients };
    }

    if (minPrice || maxPrice) {
      filter["price.org"] = {};

      if (minPrice) {
        filter["price.org"]["$gte"] = parseFloat(minPrice);
      }

      if (maxPrice) {
        filter["price.org"]["$lte"] = parseFloat(maxPrice);
      }
    }

    if (search) {
      filter.$or = [
        { name: { $regex: new RegExp(search, "i") } }, // fixed from title → name
        { desc: { $regex: new RegExp(search, "i") } },
      ];
    }

    const foodList = await Food.find(filter);

    return res.status(200).json(foodList);

  } catch (err) {
    next(err);
  }
};

export const getFoodById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(createError(400, "Invalid product ID"));
    }

    const food = await Food.findById(id);

    if (!food) {
      return next(createError(404, "Food not found"));
    }

    return res.status(200).json(food);

  } catch (err) {
    next(err);
  }
};

