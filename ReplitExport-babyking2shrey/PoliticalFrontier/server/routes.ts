import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPoliticianSchema, 
  insertJourneyMilestoneSchema, 
  insertGalleryImageSchema,
  insertContactMessageSchema 
} from "@shared/schema";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get politician data
  app.get("/api/politician", async (req, res) => {
    try {
      const politician = await storage.getPolitician();
      if (!politician) {
        return res.status(404).json({ message: "Politician not found" });
      }
      res.json(politician);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch politician data" });
    }
  });

  // Update politician data
  app.patch("/api/politician", async (req, res) => {
    try {
      const validatedData = insertPoliticianSchema.partial().parse(req.body);
      const politician = await storage.updatePolitician(validatedData);
      res.json(politician);
    } catch (error) {
      res.status(400).json({ message: "Invalid politician data" });
    }
  });

  // Upload politician photo
  app.post("/api/politician/photo", upload.single('photo'), async (req, res) => {
    try {
      console.log("Server: Received photo upload request");
      
      if (!req.file) {
        console.log("Server: No file in request");
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log("Server: Processing file:", req.file.originalname, req.file.mimetype, req.file.size);

      // In a real application, you would upload to a cloud storage service
      // For this demo, we'll create a data URL
      const base64 = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
      
      console.log("Server: Created data URL, updating politician");
      const politician = await storage.updatePolitician({ photoUrl: dataUrl });
      
      console.log("Server: Photo upload successful");
      res.json({ photoUrl: politician.photoUrl, message: "Photo uploaded successfully" });
    } catch (error) {
      console.error("Server: Photo upload error:", error);
      res.status(500).json({ message: "Failed to upload photo", error: error.message });
    }
  });

  // Get journey milestones
  app.get("/api/journey", async (req, res) => {
    try {
      const milestones = await storage.getJourneyMilestones();
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journey milestones" });
    }
  });

  // Create journey milestone
  app.post("/api/journey", async (req, res) => {
    try {
      const validatedData = insertJourneyMilestoneSchema.parse(req.body);
      const milestone = await storage.createJourneyMilestone(validatedData);
      res.status(201).json(milestone);
    } catch (error) {
      res.status(400).json({ message: "Invalid milestone data" });
    }
  });

  // Update journey milestone
  app.patch("/api/journey/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertJourneyMilestoneSchema.partial().parse(req.body);
      const milestone = await storage.updateJourneyMilestone(id, validatedData);
      res.json(milestone);
    } catch (error) {
      res.status(400).json({ message: "Invalid milestone data" });
    }
  });

  // Delete journey milestone
  app.delete("/api/journey/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteJourneyMilestone(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete milestone" });
    }
  });

  // Get gallery images
  app.get("/api/gallery", async (req, res) => {
    try {
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // Upload gallery image
  app.post("/api/gallery", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { title, category } = req.body;
      if (!title || !category) {
        return res.status(400).json({ message: "Title and category are required" });
      }

      // In a real application, you would upload to a cloud storage service
      const base64 = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
      
      const imageData = {
        title,
        category,
        imageUrl: dataUrl,
        politicianId: 1
      };

      const validatedData = insertGalleryImageSchema.parse(imageData);
      const image = await storage.createGalleryImage(validatedData);
      res.status(201).json(image);
    } catch (error) {
      res.status(400).json({ message: "Invalid image data" });
    }
  });

  // Delete gallery image
  app.delete("/api/gallery/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGalleryImage(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  // Submit contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      
      // In a real application, you would send an email here
      console.log("Contact message received:", message);
      
      res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid contact data" });
    }
  });

  // Get contact messages (for admin)
  app.get("/api/contact", async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
