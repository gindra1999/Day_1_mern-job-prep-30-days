const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// ===== Todo Schema =====
const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending"
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

const Todo = mongoose.model("Todo", todoSchema);

// ===== Routes (Middleware already used in app.js) =====

// Create a todo
router.post("/", async (req, res) => {
  try {
    const todo = new Todo({
      title: req.body.title,
      status: req.body.status,
      owner: req.user.userId // <-- use req.user.userId
    });
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Get all todos for logged-in user
router.get("/", async (req, res) => {
  
  const todos = await Todo.find({ owner: req.user.userId });

  res.json(todos);
});

// Get single todo
router.get("/:id", async (req, res) => {
  const todo = await Todo.findOne({ _id: req.params.id, owner: req.user.userId });
  if (!todo) return res.status(404).json({ message: "Todo not found" });
  res.json(todo);
});

// Update todo
router.put("/:id", async (req, res) => {
  try {
    const updated = await Todo.findByIdAndUpdate(
  req.params.id,
  req.body,
  { new: true }
);

    if (!updated) return res.status(404).json({ message: "Todo not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete todo
router.delete("/:id", async (req, res) => {
  const deleted = await Todo.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
  if (!deleted) return res.status(404).json({ message: "Todo not found" });
  res.json({ message: "Todo deleted" });
});


module.exports = router;
    