import { apiRequest } from "./queryClient";

export async function uploadPoliticianPhoto(file: File) {
  console.log("API: Uploading photo file:", file.name, file.type, file.size);

  const formData = new FormData();
  formData.append('photo', file);

  const response = await fetch('/api/politician/photo', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Upload failed:", response.status, errorText);
    throw new Error(`Failed to upload photo: ${response.status}`);
  }

  const result = await response.json();
  console.log("API: Upload successful:", result);
  return result;
}

export async function uploadGalleryImage(file: File, title: string, category: string) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('title', title);
  formData.append('category', category);

  const response = await apiRequest('POST', '/api/gallery', formData);
  return response.json();
}

export async function submitContactForm(data: {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}) {
  const response = await apiRequest('POST', '/api/contact', data);
  return response.json();
}