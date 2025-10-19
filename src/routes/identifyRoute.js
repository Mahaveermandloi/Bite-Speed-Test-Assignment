import express from "express";
import { identifyContact } from "../controllers/identifyController.js";
import { fetchAllContacts } from "../controllers/fetchAllData.js";
import { deleteAllData } from "../controllers/deleteAllData.js";

const router = express.Router();

router.post("/", identifyContact);
router.get("/", fetchAllContacts);
router.delete("/" , deleteAllData);


export default router;
