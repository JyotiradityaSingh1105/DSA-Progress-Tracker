const express = require("express");
const Progress = require("../models/Progress");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        let progress = await Progress.findOne({ userId: req.userId });

        if (!progress) {
            progress = await Progress.create({
                userId: req.userId,
                completedTopics: []
            });
        }

        res.json({
            completedTopics: progress.completedTopics
        });
    } catch (error) {
        res.status(500).json({ message: "Could not load progress" });
    }
});

router.put("/:topicId", authMiddleware, async (req, res) => {
    try {
        const topicId = Number(req.params.topicId);
        const { completed } = req.body;

        if (!Number.isInteger(topicId) || topicId < 0) {
            return res.status(400).json({ message: "Invalid topic ID" });
        }

        let progress = await Progress.findOne({ userId: req.userId });

        if (!progress) {
            progress = await Progress.create({
                userId: req.userId,
                completedTopics: []
            });
        }

        if (completed) {
            if (!progress.completedTopics.includes(topicId)) {
                progress.completedTopics.push(topicId);
            }
        } else {
            progress.completedTopics =
                progress.completedTopics.filter(id => id !== topicId);
        }

        await progress.save();

        res.json({
            completedTopics: progress.completedTopics
        });
    } catch (error) {
        res.status(500).json({ message: "Could not update progress" });
    }
});

router.delete("/", authMiddleware, async (req, res) => {
    try {
        await Progress.findOneAndUpdate(
            { userId: req.userId },
            { completedTopics: [] },
            { upsert: true }
        );

        res.json({
            message: "Progress reset",
            completedTopics: []
        });
    } catch (error) {
        res.status(500).json({ message: "Could not reset progress" });
    }
});

module.exports = router;
