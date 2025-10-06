const API_BASE_URL = '/api';

export const uploadProfilePicture = async (file, token) => {  
  const formData = new FormData();
  formData.append('profilePicture', file);

  const response = await fetch(`${API_BASE_URL}/users/upload-profile-picture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload profile picture');
  }

  return await response.json();
};

export const deleteProfilePicture = async (token) => {
  const response = await fetch(`${API_BASE_URL}/users/delete-profile-picture`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete profile picture');
  }

  return await response.json();
};
