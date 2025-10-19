import Contact from "../models/contact.js";
import { Op } from "sequelize";

export const identifyContact = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    // Validate input
    if (!email && !phoneNumber) {
      return res.status(400).json({ error: "Email or phoneNumber required" });
    }

    // Find all existing contacts that match either email or phone
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
      // No contact exists → create new primary
      primaryContact = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: "primary",
      });
    } else {
      // Determine the true primary contact (oldest)
      const primaries = existingContacts.filter(c => c.linkPrecedence === "primary");
      primaryContact = primaries.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      )[0] || existingContacts[0];

      // Merge other primaries into this primary
      for (const c of primaries) {
        if (c.id !== primaryContact.id) {
          await c.update({
            linkPrecedence: "secondary",
            linkedId: primaryContact.id,
          });
        }
      }

      // Check if exact contact already exists
      const alreadyExists = existingContacts.some(
        c => c.email === email && c.phoneNumber === phoneNumber
      );

      // Create secondary if new info
      if (!alreadyExists) {
        await Contact.create({
          email,
          phoneNumber,
          linkedId: primaryContact.id,
          linkPrecedence: "secondary",
        });
      }
    }

    // Fetch all contacts linked to this primary
    const allLinked = await Contact.findAll({
      where: {
        [Op.or]: [
          { id: primaryContact.id },
          { linkedId: primaryContact.id },
        ],
      },
    });

    // Prepare response
    const emails = [...new Set(allLinked.map(c => c.email).filter(Boolean))];
    const phoneNumbers = [...new Set(allLinked.map(c => c.phoneNumber).filter(Boolean))];
    const secondaryIds = allLinked
      .filter(c => c.linkPrecedence === "secondary")
      .map(c => c.id);

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
