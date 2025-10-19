import Contact from "../models/Contact.js";
import { Op } from "sequelize";

export const identifyContact = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    

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

      // Create a new secondary contact if new info is found
      const alreadyExists = existingContacts.some(
        (c) => c.email === email && c.phoneNumber === phoneNumber
      );

      if (!alreadyExists) {
        await Contact.create({
          email,
          phoneNumber,
          linkedId: primaryContact.id,
          linkPrecedence: "secondary",
        });
      }

      // Merge all linked contacts (both primary + secondary)
      const allLinked = await Contact.findAll({
        where: {
          [Op.or]: [
            { id: primaryContact.id },
            { linkedId: primaryContact.id },
          ],
        },
      });

      // Prepare response
      const emails = [
        ...new Set(allLinked.map((c) => c.email).filter(Boolean)),
      ];
      const phoneNumbers = [
        ...new Set(allLinked.map((c) => c.phoneNumber).filter(Boolean)),
      ];
      const secondaryIds = allLinked
        .filter((c) => c.linkPrecedence === "secondary")
        .map((c) => c.id);

      return res.status(200).json({
        contact: {
          primaryContatctId: primaryContact.id,
          emails,
          phoneNumbers,
          secondaryContactIds: secondaryIds,
        },
      });
    }

    // New customer response
    return res.status(200).json({
      contact: {
        primaryContatctId: primaryContact.id,
        emails: [primaryContact.email].filter(Boolean),
        phoneNumbers: [primaryContact.phoneNumber].filter(Boolean),
        secondaryContactIds: [],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
