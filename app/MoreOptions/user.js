// data/userData.js
// Sample user data - replace with actual user data from context/API
export const userData = {
  name: "John Technician",
  technicianId: "TEC001",
  email: "john.technician@company.com",
  phone: "+1 (555) 123-4567",
  department: "Field Services",
  joinDate: "January 2023",
  profileImage: null, // Add actual image URL when available
  completedJobs: 247,
  rating: 4.8,
};

// You can add more user-related functions here
export const getUserInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
};

export const formatPhoneNumber = (phone) => {
  // Add phone number formatting logic here
  return phone;
};

export const formatEmail = (email) => {
  // Add email formatting/validation logic here
  return email.toLowerCase();
};