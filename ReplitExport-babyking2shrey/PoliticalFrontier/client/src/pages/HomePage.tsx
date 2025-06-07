import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import { FileUpload } from "@/components/FileUpload";
import { uploadPoliticianPhoto, uploadGalleryImage, submitContactForm } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  Sun,
  Moon,
  Menu,
  X,
  Flag,
  Sprout,
  Heart,
  Users,
  Phone,
  Mail,
  MapPin,
  Building,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Send,
  Settings
} from "lucide-react";

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeGalleryFilter, setActiveGalleryFilter] = useState("all");
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [showAdminAccess, setShowAdminAccess] = useState(false);

  // Keyboard shortcut for admin access (Ctrl/Cmd + Shift + A)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminAccess(true);
        setTimeout(() => setShowAdminAccess(false), 5000); // Hide after 5 seconds
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Fetch politician data
  const { data: politician } = useQuery({
    queryKey: ["/api/politician"],
  });

  // Fetch journey milestones
  const { data: milestones = [] } = useQuery({
    queryKey: ["/api/journey"],
  });

  // Fetch gallery images
  const { data: galleryImages = [] } = useQuery({
    queryKey: ["/api/gallery"],
  });

  // Update politician mutation
  const updatePoliticianMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PATCH', '/api/politician', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/politician"] });
      toast({ title: "Profile updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: uploadPoliticianPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/politician"] });
      toast({ title: "Photo uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to upload photo", variant: "destructive" });
    },
  });

  // Contact form mutation
  const contactMutation = useMutation({
    mutationFn: submitContactForm,
    onSuccess: () => {
      toast({ title: "Message sent successfully" });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileMenuOpen(false);
  };

  const filteredImages = galleryImages.filter((image: any) => 
    activeGalleryFilter === "all" || image.category === activeGalleryFilter
  );

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };
    contactMutation.mutate(data);
    e.currentTarget.reset();
  };

  if (!politician) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-congress-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-congress-green/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-congress-green rounded-full flex items-center justify-center">
                <Flag className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">{politician.name}</h1>
                <p className="text-sm text-muted-foreground">Indian National Congress</p>
              </div>
            </div>

            <div className="hidden md:flex space-x-8">
              <button onClick={() => smoothScrollTo("home")} className="hover:text-congress-green transition-colors">
                Home
              </button>
              <button onClick={() => smoothScrollTo("about")} className="hover:text-congress-green transition-colors">
                About
              </button>
              <button onClick={() => smoothScrollTo("journey")} className="hover:text-congress-green transition-colors">
                Political Journey
              </button>
              <button onClick={() => smoothScrollTo("gallery")} className="hover:text-congress-green transition-colors">
                Gallery
              </button>
              <button onClick={() => smoothScrollTo("contact")} className="hover:text-congress-green transition-colors">
                Contact
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {showAdminAccess && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="border-congress-green text-congress-green hover:bg-congress-green hover:text-white animate-pulse">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4">
              <button onClick={() => smoothScrollTo("home")} className="block hover:text-congress-green transition-colors">
                Home
              </button>
              <button onClick={() => smoothScrollTo("about")} className="block hover:text-congress-green transition-colors">
                About
              </button>
              <button onClick={() => smoothScrollTo("journey")} className="block hover:text-congress-green transition-colors">
                Political Journey
              </button>
              <button onClick={() => smoothScrollTo("gallery")} className="block hover:text-congress-green transition-colors">
                Gallery
              </button>
              <button onClick={() => smoothScrollTo("contact")} className="block hover:text-congress-green transition-colors">
                Contact
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center relative overflow-hidden pt-20">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('https://pixabay.com/get/g8efda7e8f3ab7f3e38f0bf0aa06440d28ff42adfcf66b9a0939318e7d5135220266bd401ce3bde53cd8d472d08d083859b9ac621abd2526201b6c924cc542b18_1280.jpg')"
          }}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h2 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="gradient-text">{politician.title}</span><br />
                <span>of India</span>
              </h2>
              <p className="text-xl mb-8 text-muted-foreground leading-relaxed">
                {politician.introduction}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-congress-green hover:bg-congress-green/90 px-8 py-4 text-lg hover-lift"
                  onClick={() => smoothScrollTo("about")}
                >
                  Learn More About My Vision
                </Button>
                <Button 
                  variant="outline" 
                  className="border-saffron-orange text-saffron-orange hover:bg-saffron-orange hover:text-white px-8 py-4 text-lg"
                  onClick={() => smoothScrollTo("contact")}
                >
                  Get Involved
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative">
                <img
                  src={politician.photoUrl}
                  alt={politician.name}
                  className="rounded-2xl shadow-2xl w-full max-w-md mx-auto hover-lift object-cover h-96"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-r from-congress-green to-saffron-orange rounded-full animate-glow"></div>
              </div>
              {isEditingMode && (
                <div className="mt-4">
                  <FileUpload
                    onUpload={(file) => uploadPhotoMutation.mutate(file)}
                    currentImage={politician.photoUrl}
                    label="Update Profile Photo"
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">About Me</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Understanding my journey, values, and commitment to serving the people of India
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="hover-lift border-congress-green/20">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-congress-green rounded-full flex items-center justify-center mb-6">
                  <Sprout className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4 congress-green">Early Life</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {politician.earlyLife}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift border-saffron-orange/20">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-saffron-orange rounded-full flex items-center justify-center mb-6">
                  <Heart className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4 saffron-orange">Political Motivations</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {politician.politicalMotivations}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift border-congress-blue/20">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-congress-blue rounded-full flex items-center justify-center mb-6">
                  <Users className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4 congress-blue">Family</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {politician.family}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Political Journey Section */}
      <section id="journey" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">Political Journey</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A timeline of service, dedication, and achievements in public life
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-congress-green via-saffron-orange to-congress-blue"></div>

            <div className="space-y-12">
              {milestones.map((milestone: any, index: number) => (
                <motion.div
                  key={milestone.id}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <Card className={`hover-lift border-${milestone.category}/20`}>
                      <CardContent className="p-6">
                        <div className={`text-xl font-bold mb-2 ${milestone.category === 'congress-green' ? 'congress-green' : milestone.category === 'saffron-orange' ? 'saffron-orange' : 'congress-blue'}`}>
                          {milestone.year} - {milestone.title}
                        </div>
                        <p className="text-muted-foreground">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className={`w-8 h-8 rounded-full border-4 border-background relative z-10 ${
                    milestone.category === 'congress-green' ? 'bg-congress-green' : 
                    milestone.category === 'saffron-orange' ? 'bg-saffron-orange' : 
                    'bg-congress-blue'
                  }`}></div>
                  <div className="w-5/12"></div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold congress-green mb-2">25+</div>
              <p className="text-muted-foreground">Development Projects Completed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold saffron-orange mb-2">50K+</div>
              <p className="text-muted-foreground">Families Directly Benefited</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold congress-blue mb-2">15</div>
              <p className="text-muted-foreground">Years of Public Service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">Gallery</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Moments from my journey serving the people and working towards a better India
            </p>
          </div>

          {/* Gallery Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { value: "all", label: "All Photos", color: "congress-green" },
              { value: "campaign", label: "Campaign Events", color: "congress-green" },
              { value: "community", label: "Community Service", color: "saffron-orange" },
              { value: "parliament", label: "Parliamentary Work", color: "congress-blue" }
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={activeGalleryFilter === filter.value ? "default" : "outline"}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeGalleryFilter === filter.value 
                    ? `bg-${filter.color} text-white` 
                    : `border-${filter.color} text-${filter.color} hover:bg-${filter.color} hover:text-white`
                }`}
                onClick={() => setActiveGalleryFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image: any) => (
              <motion.div
                key={image.id}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="rounded-2xl overflow-hidden hover-lift"
              >
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="w-full h-64 object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">Get In Touch</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your voice matters. Reach out to share your concerns, suggestions, or to get involved in our mission
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="hover-lift">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 gradient-text">Office Locations</h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-congress-green rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Main Office</h4>
                        <p className="text-muted-foreground">{politician.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-saffron-orange rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Phone</h4>
                        <p className="text-muted-foreground">{politician.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-congress-blue rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Email</h4>
                        <p className="text-muted-foreground">{politician.email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="hover-lift">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 gradient-text">Send a Message</h3>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" required />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select name="subject" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="policy">Policy Feedback</SelectItem>
                        <SelectItem value="community">Community Issue</SelectItem>
                        <SelectItem value="volunteer">Volunteer Opportunity</SelectItem>
                        <SelectItem value="media">Media Request</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      rows={5} 
                      placeholder="Share your thoughts, concerns, or suggestions..."
                      required 
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-congress-green to-saffron-orange hover:from-congress-green/90 hover:to-saffron-orange/90 py-4 text-lg hover-lift"
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-congress-green/20 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-congress-green rounded-full flex items-center justify-center">
                  <Flag className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold gradient-text">{politician.name}</h3>
                  <p className="text-sm text-muted-foreground">Indian National Congress</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Dedicated to building a progressive, inclusive India where every citizen has the opportunity to thrive.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 congress-green">Quick Links</h4>
              <div className="space-y-2">
                <button onClick={() => smoothScrollTo("about")} className="block text-sm text-muted-foreground hover:text-congress-green transition-colors">
                  About
                </button>
                <button onClick={() => smoothScrollTo("journey")} className="block text-sm text-muted-foreground hover:text-congress-green transition-colors">
                  Political Journey
                </button>
                <button onClick={() => smoothScrollTo("gallery")} className="block text-sm text-muted-foreground hover:text-congress-green transition-colors">
                  Gallery
                </button>
                <button onClick={() => smoothScrollTo("contact")} className="block text-sm text-muted-foreground hover:text-congress-green transition-colors">
                  Contact
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 congress-green">Follow Us</h4>
              <div className="flex space-x-3">
                <Button size="icon" variant="outline" className="border-congress-blue text-congress-blue hover:bg-congress-blue hover:text-white">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="border-congress-blue text-congress-blue hover:bg-congress-blue hover:text-white">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="border-congress-blue text-congress-blue hover:bg-congress-blue hover:text-white">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="border-congress-blue text-congress-blue hover:bg-congress-blue hover:text-white">
                  <Youtube className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-congress-green/20 mt-8 pt-8 text-center">
            <p className="text-muted-foreground">
              &copy; 2024 {politician.name} - Indian National Congress. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}