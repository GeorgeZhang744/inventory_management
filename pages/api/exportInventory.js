import { Parser } from "json2csv";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Retrieve the inventory data from the request body
      const inventory = req.body;

      // Validate that the inventory data is present and is an array
      if (!inventory || !Array.isArray(inventory)) {
        res.status(400).json({ error: "Invalid inventory data" });
        return; 
      }

      // Convert the inventory JSON data to CSV format
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(inventory);

      // Set the response headers to indicate a CSV file download
      res.setHeader("Content-Type", "text/csv"); // Specify the content type as CSV
      res.setHeader("Content-Disposition", "attachment; filename=inventory.csv"); // Suggest a filename for the download

      // Send the generated CSV as the response body
      res.status(200).send(csv);
    } catch (error) {
      // Log any errors that occur during CSV generation or response handling
      console.error(error);
      res.status(500).json({ error: "Failed to export inventory data to CSV" }); // Send a 500 response on error
    }
  } else {
    // Respond with a 405 error if the request method is not POST
    res.status(405).json({ message: "Method not allowed" });
  }
}
