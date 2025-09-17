const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express().use(bodyParser.json());

const WHATSAPP_TOKEN = "EAAVgEZCipgYABO3RKEj7B8X5z24oJBVi66YzaKevvAr8V1zkUewhvx7tBwJVHqOyUBtxIF1cvAVeAF2btx85oycl93eaiT43Or6PB2CfPJqJy86hr5ZCKuL4KgqZAO4CfPYcW5Mr8EsDAdjEyNkMmInPbVA14oisVbBjFpkIfMlb0tmzngxYlj3NUDng0gerwZDZD";   // 🔑 your access token
const PHONE_NUMBER_ID = "236899979511201";       // 📱 your phone number ID

// ✅ Verify Webhook
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "jaydeep_khelbude";
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === VERIFY_TOKEN
  ) {
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Incoming Messages
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object) {
    const entry = body.entry?.[0]?.changes?.[0]?.value;
    const messages = entry?.messages;

    if (messages && messages[0]) {
      const msg = messages[0];
      const from = msg.from;

      // 📌 Handle plain text messages
      if (msg.type === "text") {
        console.log("User sent text:", msg.text.body);

        if (msg.text.body.toLowerCase() === "hi") {
          await sendInteractive(
            from,
            "Hello 👋 Welcome to WhiteCode – Your Trusted Edtech Partner.\nPlease select your organization type:",
            [
              { id: "school", title: "🏫 School" },
              { id: "college", title: "🎓 College" }
            ]
          );
        }
      }

      // 📌 Handle button replies (interactive)
      else if (msg.type === "interactive") {
        const userChoice = msg.interactive.button_reply.id;
        console.log("User clicked:", userChoice);

        // School path
        if (userChoice === "school") {
          await sendSchoolTypeQuestion(from);
        } else if (["school_state", "school_cbse", "school_other"].includes(userChoice)) {
          await sendSchoolServices(from);
        }

        // College path
        else if (userChoice === "college") {
          await sendCollegeTypeQuestion(from);
        } else if (["college_affiliated", "college_non_affiliated", "college_autonomous", "college_other"].includes(userChoice)) {
          await sendCollegeServices(from);
        } else if (userChoice === "college_tech") {
          await sendCollegeTechServices(from);
        } else if (userChoice === "college_accreditation") {
          await sendCollegeAccreditationServices(from);
        } else if (userChoice === "college_academic") {
          await sendCollegeAcademicServices(from);
        }

        // Common flows
        else if (userChoice === "book_demo") {
          await sendDemoForm(from);
        } else if (userChoice === "download_brochure") {
          await sendBrochure(from);
        } else if (userChoice === "no_thanks") {
          await sendGoodbye(from);
        }
      }
    }
  }

  res.sendStatus(200);
});


// ----------------------
// 📌 SCHOOL FLOWS
// ----------------------
async function sendSchoolTypeQuestion(to) {
  return sendInteractive(to, "What is your school type?", [
    { id: "school_state", title: "State Board" },
    { id: "school_cbse", title: "CBSE / ICSE" },
    { id: "school_other", title: "Other" }
  ]);
}

async function sendSchoolServices(to) {
  return sendInteractive(
    to,
    "Our School Solutions:\n✔ Dynamic Website (CMS)\n✔ LMS\n✔ ERP (With/Without Manpower)\n✔ Digital Marketing\n\nWould you like to:",
    [
      { id: "book_demo", title: "Book a Demo" },
      { id: "download_brochure", title: "Download Brochure" },
      { id: "no_thanks", title: "No, thanks" }
    ]
  );
}


// ----------------------
// 📌 COLLEGE FLOWS
// ----------------------
async function sendCollegeTypeQuestion(to) {
  return sendInteractive(to, "What is your college type?", [
    { id: "college_affiliated", title: "Affiliated" },
    { id: "college_non_affiliated", title: "Non-Affiliated" },
    { id: "college_autonomous", title: "Autonomous" },
    { id: "college_other", title: "Other" }
  ]);
}

async function sendCollegeServices(to) {
  return sendInteractive(to, "👉 Select Service Type:", [
    { id: "college_tech", title: "Tech Services" },
    { id: "college_accreditation", title: "Accreditation Services" },
    { id: "college_academic", title: "Academic Services" }
  ]);
}

async function sendCollegeTechServices(to) {
  return sendInteractive(
    to,
    "Tech Services:\n✔ Dynamic Website (Accreditation Compliant)\n✔ Online Admission / Exam Module\n✔ ERP (With/Without Manpower)\n✔ Teacher’s Diary\n✔ LMS\n✔ Feedback Software\n✔ Digital Marketing\n✔ AI Suite\n\nWould you like to:",
    [
      { id: "book_demo", title: "Book a Demo" },
      { id: "download_brochure", title: "Download Brochure" },
      { id: "no_thanks", title: "No, thanks" }
    ]
  );
}

async function sendCollegeAccreditationServices(to) {
  return sendInteractive(
    to,
    "Accreditation Services:\n✔ NAAC Mentoring\n✔ Continuous Mentoring\n✔ Mock Peer Team Visit Mentoring\n✔ AQAR Mentoring\n✔ CO-PO Mapping\n✔ MoU Drafting\n✔ Audit Services (AAA, Gender, Green, Energy, Environmental)\n\nWould you like to:",
    [
      { id: "book_demo", title: "Book a Demo" },
      { id: "download_brochure", title: "Download Brochure" },
      { id: "no_thanks", title: "No, thanks" }
    ]
  );
}

async function sendCollegeAcademicServices(to) {
  return sendInteractive(
    to,
    "Academic Services:\n✔ Workshops / FDPs for Faculty\n✔ Certified Courses for Students\n✔ Training Programs (Students / Faculty)\n\nWould you like to:",
    [
      { id: "book_demo", title: "Book a Demo" },
      { id: "download_brochure", title: "Download Brochure" },
      { id: "no_thanks", title: "No, thanks" }
    ]
  );
}


// ----------------------
// 📌 COMMON FLOWS
// ----------------------
async function sendDemoForm(to) {
  return sendText(
    to,
    "Great! Please provide:\n🏫 Institution Name\n👤 Full Name\n📧 Email\n📅 Preferred Date & Time"
  );
}

async function sendBrochure(to) {
  return sendText(to, "📄 Download Brochure: https://whitecode.co.in/brochure.pdf");
}

async function sendGoodbye(to) {
  return sendText(
    to,
    "Thank you for connecting!\n📞 +91 9175551176 | +91 7972227216\n✉ info@whitecode.co.in\n🌐 www.whitecode.co.in"
  );
}


// ----------------------
// 📌 UTIL FUNCTIONS
// ----------------------
async function sendInteractive(to, bodyText, buttons) {
  return axios.post(
    `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons.map(b => ({
            type: "reply",
            reply: { id: b.id, title: b.title }
          }))
        }
      }
    },
    { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
  );
}

async function sendText(to, text) {
  return axios.post(
    `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      text: { body: text }
    },
    { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
  );
}

app.listen(3000, () => console.log("✅ WhatsApp Bot running on port 3000"));
