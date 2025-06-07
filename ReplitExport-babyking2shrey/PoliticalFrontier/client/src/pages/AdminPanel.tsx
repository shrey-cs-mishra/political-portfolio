import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { uploadPoliticianPhoto, uploadGalleryImage } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import {
  Settings,
  User,
  Calendar,
  Image,
  Save,
  Plus,
  Trash2,
  Edit,
  Home
} from "lucide-react";
import { Link } from "wouter";

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [newMilestone, setNewMilestone] = useState({
    year: new Date().getFullYear(),
    title: "",
    description: "",
    category: "congress-green",
    politicianId: 1
  });

  // State for form data
  const [profileData, setProfileData] = useState({
    name: "",
    title: "",
    introduction: "",
    email: "",
    phone: "",
    address: "",
    earlyLife: "",
    politicalMotivations: "",
    family: ""
  });

  const [galleryUpload, setGalleryUpload] = useState({
    title: "",
    category: "campaign",
    file: null as File | null
  });

  // Fetch data
  const { data: politician, isLoading } = useQuery({
    queryKey: ["/api/politician"],
  });

  // Initialize form data only once when politician data is first loaded
  React.useEffect(() => {
    if (politician && !profileData.name) {
      setProfileData({
        name: politician.name || "",
        title: politician.title || "",
        introduction: politician.introduction || "",
        email: politician.email || "",
        phone: politician.phone || "",
        address: politician.address || "",
        earlyLife: politician.earlyLife || "",
        politicalMotivations: politician.politicalMotivations || "",
        family: politician.family || ""
      });
    }
  }, [politician]);

  const { data: milestones = [] } = useQuery({
    queryKey: ["/api/journey"],
  });

  const { data: galleryImages = [] } = useQuery({
    queryKey: ["/api/gallery"],
  });

  const { data: contactMessages = [] } = useQuery({
    queryKey: ["/api/contact"],
  });

  // Mutations
  const updatePoliticianMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PATCH', '/api/politician', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/politician"] });
      toast({ title: "Profile updated successfully" });
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: uploadPoliticianPhoto,
    onSuccess: (data) => {
      console.log("Photo upload successful:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/politician"] });
      toast({ title: "Photo uploaded successfully" });
    },
    onError: (error) => {
      console.error("Photo upload failed:", error);
      toast({ 
        title: "Failed to upload photo", 
        description: "Please try again with a different image",
        variant: "destructive" 
      });
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/journey', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journey"] });
      setNewMilestone({
        year: new Date().getFullYear(),
        title: "",
        description: "",
        category: "congress-green",
        politicianId: 1
      });
      toast({ title: "Milestone added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add milestone", variant: "destructive" });
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest('PATCH', `/api/journey/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journey"] });
      setEditingMilestone(null);
      toast({ title: "Milestone updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update milestone", variant: "destructive" });
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/journey/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journey"] });
      toast({ title: "Milestone deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete milestone", variant: "destructive" });
    },
  });

  const uploadGalleryMutation = useMutation({
    mutationFn: ({ file, title, category }: { file: File; title: string; category: string }) =>
      uploadGalleryImage(file, title, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setGalleryUpload({ title: "", category: "campaign", file: null });
      toast({ title: "Image uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to upload image", variant: "destructive" });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/gallery/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Image deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete image", variant: "destructive" });
    },
  });

  // Handlers
  const handleUpdateProfile = (section: string) => {
    let updateData: any = {};
    
    if (section === 'basic') {
      updateData = {
        name: profileData.name,
        title: profileData.title,
        introduction: profileData.introduction
      };
    } else if (section === 'contact') {
      updateData = {
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address
      };
    } else if (section === 'about') {
      updateData = {
        earlyLife: profileData.earlyLife,
        politicalMotivations: profileData.politicalMotivations,
        family: profileData.family
      };
    }

    updatePoliticianMutation.mutate(updateData);
  };

  const handleAddMilestone = () => {
    if (newMilestone.title && newMilestone.description) {
      createMilestoneMutation.mutate(newMilestone);
    }
  };

  const handleUpdateMilestone = (milestone: any) => {
    updateMilestoneMutation.mutate({ id: milestone.id, data: milestone });
  };

  const handleGallerySubmit = () => {
    if (galleryUpload.file && galleryUpload.title) {
      uploadGalleryMutation.mutate({
        file: galleryUpload.file,
        title: galleryUpload.title,
        category: galleryUpload.category
      });
    }
  };

  if (isLoading || !politician) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-congress-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Settings className="h-8 w-8 text-congress-green" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
              <p className="text-muted-foreground">Manage your political portfolio website</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>View Website</span>
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="journey" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Journey</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center space-x-2">
              <Image className="h-4 w-4" />
              <span>Gallery</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Messages</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={politician.photoUrl || "/default-avatar.png"}
                        alt={politician.name || "Profile"}
                        className="w-32 h-32 rounded-full object-cover border-4 border-congress-green"
                      />
                    </div>
                    <FileUpload
                      onUpload={(file) => {
                        console.log("Uploading file:", file);
                        uploadPhotoMutation.mutate(file);
                      }}
                      currentImage={politician.photoUrl}
                      label="Update Profile Photo"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Title/Position</Label>
                      <Input 
                        id="title" 
                        value={profileData.title}
                        onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="introduction">Introduction</Label>
                      <Textarea 
                        id="introduction" 
                        rows={3} 
                        value={profileData.introduction}
                        onChange={(e) => setProfileData({...profileData, introduction: e.target.value})}
                        required 
                      />
                    </div>
                    <Button 
                      onClick={() => handleUpdateProfile('basic')} 
                      className="w-full bg-congress-green hover:bg-congress-green/90" 
                      disabled={updatePoliticianMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updatePoliticianMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea 
                        id="address" 
                        rows={2} 
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button 
                        onClick={() => handleUpdateProfile('contact')} 
                        className="bg-congress-green hover:bg-congress-green/90" 
                        disabled={updatePoliticianMutation.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Update Contact Info
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>About Section</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="earlyLife">Early Life</Label>
                      <Textarea 
                        id="earlyLife" 
                        rows={3} 
                        value={profileData.earlyLife}
                        onChange={(e) => setProfileData({...profileData, earlyLife: e.target.value})}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="politicalMotivations">Political Motivations</Label>
                      <Textarea 
                        id="politicalMotivations" 
                        rows={3} 
                        value={profileData.politicalMotivations}
                        onChange={(e) => setProfileData({...profileData, politicalMotivations: e.target.value})}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="family">Family</Label>
                      <Textarea 
                        id="family" 
                        rows={3} 
                        value={profileData.family}
                        onChange={(e) => setProfileData({...profileData, family: e.target.value})}
                        required 
                      />
                    </div>
                    <Button 
                      onClick={() => handleUpdateProfile('about')} 
                      className="bg-congress-green hover:bg-congress-green/90" 
                      disabled={updatePoliticianMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Update About Section
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Journey Tab */}
          <TabsContent value="journey">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Milestone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Year</Label>
                      <Input
                        type="number"
                        value={newMilestone.year}
                        onChange={(e) => setNewMilestone({...newMilestone, year: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={newMilestone.category} onValueChange={(value) => setNewMilestone({...newMilestone, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="congress-green">Congress Green</SelectItem>
                          <SelectItem value="saffron-orange">Saffron Orange</SelectItem>
                          <SelectItem value="congress-blue">Congress Blue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Title</Label>
                      <Input
                        value={newMilestone.title}
                        onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                        placeholder="e.g., Elected to Parliament"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newMilestone.description}
                        onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                        rows={3}
                        placeholder="Describe this milestone..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button onClick={handleAddMilestone} className="bg-congress-green hover:bg-congress-green/90" disabled={createMilestoneMutation.isPending}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Milestone
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {milestones.map((milestone: any) => (
                      <div key={milestone.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{milestone.year} - {milestone.title}</h4>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingMilestone(milestone)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteMilestoneMutation.mutate(milestone.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload New Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="imageTitle">Image Title</Label>
                      <Input
                        id="imageTitle"
                        value={galleryUpload.title}
                        onChange={(e) => setGalleryUpload({...galleryUpload, title: e.target.value})}
                        placeholder="e.g., Community Outreach Event"
                      />
                    </div>
                    <div>
                      <Label htmlFor="imageCategory">Category</Label>
                      <Select value={galleryUpload.category} onValueChange={(value) => setGalleryUpload({...galleryUpload, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="campaign">Campaign Events</SelectItem>
                          <SelectItem value="community">Community Service</SelectItem>
                          <SelectItem value="parliament">Parliamentary Work</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <FileUpload
                      onUpload={(file) => setGalleryUpload({...galleryUpload, file})}
                      label="Select Image"
                    />
                    <Button
                      onClick={handleGallerySubmit}
                      disabled={!galleryUpload.file || !galleryUpload.title}
                      className="w-full bg-congress-green hover:bg-congress-green/90"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gallery Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryImages.map((image: any) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.imageUrl}
                          alt={image.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteImageMutation.mutate(image.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-2">
                          <h4 className="font-medium">{image.title}</h4>
                          <span className="text-xs text-muted-foreground capitalize">{image.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactMessages.map((message: any) => (
                    <div key={message.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{message.firstName} {message.lastName}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{message.email}</p>
                      <p className="font-medium mb-2">{message.subject}</p>
                      <p className="text-muted-foreground">{message.message}</p>
                    </div>
                  ))}
                  {contactMessages.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No messages yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}