// src/controllers/deleteController.js
import Contact from "../models/contact.js";

export const deleteAllData = async (req, res) => {
  try {
    // Delete all rows from the Contacts table
    await Contact.destroy({
      where: {},      // no condition = delete all
      truncate: true, // optional: resets auto-increment IDs
    });

    res.status(200).json({ message: "All contacts deleted successfully." });
  } catch (error) {
    console.error("Error deleting contacts:", error);
    res.status(500).json({ error: "Failed to delete contacts." });
  }
};

