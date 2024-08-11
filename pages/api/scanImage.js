import { IncomingForm } from "formidable"; 
import fs from "fs";
import path from "path"; 
import { OpenAI } from "openai";
import * as dotenv from "dotenv"; 

// Load environment variables from .env file
dotenv.config(); 

// Initialize OpenAI with the API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); 

// Disable built-in body parsing to handle file uploads manually
export const config = {
  api: {
    bodyParser: false,
  },
};

// Define the API route handler
const handler = async (req, res) => {
  // Handle only POST requests
  if (req.method === "POST") {
    const form = new IncomingForm(); // Create a new Formidable form instance

    // Parse the incoming form data, including file uploads
    form.parse(req, async (err, fields, files) => {
      if (err) {
        // Handle errors during form parsing
        console.error("Error parsing the form:", err);
        res.status(500).json({ error: "Error processing the file" });
        return;
      }

      // Check if a file was uploaded
      if (!files.file || files.file.length === 0) {
        console.error("No file uploaded");
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Access the first uploaded file (the only file that is uploaded)
      const file = files.file[0];

      if (!file) {
        console.error("File is undefined");
        res.status(500).json({ error: "File is undefined" });
        return;
      }

      // Get the file path of the uploaded file
      const filePath = file.filepath;

      try {
        if (!filePath) {
          throw new Error("File path is undefined");
        }

        // Read the file and convert it to base64 encoding
        const imgData = fs.readFileSync(filePath, { encoding: "base64" });
        const imgExtension = path.extname(file.originalFilename).slice(1); // Get the file extension

        // Call OpenAI API to process the image and return inventory items and quantities
        const response = await openai.chat.completions.create({
          model: "gpt-4o", // Specify the model to use
          messages: [
            {
              role: "system",
              content: [
                {
                  type: "text",
                  text: "Return a JSON structure based on the requirements of the user. Only return the JSON structure, nothing else. Do not return ```JSON",
                },
              ],
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Identify the inventory items in the image as well as their quantity. Use the name of item as key and its corresponding quantity as its value",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/${imgExtension};base64,${imgData}`, // Include the image data as base64 string
                  },
                },
              ],
            },
          ],
        });

        // Parse the response from OpenAI to get the scanned items
        const scannedItems = JSON.parse(response.choices[0].message.content);

        // Convert the scanned items into an array of inventory objects
        const inventory = Object.keys(scannedItems).map((item) => ({
          name: item,
          quantity: scannedItems[item],
        }));

        // Respond with the inventory data
        res.status(200).json({ inventory });
      } catch (error) {
        // Handle errors during image processing
        console.error("Error processing the image:", error);
        res.status(500).json({ error: "Error processing the image" });
      } 
    });
  } else {
    // Respond with a 405 error if the method is not POST
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;
