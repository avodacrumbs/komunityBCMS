const express = require('express');
const router = express.Router();
const db = require('./db'); // Assuming you're using a DB like MySQL or MongoDB

// Fetch residents
router.get('/residents', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM residents WHERE is_alive = true');
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching residents', error });
    }
});

// Update resident location
router.post('/updateLocation', async (req, res) => {
    const { id, latitude, longitude } = req.body;
    try {
        const result = await db.query('UPDATE residents SET latitude = ?, longitude = ? WHERE id = ?', [latitude, longitude, id]);
        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Resident not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating location', error });
    }
});

module.exports = router;
