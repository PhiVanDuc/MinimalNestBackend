const express = require("express");
const router = express.Router();

const {
    get_events
} = require("../../controllers/event/public_event/public_event");

router.get("/", get_events);

module.exports = router;