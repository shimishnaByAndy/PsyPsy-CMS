/**
 * Social Media Management Layout
 * 
 * Integration with Postiz for social media posting
 * Content creation with Nano Banana (Google Gemini 2.5 Flash Image)
 * Video generation with Veo3
 */

import React, { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

// Material Dashboard 2 React components
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import Footer from "../../examples/Footer";
import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";
import MDButton from "../../components/MDButton";
import MDInput from "../../components/MDInput";

// Modern UI components
import { Button } from "../../components/ui/Button";
import { AnimatedCard } from "../../components/animations/AnimatedComponents";

// Lucide React icons
import { 
  Send, 
  Image, 
  Video, 
  Calendar, 
  Target, 
  Sparkles,
  Zap,
  Camera,
  Film
} from "lucide-react";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`social-media-tabpanel-${index}`}
      aria-labelledby={`social-media-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Post creation component
function PostCreator() {
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [postResult, setPostResult] = useState(null);

  const platforms = [
    "facebook", "instagram", "twitter", "linkedin", "tiktok", 
    "youtube", "pinterest", "reddit", "threads"
  ];

  const handlePost = async () => {
    setIsPosting(true);
    try {
      // Simulate Postiz API call
      const response = await fetch('/api/postiz/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_POSTIZ_API_KEY}`
        },
        body: JSON.stringify({
          content: postContent,
          platforms: selectedPlatforms,
          scheduledDate: scheduledDate || null,
          settings: {
            autoOptimize: true,
            includeHashtags: true
          }
        })
      });

      const result = await response.json();
      setPostResult({ success: true, data: result });
    } catch (error) {
      console.error('Post creation failed:', error);
      setPostResult({ success: false, error: error.message });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <AnimatedCard>
      <MDBox p={3}>
        <MDTypography variant="h5" mb={2}>
          Create Social Media Post
        </MDTypography>
        
        <MDBox mb={3}>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Post Content"
            placeholder="What's happening in your healthcare practice today?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            sx={{ mb: 2 }}
          />
        </MDBox>

        <MDBox mb={3}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Platforms</InputLabel>
            <Select
              multiple
              value={selectedPlatforms}
              onChange={(e) => setSelectedPlatforms(e.target.value)}
              renderValue={(selected) => (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {selected.map((platform) => (
                    <Chip 
                      key={platform} 
                      label={platform} 
                      size="small"
                      color="primary"
                    />
                  ))}
                </Stack>
              )}
            >
              {platforms.map((platform) => (
                <MenuItem key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </MDBox>

        <MDBox mb={3}>
          <TextField
            fullWidth
            type="datetime-local"
            label="Schedule Post (Optional)"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </MDBox>

        <MDBox display="flex" alignItems="center" gap={2}>
          <Button
            variant="default"
            onClick={handlePost}
            disabled={!postContent.trim() || selectedPlatforms.length === 0 || isPosting}
            loading={isPosting}
            leftIcon={<Send size={16} />}
          >
            {scheduledDate ? 'Schedule Post' : 'Post Now'}
          </Button>

          <Button
            variant="outline"
            leftIcon={<Sparkles size={16} />}
          >
            AI Enhance
          </Button>
        </MDBox>

        {postResult && (
          <MDBox mt={3}>
            <Alert 
              severity={postResult.success ? "success" : "error"}
            >
              {postResult.success 
                ? "Post created successfully!" 
                : `Failed to create post: ${postResult.error}`
              }
            </Alert>
          </MDBox>
        )}
      </MDBox>
    </AnimatedCard>
  );
}

// Content creation with Nano Banana and Veo3
function ContentStudio() {
  const [contentType, setContentType] = useState("image");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (contentType === "image") {
        // Generate image with Nano Banana (Gemini 2.5 Flash Image)
        const response = await fetch('/api/gemini/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gemini-2.5-flash-image-preview",
            prompt: prompt,
            settings: {
              quality: "high",
              aspectRatio: "16:9",
              style: "professional"
            }
          })
        });
        
        const result = await response.json();
        setGeneratedContent({ type: "image", data: result });
        
      } else if (contentType === "video") {
        // Generate video with Veo3
        const response = await fetch('/api/veo3/generate-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_VEO3_API_KEY}`
          },
          body: JSON.stringify({
            model: "veo-3.0-fast-generate-001",
            prompt: prompt,
            settings: {
              duration: "8s",
              resolution: "1080p",
              includeAudio: true,
              enhance: true
            }
          })
        });
        
        const result = await response.json();
        setGeneratedContent({ type: "video", data: result });
      }
      
    } catch (error) {
      console.error('Content generation failed:', error);
      setGeneratedContent({ error: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatedCard>
      <MDBox p={3}>
        <MDTypography variant="h5" mb={2}>
          AI Content Studio
        </MDTypography>
        
        <MDBox mb={3}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Content Type</InputLabel>
            <Select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <MenuItem value="image">
                <Box display="flex" alignItems="center" gap={1}>
                  <Image size={16} />
                  Image (Nano Banana)
                </Box>
              </MenuItem>
              <MenuItem value="video">
                <Box display="flex" alignItems="center" gap={1}>
                  <Video size={16} />
                  Video (Veo3)
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </MDBox>

        <MDBox mb={3}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            label="Content Description"
            placeholder={
              contentType === "image" 
                ? "Describe the image you want to generate..." 
                : "Describe the video scene you want to create..."
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </MDBox>

        <MDBox display="flex" alignItems="center" gap={2}>
          <Button
            variant="gradient"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            loading={isGenerating}
            leftIcon={contentType === "image" ? <Camera size={16} /> : <Film size={16} />}
          >
            Generate {contentType === "image" ? "Image" : "Video"}
          </Button>

          <Button
            variant="outline"
            leftIcon={<Zap size={16} />}
          >
            Quick Prompts
          </Button>
        </MDBox>

        {generatedContent && (
          <MDBox mt={3}>
            {generatedContent.error ? (
              <Alert severity="error">
                Failed to generate content: {generatedContent.error}
              </Alert>
            ) : (
              <AnimatedCard>
                <MDBox p={2}>
                  <MDTypography variant="h6" mb={1}>
                    Generated {generatedContent.type === "image" ? "Image" : "Video"}
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    Content generated successfully with AI
                  </MDTypography>
                  {/* Content preview would go here */}
                </MDBox>
              </AnimatedCard>
            )}
          </MDBox>
        )}
      </MDBox>
    </AnimatedCard>
  );
}

// Analytics dashboard
function SocialAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Simulate fetching analytics from Postiz
        const response = await fetch('/api/postiz/analytics', {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_POSTIZ_API_KEY}`
          }
        });
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </MDBox>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <AnimatedCard>
          <MDBox p={3}>
            <MDTypography variant="h6" mb={1}>
              Total Reach
            </MDTypography>
            <MDTypography variant="h3" color="success">
              {analyticsData?.totalReach || "12.5K"}
            </MDTypography>
          </MDBox>
        </AnimatedCard>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <AnimatedCard>
          <MDBox p={3}>
            <MDTypography variant="h6" mb={1}>
              Engagement Rate
            </MDTypography>
            <MDTypography variant="h3" color="info">
              {analyticsData?.engagementRate || "4.2%"}
            </MDTypography>
          </MDBox>
        </AnimatedCard>
      </Grid>
      
      <Grid item xs={12}>
        <AnimatedCard>
          <MDBox p={3}>
            <MDTypography variant="h6" mb={2}>
              Top Performing Platforms
            </MDTypography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {(analyticsData?.topPlatforms || ["Instagram", "LinkedIn", "Facebook"]).map((platform) => (
                <Chip 
                  key={platform} 
                  label={platform} 
                  color="primary" 
                  variant="outlined"
                />
              ))}
            </Stack>
          </MDBox>
        </AnimatedCard>
      </Grid>
    </Grid>
  );
}

function SocialMedia() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <MDBox p={2}>
                  <MDBox display="flex" alignItems="center" gap={2}>
                    <Target size={24} color="#1976d2" />
                    <MDTypography variant="h4">
                      Social Media Management
                    </MDTypography>
                  </MDBox>
                  <MDTypography variant="body1" color="text" mt={1}>
                    Create, schedule, and analyze your social media content with AI-powered tools
                  </MDTypography>
                </MDBox>
                
                <Tabs 
                  value={currentTab} 
                  onChange={handleTabChange}
                  sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                >
                  <Tab 
                    label="Post Creator" 
                    icon={<Send size={16} />}
                    iconPosition="start"
                  />
                  <Tab 
                    label="Content Studio" 
                    icon={<Sparkles size={16} />}
                    iconPosition="start"
                  />
                  <Tab 
                    label="Analytics" 
                    icon={<Target size={16} />}
                    iconPosition="start"
                  />
                  <Tab 
                    label="Schedule" 
                    icon={<Calendar size={16} />}
                    iconPosition="start"
                  />
                </Tabs>

                <TabPanel value={currentTab} index={0}>
                  <PostCreator />
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                  <ContentStudio />
                </TabPanel>

                <TabPanel value={currentTab} index={2}>
                  <SocialAnalytics />
                </TabPanel>

                <TabPanel value={currentTab} index={3}>
                  <MDBox textAlign="center" py={5}>
                    <Calendar size={48} color="#999" />
                    <MDTypography variant="h5" mt={2} color="text">
                      Content Calendar
                    </MDTypography>
                    <MDTypography variant="body1" color="text" mt={1}>
                      Schedule and manage your content calendar
                    </MDTypography>
                    <Button variant="outline" className="mt-4">
                      Coming Soon
                    </Button>
                  </MDBox>
                </TabPanel>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default SocialMedia;