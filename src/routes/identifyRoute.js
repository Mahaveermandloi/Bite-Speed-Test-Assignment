import express from "express";
import { identifyContact } from "../controllers/identifyController.js";
import { fetchAllContacts } from "../controllers/fetchAllData.js";

const router = express.Router();

router.post("/", identifyContact);
router.get("/", fetchAllContacts);

export default router;
