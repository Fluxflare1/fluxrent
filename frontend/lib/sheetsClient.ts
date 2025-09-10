import { google } from "googleapis"

function getAuth() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  }
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
  })
  return auth
}

export function getSheetClient() {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  return {
    async getValues(range: string) {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.GOOGLE_SHEETS_ID!, range })
      return res.data.values || []
    },
    async appendValues(range: string, values: any[][]) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values }
      })
    },
    async updateValues(range: string, values: any[][]) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values }
      })
    }
  }
}
