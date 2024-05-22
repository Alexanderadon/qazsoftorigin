// Import dependencies
const fs = require("fs");
const { google } = require("googleapis");

const service = google.sheets("v4");
const credentials = require("./credentials.json");

// Configure auth client
const authClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
);

// Define exportable function
async function exportAnswers() {
  try {

    // Authorize the client
    const token = await authClient.authorize();

    // Set the client credentials
    authClient.setCredentials(token);

    // Get the rows
    const res = await service.spreadsheets.values.get({
        auth: authClient,
        spreadsheetId: "12YwxQT5zrCzHTR3Rg-a_eUBYAEy1KdqiniClpy1DfX8",
        range: "A:D",
    });

    // All of the answers
    const answers = [];

    // Set rows to equal the rows
    const rows = res.data.values;

    // Check if we have any data and if we do add it to our answers array
    if (rows.length) {

        // Remove the headers
        rows.shift()

        // For each row
        for (const row of rows) {
            answers.push({ timeStamp: row[0], name: row[1], gender: row[2], age: row[3] });
        // console.log(row)
        // console.log(rows)

        }
        // console.log(answers)

    } else {
        console.log("No data found.");
    }

    // Saved the answers
    fs.writeFileSync("answers.json", JSON.stringify(answers), function (err, file) {
        if (err) throw err;
        console.log("Saved!");
    });

    return answers;

    } catch (error) {
        // Log the error
        console.log(error);
        // Throw error for handling externally
        throw new Error("Failed to export answers.");
    }
}

// Export the function
module.exports = {
  exportAnswers
};
