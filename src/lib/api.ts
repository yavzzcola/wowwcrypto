// Secure API helper functions
// This file provides secure API calling without exposing tokens to client-side JavaScript

/**
 * Make authenticated API calls using secure httpOnly cookies
 * This replaces direct token access from localStorage
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const defaultOptions: RequestInit = {
    credentials: 'include', // Include httpOnly cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  return fetch(url, { ...defaultOptions, ...options });
}

/**
 * Check authentication status without exposing token
 */
export async function checkAuthStatus(): Promise<{ isAuthenticated: boolean; isAdmin: boolean; user?: any }> {
  try {
    const response = await authenticatedFetch('/api/user/profile');
    const data = await response.json();
    
    if (data.success && data.data) {
      return {
        isAuthenticated: true,
        isAdmin: data.data.role === 'admin',
        user: data.data
      };
    }
    
    return { isAuthenticated: false, isAdmin: false };
  } catch (error) {
    return { isAuthenticated: false, isAdmin: false };
  }
}

/**
 * Secure logout function
 */
export async function secureLogout(): Promise<boolean> {
  try {
    const response = await authenticatedFetch('/api/auth/logout', {
      method: 'POST'
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

/**
 * Get current user data securely
 */
export async function getCurrentUser(): Promise<any> {
  try {
    const response = await authenticatedFetch('/api/user/profile');
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}