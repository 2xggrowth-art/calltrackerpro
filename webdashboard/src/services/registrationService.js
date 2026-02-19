import api from './api';

export const registrationService = {
  async register(userData) {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async checkEmail(email) {
    try {
      const response = await api.post('/api/auth/check-email', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async sendContactMessage(contactData) {
    try {
      // Since there might not be a specific contact endpoint, 
      // we can use this for the contact form
      const response = await api.post('/api/contacts', {
        name: `${contactData.firstName} ${contactData.lastName}`,
        email: contactData.email,
        phone: contactData.phone || '',
        company: contactData.company || '',
        message: contactData.message,
        source: 'website_contact_form',
        newsletter: contactData.newsletter || false
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default registrationService;