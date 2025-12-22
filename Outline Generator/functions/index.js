/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
// eslint-disable-next-line no-unused-vars
const {onRequest} = require("firebase-functions/v2/https");
// eslint-disable-next-line no-unused-vars
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebgu tase!");
// });


const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const mailgun = require("mailgun-js");
const DOMAIN = "sandbox033d8b2e5a4f4ec19aab54603e29a38c.mailgun.org";
const mg = mailgun({apiKey: functions.config().mailgun.api_key,
  domain: DOMAIN});

exports.sendAdminNotification = functions.auth.user().onCreate((user) => {
  // Fetch admins' details from Firestore where isAdmin is true
  const adminRef = admin.firestore()
      .collection("users")
      .where("isAdmin", "==", true);

  return adminRef.get().then((snapshot) => {
    const emailPromises = [];
    snapshot.forEach((doc) => {
      const adminData = doc.data();
      const mailOptions = {
        from: "Content Generator <mailgun@infrasity.com>",
        to: adminData.email,
        subject: "New User Registration Alert!",
        text: `A new user has just registered: 
              \nEmail: ${user.email}, 
              \nName: ${user.displayName}, 
              \nUID: ${user.uid}`,
        html: `<p>A new user has just registered:</p>
                <p>Email: <strong>${user.email}</strong></p>
                <p>UID: <strong>${user.uid}</strong></p>`,
      };

      // Send email to each admin using Mailgun
      emailPromises.push(mg.messages().send(mailOptions));
    });

    return Promise.all(emailPromises);
  }).catch((error) => {
    console.error("Error fetching admin users or sending emails", error);
  });
});
