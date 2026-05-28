const express = require("express");
const { exec } = require("child_process");
const router = express.Router();

router.post("/predict-category", (req, res) => {
  const { description } = req.body;

  exec(
    `python ml/predictCategory.py "${description}"`,
    (err, stdout) => {
      if (err) {
        return res.status(500).json({ error: "ML prediction failed" });
      }
      res.json({ category: stdout.trim() });
    }
  );
});

module.exports = router;
