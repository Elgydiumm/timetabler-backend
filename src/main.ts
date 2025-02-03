import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createHash } from 'crypto';


export interface CalendarItem {
    startTime: Date;
    endTime: Date;
    title: string;
    description: string;
    labels: DescriptiveLabel[];
}

export interface DescriptiveLabel {
    label: Label;
    description: string;
}

enum Label {
    WORK = "WORK",
    SCHOOL = "SCHOOL",
    PERSONAL = "PERSONAL",
    MEETING = "MEETING",
}

let calendar = new Map<string, CalendarItem>();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/calendar", (req, res) => {
    const calendarObject = Object.fromEntries(calendar);
    res.status(200).send(calendarObject);
});

app.post("/calendar", (req, res) => {
    if (!req.body) res.status(400).send("Invalid request body - No body provided");

    const item: CalendarItem = req.body;

    if (!item.startTime || !item.endTime || !item.title || !item.labels) {
        res.status(400).send("Invalid request body");
    }

    
    generateUniqueId(item.startTime, item.endTime, item.title).then((id) => {
        calendar.set(id, item);
        res.status(201).send(calendar.get(id));
    });
});


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});



async function generateUniqueId(
    startTime: Date,
    endTime: Date,
    title: string
  ): Promise<string> {
    const serverTime = Date.now();
    const startTimestamp = startTime;
    const endTimestamp = endTime;
    
    // Replace spaces with underscores and encode special characters)
    const sanitizedTitle = encodeURIComponent(title)
      .replace(/%20/g, '_')
      .replace(/[!'()*]/g, ''); 
  
    // Combine all parts into a unique string
    const combinedString = `${serverTime}_${startTimestamp}_${endTimestamp}_${sanitizedTitle}`;
  
    // Hash the combined string using SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(combinedString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
    // Convert hash buffer to a hexadecimal string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  
    return hashHex;
  }