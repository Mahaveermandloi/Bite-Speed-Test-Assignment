// src/controllers/fetchAllData.js

import Contact from "../models/contact.js";

export const fetchAllContacts = async (req, res) => {
  try {
    // Fetch all contacts from the database
    const contacts = await Contact.findAll();

    // Return the result
    res.status(200).json({ contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
