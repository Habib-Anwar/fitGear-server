const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Mongoose Schema and Model
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  description: String,
  images: String,
  category: String,
});

const Product = mongoose.model("Product", productSchema);

// Routes
app.get("/products", async (req, res) => {
  try {
    let query = {};
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    const products = await Product.find(query);
    res.send({ status: true, data: products });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
});

app.post("/product", async (req, res) => {
  try {
    const product = new Product(req.body);
    const result = await product.save();
    res.send(result);
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
});

app.get("/product-details/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(new ObjectId(id));
    res.send(product);
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
});

app.delete("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Product.deleteOne({ _id: ObjectId(id) });
    res.send(result);
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
});

app.put("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = req.body;

    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .send({ status: false, error: "Invalid ID format" });
    }

    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description,
        images: product.images,
        category: product.category,
      },
    };

    const options = { upsert: false }; // Use upsert: false to avoid creating new documents if not found
    const result = await Product.updateOne(filter, updateDoc, options);

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .send({ status: false, error: "Product not found" });
    }

    res.json({ status: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: false, error: err.message });
  }
});

// Basic route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
