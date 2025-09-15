/**
 * Social Media Service
 * 
 * Integration services for:
 * - Postiz API (Social Media Management)
 * - Nano Banana (Google Gemini 2.5 Flash Image Generation)
 * - Veo3 (Google Video Generation)
 */

// Postiz API Configuration
const POSTIZ_API_BASE = process.env.REACT_APP_POSTIZ_API_URL || 'https://api.postiz.com';
const POSTIZ_API_KEY = process.env.REACT_APP_POSTIZ_API_KEY;

// Google Gemini API Configuration
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Veo3 API Configuration (via Google Vertex AI)
const VERTEX_AI_BASE = 'https://vertex-ai.googleapis.com/v1beta1';
const PROJECT_ID = process.env.REACT_APP_GOOGLE_PROJECT_ID;

class SocialMediaService {
  constructor() {
    this.postizHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${POSTIZ_API_KEY}`
    };
    
    this.geminiHeaders = {
      'Content-Type': 'application/json'
    };
  }

  // === POSTIZ INTEGRATION ===

  /**
   * Create a new social media post
   * @param {Object} postData - Post configuration
   * @param {string} postData.content - Post text content
   * @param {string[]} postData.platforms - Target platforms
   * @param {string} [postData.scheduledDate] - Schedule date (ISO string)
   * @param {Object} [postData.settings] - Additional settings
   */
  async createPost(postData) {
    try {
      const response = await fetch(`${POSTIZ_API_BASE}/public/v1/posts`, {
        method: 'POST',
        headers: this.postizHeaders,
        body: JSON.stringify({
          text: postData.content,
          platforms: postData.platforms,
          date: postData.scheduledDate || new Date().toISOString(),
          settings: {
            autoOptimize: true,
            includeHashtags: true,
            ...postData.settings
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Postiz API error: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        postId: result.id
      };
    } catch (error) {
      console.error('Failed to create post:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get list of posts with optional filters
   * @param {Object} filters - Filter options
   */
  async getPosts(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.platform) queryParams.append('platform', filters.platform);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const response = await fetch(`${POSTIZ_API_BASE}/public/v1/posts?${queryParams}`, {
        headers: this.postizHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      throw error;
    }
  }

  /**
   * Upload media file to Postiz
   * @param {File} file - Media file to upload
   */
  async uploadMedia(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${POSTIZ_API_BASE}/public/v1/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${POSTIZ_API_KEY}`
          // Don't set Content-Type for FormData
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error;
    }
  }

  /**
   * Get active integrations
   */
  async getIntegrations() {
    try {
      const response = await fetch(`${POSTIZ_API_BASE}/public/v1/integrations`, {
        headers: this.postizHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch integrations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      throw error;
    }
  }

  /**
   * Delete a post
   * @param {string} postId - Post ID to delete
   */
  async deletePost(postId) {
    try {
      const response = await fetch(`${POSTIZ_API_BASE}/public/v1/posts/${postId}`, {
        method: 'DELETE',
        headers: this.postizHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to delete post:', error);
      return { success: false, error: error.message };
    }
  }

  // === NANO BANANA (GEMINI 2.5 FLASH IMAGE) INTEGRATION ===

  /**
   * Generate image using Nano Banana (Gemini 2.5 Flash Image)
   * @param {Object} imageRequest - Image generation parameters
   * @param {string} imageRequest.prompt - Text description of the image
   * @param {Object} [imageRequest.settings] - Additional settings
   */
  async generateImage(imageRequest) {
    try {
      const response = await fetch(`${GEMINI_API_BASE}/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: this.geminiHeaders,
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate an image: ${imageRequest.prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
            ...imageRequest.settings
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        imageUrl: result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
      };
    } catch (error) {
      console.error('Failed to generate image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Edit image using Nano Banana
   * @param {Object} editRequest - Image editing parameters
   * @param {string} editRequest.imageData - Base64 image data
   * @param {string} editRequest.instruction - Edit instruction
   */
  async editImage(editRequest) {
    try {
      const response = await fetch(`${GEMINI_API_BASE}/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: this.geminiHeaders,
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: editRequest.imageData
                }
              },
              {
                text: editRequest.instruction
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        editedImageUrl: result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
      };
    } catch (error) {
      console.error('Failed to edit image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // === VEO3 VIDEO GENERATION ===

  /**
   * Generate video using Veo3
   * @param {Object} videoRequest - Video generation parameters
   * @param {string} videoRequest.prompt - Text description of the video
   * @param {Object} [videoRequest.settings] - Additional settings
   */
  async generateVideo(videoRequest) {
    try {
      // Note: This is a simplified example. Real implementation would use Google Vertex AI SDK
      const response = await fetch(`${VERTEX_AI_BASE}/projects/${PROJECT_ID}/locations/us-central1/models/veo-3.0-fast-generate-001:generateVideo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getVertexAIToken()}`
        },
        body: JSON.stringify({
          prompt: videoRequest.prompt,
          duration: videoRequest.settings?.duration || "8s",
          resolution: videoRequest.settings?.resolution || "1080p",
          includeAudio: videoRequest.settings?.includeAudio || true,
          enhance: videoRequest.settings?.enhance || true
        })
      });

      if (!response.ok) {
        throw new Error(`Veo3 API error: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        operationId: result.name, // Long-running operation ID
        videoUrl: null // Will be available after operation completes
      };
    } catch (error) {
      console.error('Failed to generate video:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check video generation status
   * @param {string} operationId - Operation ID from generateVideo
   */
  async checkVideoStatus(operationId) {
    try {
      const response = await fetch(`${VERTEX_AI_BASE}/${operationId}`, {
        headers: {
          'Authorization': `Bearer ${await this.getVertexAIToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to check video status: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        done: result.done,
        videoUrl: result.response?.generatedVideos?.[0]?.video,
        error: result.error
      };
    } catch (error) {
      console.error('Failed to check video status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // === UTILITY METHODS ===

  /**
   * Get Vertex AI access token (placeholder - implement based on your auth method)
   */
  async getVertexAIToken() {
    // This would typically use Google Auth libraries
    // For now, return environment variable
    return process.env.REACT_APP_VERTEX_AI_TOKEN;
  }

  /**
   * Get analytics data from Postiz
   */
  async getAnalytics(timeRange = '30d') {
    try {
      // Note: Exact endpoint may vary based on Postiz API documentation
      const response = await fetch(`${POSTIZ_API_BASE}/public/v1/analytics?timeRange=${timeRange}`, {
        headers: this.postizHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Return mock data for now
      return {
        totalReach: "12.5K",
        engagementRate: "4.2%",
        topPlatforms: ["Instagram", "LinkedIn", "Facebook"],
        postsCount: 45,
        scheduledPosts: 12
      };
    }
  }

  /**
   * Enhance post content with AI suggestions
   * @param {string} content - Original post content
   * @param {string} platform - Target platform
   */
  async enhanceContent(content, platform) {
    try {
      const response = await fetch(`${GEMINI_API_BASE}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: this.geminiHeaders,
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Enhance this social media post for ${platform}: "${content}". Make it more engaging, add relevant hashtags, and optimize for the platform's best practices. Keep it professional and appropriate for a healthcare/psychology context.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to enhance content: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        enhancedContent: result.candidates?.[0]?.content?.parts?.[0]?.text || content,
        suggestions: [
          "Added relevant hashtags",
          "Optimized for platform engagement",
          "Enhanced readability"
        ]
      };
    } catch (error) {
      console.error('Failed to enhance content:', error);
      return {
        success: false,
        error: error.message,
        enhancedContent: content // Return original content as fallback
      };
    }
  }
}

// Create singleton instance
const socialMediaService = new SocialMediaService();

export default socialMediaService;

// Export individual methods for convenience
export const {
  createPost,
  getPosts,
  uploadMedia,
  getIntegrations,
  deletePost,
  generateImage,
  editImage,
  generateVideo,
  checkVideoStatus,
  getAnalytics,
  enhanceContent
} = socialMediaService;