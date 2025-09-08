import { google } from "googleapis";

// Clé JSON dans une variable d'env (copie le JSON du fichier)
const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

const auth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  ["https://www.googleapis.com/auth/spreadsheets"]
);

// ID de ta feuille (visible dans l’URL)
const spreadsheetId = "TA_FEUILLE_ID";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { name, email } = req.body;
  const timestamp = new Date().toISOString();

  try {
    await auth.authorize();
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:C",
      valueInputOption: "RAW",
      requestBody: {
        values: [[timestamp, name, email]],
      },
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error writing to sheet", err);
    res.status(500).json({ error: "Failed to write to sheet" });
  }
}
