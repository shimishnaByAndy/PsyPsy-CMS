# Social Media Integration

## Overview

PsyPsy CMS now includes comprehensive social media management capabilities powered by:

- **[Postiz](https://github.com/gitroomhq/postiz-app)** - Open-source social media scheduling and management platform
- **Nano Banana** (Google Gemini 2.5 Flash Image) - AI-powered image generation and editing
- **Veo3** (Google Video Generation) - AI-powered video content creation

## Features

### 📱 Social Media Management (Postiz Integration)

- **Multi-Platform Posting**: Schedule posts across 25+ social media platforms
- **Content Scheduling**: Schedule posts for optimal engagement times
- **Team Collaboration**: Invite team members to manage social media accounts
- **Analytics Dashboard**: Track performance metrics and engagement
- **AI Enhancement**: Improve post content with AI suggestions

#### Supported Platforms
- X (Twitter), Facebook, Instagram, TikTok
- YouTube, Reddit, LinkedIn, Dribbble
- Threads, Pinterest, and 15+ more platforms

### 🎨 AI Content Studio

#### Image Generation (Nano Banana)
- **Text-to-Image**: Generate professional images from text descriptions
- **Image Editing**: Advanced editing capabilities using natural language
- **Brand Consistency**: Maintain consistent visual style across content
- **Healthcare Focus**: Optimized prompts for healthcare and psychology content

**Pricing**: $0.039 per image generation

#### Video Generation (Veo3)
- **Text-to-Video**: Create 8-second videos from text prompts
- **High Quality**: 720p/1080p resolution with realistic visuals
- **Audio Generation**: Native audio generation synchronized with video
- **Multiple Formats**: Various aspect ratios and styles

### 📊 Analytics & Insights

- **Performance Metrics**: Reach, engagement, click-through rates
- **Platform Analysis**: Compare performance across different platforms
- **Content Insights**: Track which content types perform best
- **ROI Tracking**: Monitor return on investment for social media efforts

## Setup Instructions

### 1. Postiz Configuration

1. **Get API Access**:
   - Visit [Postiz Documentation](https://docs.postiz.com/public-api)
   - Generate your API key from the dashboard
   - Add to `.env` file: `REACT_APP_POSTIZ_API_KEY=your_key_here`

2. **Connect Social Accounts**:
   - Log into your Postiz dashboard
   - Connect your social media accounts
   - Configure posting permissions

### 2. Google AI Services Setup

#### Gemini API (Nano Banana)
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Create a new project or use existing
3. Generate API key for Gemini 2.5 Flash Image model
4. Add to `.env`: `REACT_APP_GEMINI_API_KEY=your_key_here`

#### Vertex AI (Veo3)
1. Enable Vertex AI in [Google Cloud Console](https://console.cloud.google.com/)
2. Create service account with Vertex AI permissions
3. Generate access token or configure authentication
4. Add project ID: `REACT_APP_GOOGLE_PROJECT_ID=your-project-id`

### 3. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Postiz API
REACT_APP_POSTIZ_API_KEY=your_postiz_api_key_here

# Google Gemini (Nano Banana)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here

# Google Vertex AI (Veo3)
REACT_APP_GOOGLE_PROJECT_ID=your-project-id
REACT_APP_VERTEX_AI_TOKEN=your_access_token
```

## Usage Guide

### Creating Social Media Posts

1. Navigate to **Social Media** → **Post Creator**
2. Write your post content
3. Select target platforms
4. Optional: Schedule for later
5. Click **Post Now** or **Schedule Post**

### AI Content Generation

#### Generate Images
1. Go to **Content Studio** tab
2. Select "Image (Nano Banana)"
3. Describe the image you want
4. Click **Generate Image**
5. Use generated image in your posts

#### Generate Videos
1. Select "Video (Veo3)"
2. Describe the video scene
3. Click **Generate Video**
4. Wait for processing (8-second videos)
5. Download and use in posts

### Enhancing Content with AI

1. Write your initial post content
2. Click **AI Enhance** button
3. Review AI suggestions and improvements
4. Apply changes or modify as needed

## API Integration

### Postiz SDK Usage

```javascript
import socialMediaService from '../services/socialMediaService';

// Create a post
const result = await socialMediaService.createPost({
  content: "Exciting healthcare updates!",
  platforms: ["facebook", "linkedin"],
  scheduledDate: "2025-01-15T10:00:00Z"
});

// Upload media
const uploadResult = await socialMediaService.uploadMedia(file);

// Get analytics
const analytics = await socialMediaService.getAnalytics('30d');
```

### Nano Banana Integration

```javascript
// Generate image
const imageResult = await socialMediaService.generateImage({
  prompt: "Professional healthcare consultation room",
  settings: {
    quality: "high",
    aspectRatio: "16:9"
  }
});

// Edit existing image
const editResult = await socialMediaService.editImage({
  imageData: base64ImageData,
  instruction: "Add warm lighting and modern furniture"
});
```

### Veo3 Video Generation

```javascript
// Generate video
const videoResult = await socialMediaService.generateVideo({
  prompt: "Peaceful therapy session in modern office",
  settings: {
    duration: "8s",
    resolution: "1080p",
    includeAudio: true
  }
});

// Check generation status
const status = await socialMediaService.checkVideoStatus(
  videoResult.operationId
);
```

## Best Practices

### Content Guidelines

1. **Healthcare Compliance**: Ensure all content complies with healthcare regulations
2. **Professional Tone**: Maintain professional, empathetic communication
3. **Visual Consistency**: Use consistent branding across all platforms
4. **Engagement**: Encourage meaningful interactions and discussions

### AI Content Generation

1. **Descriptive Prompts**: Use detailed, specific descriptions for better results
2. **Brand Guidelines**: Include brand colors, style preferences in prompts
3. **Review & Edit**: Always review AI-generated content before publishing
4. **Context Awareness**: Consider platform-specific requirements

### Scheduling Strategy

1. **Optimal Timing**: Schedule posts during peak engagement hours
2. **Platform Differences**: Adapt content for each platform's audience
3. **Consistency**: Maintain regular posting schedule
4. **Analytics-Driven**: Use performance data to optimize timing

## Troubleshooting

### Common Issues

1. **API Key Errors**:
   - Verify API keys are correctly set in `.env`
   - Check API key permissions and quotas
   - Ensure keys haven't expired

2. **Image Generation Fails**:
   - Check Gemini API quota and billing
   - Verify prompt follows content guidelines
   - Ensure prompt is detailed but not too long

3. **Video Generation Timeout**:
   - Veo3 generation can take several minutes
   - Use `checkVideoStatus()` to monitor progress
   - Ensure Vertex AI is properly configured

4. **Post Creation Errors**:
   - Verify social media accounts are connected in Postiz
   - Check platform-specific content requirements
   - Ensure content meets platform guidelines

### Support Resources

- **Postiz Documentation**: https://docs.postiz.com/
- **Google AI Studio**: https://ai.google.dev/
- **Vertex AI Documentation**: https://cloud.google.com/vertex-ai/docs
- **PsyPsy CMS Issues**: Create GitHub issues for CMS-specific problems

## Future Enhancements

### Planned Features

1. **Content Calendar**: Visual calendar for content planning
2. **Campaign Management**: Organized campaigns with multiple posts
3. **Advanced Analytics**: Detailed performance insights and reporting
4. **Template System**: Reusable post templates
5. **Bulk Operations**: Batch create and schedule multiple posts
6. **Integration Expansion**: Additional platforms and services

### AI Capabilities Roadmap

1. **Smart Scheduling**: AI-optimized posting times
2. **Content Suggestions**: AI-generated content ideas
3. **Sentiment Analysis**: Automatic content tone analysis
4. **Trend Detection**: Identify trending topics for content creation
5. **Performance Prediction**: Predict post performance before publishing

## Technical Architecture

### Component Structure
```
src/layouts/social-media/
├── index.js                 # Main social media dashboard
├── components/
│   ├── PostCreator.js       # Post creation interface
│   ├── ContentStudio.js     # AI content generation
│   ├── Analytics.js         # Performance analytics
│   └── Calendar.js          # Content calendar (planned)
└── services/
    └── socialMediaService.js # API integration layer
```

### State Management
- React hooks for component state
- Context API for global social media state
- Local storage for draft posts and preferences

### Security Considerations
- API keys stored in environment variables
- No sensitive data in client-side code
- HTTPS for all API communications
- Content validation and sanitization

## Cost Considerations

### Postiz
- Open source (self-hosted): Free
- Cloud hosting: Variable based on usage

### Google AI Services
- **Nano Banana**: $0.039 per image
- **Veo3**: Pricing varies by usage and resolution
- **Vertex AI**: Pay-per-use model

### Recommendations
- Monitor usage and set billing alerts
- Implement usage quotas for cost control
- Consider caching generated content
- Use lower resolution for drafts/previews

---

*This integration transforms PsyPsy CMS into a comprehensive social media management platform, enabling healthcare professionals to maintain professional online presence with AI-powered content creation capabilities.*