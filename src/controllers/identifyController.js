import Contact from "../models/contact.js";
import { Op } from "sequelize";

export const identifyContact = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    // Validate input
    if (!email && !phoneNumber) {
      return res.status(400).json({ error: "Email or phoneNumber required" });
    }

    // Find all existing contacts with matching email or phone
    const existingContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { email: email || null },
          { phoneNumber: phoneNumber || null },
        ],
      },
    });

    let primaryContact;

    if (existingContacts.length === 0) {
      // No existing contact -> create new primary
      primaryContact = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: "primary",
      });
    } else {
      // Get all primary contacts
      const primaries = existingContacts.filter(
        (c) => c.linkPrecedence === "primary"
      );

      // Oldest primary becomes main
      primaryContact = primaries.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      )[0];

      // Fallback: if no primary exists, pick the first existing contact
      if (!primaryContact) {
        primaryContact = existingContacts[0];
      }

      // Check if this exact contact already exists
      const alreadyExists = existingContacts.some(
        (c) => c.email === email && c.phoneNumber === phoneNumber
      );

      // Create a new secondary contact if new info is found
      if (!alreadyExists) {
        await Contact.create({
          email,
          phoneNumber,
          linkedId: primaryContact.id,
          linkPrecedence: "secondary",
        });
      }
    }

    // Fetch all linked contacts (primary + secondaries)
    const allLinked = await Contact.findAll({
      where: {
        [Op.or]: [
          { id: primaryContact.id },
          { linkedId: primaryContact.id },
        ],
      },
    });

    // Prepare response
    const emails = [...new Set(allLinked.map((c) => c.email).filter(Boolean))];
    const phoneNumbers = [
      ...new Set(allLinked.map((c) => c.phoneNumber).filter(Boolean)),
    ];
    const secondaryIds = allLinked
      .filter((c) => c.linkPrecedence === "secondary")
      .map((c) => c.id);

    return res.status(200).json({
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds: secondaryIds,
      },
    });
  } catch (error) {
    console.error("❌ Error in identifyContact:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
