import { 
  type Politician, 
  type InsertPolitician,
  type JourneyMilestone,
  type InsertJourneyMilestone,
  type GalleryImage,
  type InsertGalleryImage,
  type ContactMessage,
  type InsertContactMessage
} from "@shared/schema";

export interface IStorage {
  // Politician operations
  getPolitician(): Promise<Politician | undefined>;
  createPolitician(politician: InsertPolitician): Promise<Politician>;
  updatePolitician(politician: Partial<InsertPolitician>): Promise<Politician>;
  
  // Journey milestones operations
  getJourneyMilestones(): Promise<JourneyMilestone[]>;
  createJourneyMilestone(milestone: InsertJourneyMilestone): Promise<JourneyMilestone>;
  updateJourneyMilestone(id: number, milestone: Partial<InsertJourneyMilestone>): Promise<JourneyMilestone>;
  deleteJourneyMilestone(id: number): Promise<void>;
  
  // Gallery operations
  getGalleryImages(): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  deleteGalleryImage(id: number): Promise<void>;
  
  // Contact messages operations
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
}

export class MemStorage implements IStorage {
  private politician: Politician | undefined;
  private journeyMilestones: Map<number, JourneyMilestone>;
  private galleryImages: Map<number, GalleryImage>;
  private contactMessages: Map<number, ContactMessage>;
  private currentId: number;

  constructor() {
    this.politician = undefined;
    this.journeyMilestones = new Map();
    this.galleryImages = new Map();
    this.contactMessages = new Map();
    this.currentId = 1;
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize politician
    this.politician = {
      id: 1,
      name: "Hon. Rajesh Kumar",
      title: "Serving the People",
      introduction: "Dedicated to building a progressive, inclusive India where every citizen has the opportunity to thrive. Fighting for social justice, economic equality, and democratic values.",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800",
      email: "contact@rajeshkumar.inc.in",
      phone: "+91 11 2345 6789",
      address: "123 Gandhi Road, Central Delhi, New Delhi - 110001",
      earlyLife: "Born in a small village in Uttar Pradesh, I witnessed firsthand the challenges faced by rural communities. This early exposure to grassroots issues shaped my understanding of India's diverse needs and my commitment to inclusive development.",
      politicalMotivations: "Driven by the belief that politics should serve the people, not personal interests. My motivation stems from a deep desire to bridge the gap between government policies and ground-level implementation, ensuring every citizen's voice is heard and respected.",
      family: "Blessed with a supportive family that shares my vision for a better India. My spouse and children are my pillars of strength, reminding me daily of the importance of creating a safer, more prosperous future for all Indian families."
    };

    // Initialize journey milestones
    const milestones = [
      { year: 2010, title: "Youth Congress Leader", description: "Started political career as Youth Congress district coordinator, organizing awareness campaigns and grassroots mobilization programs.", category: "congress-green" },
      { year: 2015, title: "Municipal Councillor", description: "Elected as Municipal Councillor, implementing water supply projects and educational infrastructure improvements in local communities.", category: "saffron-orange" },
      { year: 2019, title: "State Assembly Member", description: "Won state assembly seat with 65% vote share, championing women's empowerment and agricultural reform policies.", category: "congress-blue" },
      { year: 2024, title: "Parliamentary Candidate", description: "Selected as Congress candidate for upcoming Lok Sabha elections, focusing on digital India initiatives and rural healthcare expansion.", category: "congress-green" }
    ];

    milestones.forEach((milestone, index) => {
      const id = this.currentId++;
      this.journeyMilestones.set(id, { id, ...milestone, politicianId: 1 });
    });

    // Initialize gallery images
    const images = [
      { title: "Campaign Rally", imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", category: "campaign" },
      { title: "Public Address", imageUrl: "https://images.unsplash.com/photo-1562577309-2592ab84b1bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", category: "campaign" },
      { title: "Food Distribution", imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", category: "community" },
      { title: "Education Initiative", imageUrl: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", category: "community" },
      { title: "Parliament Session", imageUrl: "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", category: "parliament" },
      { title: "Policy Meeting", imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", category: "parliament" }
    ];

    images.forEach((image, index) => {
      const id = this.currentId++;
      this.galleryImages.set(id, { id, ...image, politicianId: 1 });
    });
  }

  async getPolitician(): Promise<Politician | undefined> {
    return this.politician;
  }

  async createPolitician(insertPolitician: InsertPolitician): Promise<Politician> {
    const politician: Politician = { ...insertPolitician, id: 1, photoUrl: insertPolitician.photoUrl || null };
    this.politician = politician;
    return politician;
  }

  async updatePolitician(update: Partial<InsertPolitician>): Promise<Politician> {
    if (!this.politician) {
      throw new Error("Politician not found");
    }
    this.politician = { ...this.politician, ...update };
    return this.politician;
  }

  async getJourneyMilestones(): Promise<JourneyMilestone[]> {
    return Array.from(this.journeyMilestones.values()).sort((a, b) => a.year - b.year);
  }

  async createJourneyMilestone(insertMilestone: InsertJourneyMilestone): Promise<JourneyMilestone> {
    const id = this.currentId++;
    const milestone: JourneyMilestone = { ...insertMilestone, id, politicianId: insertMilestone.politicianId || null };
    this.journeyMilestones.set(id, milestone);
    return milestone;
  }

  async updateJourneyMilestone(id: number, update: Partial<InsertJourneyMilestone>): Promise<JourneyMilestone> {
    const milestone = this.journeyMilestones.get(id);
    if (!milestone) {
      throw new Error("Milestone not found");
    }
    const updated = { ...milestone, ...update };
    this.journeyMilestones.set(id, updated);
    return updated;
  }

  async deleteJourneyMilestone(id: number): Promise<void> {
    this.journeyMilestones.delete(id);
  }

  async getGalleryImages(): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values());
  }

  async createGalleryImage(insertImage: InsertGalleryImage): Promise<GalleryImage> {
    const id = this.currentId++;
    const image: GalleryImage = { ...insertImage, id, politicianId: insertImage.politicianId || null };
    this.galleryImages.set(id, image);
    return image;
  }

  async deleteGalleryImage(id: number): Promise<void> {
    this.galleryImages.delete(id);
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = this.currentId++;
    const message: ContactMessage = { 
      ...insertMessage, 
      id, 
      createdAt: new Date() 
    };
    this.contactMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
