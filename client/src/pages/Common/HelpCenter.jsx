import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  ContactSupport as ContactSupportIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoLibraryIcon,
  School as SchoolIcon,
} from "@mui/icons-material";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // FAQ Data
  const faqCategories = [
    {
      title: "Getting Started",
      icon: <SchoolIcon />,
      questions: [
        {
          question: "How do I create an account?",
          answer:
            'Click on the "Sign Up" button in the top right corner, fill in your details, and verify your email address to get started.',
        },
        {
          question: "Is there a free trial?",
          answer:
            "Yes, we offer a 7-day free trial for all new users. You can access all features during this period.",
        },
        {
          question: "What are the system requirements?",
          answer:
            "You need a modern web browser (Chrome, Firefox, Safari, or Edge) and a stable internet connection. Mobile apps are also available.",
        },
      ],
    },
    {
      title: "Courses & Learning",
      icon: <VideoLibraryIcon />,
      questions: [
        {
          question: "How do I enroll in a course?",
          answer:
            'Browse the courses catalog, click on a course you like, and press the "Enroll" button. Some courses may require payment.',
        },
        {
          question: "Can I download course materials?",
          answer:
            "Yes, most course materials including PDFs and resources are available for download from the course dashboard.",
        },
        {
          question: "How do I track my progress?",
          answer:
            "Your progress is automatically tracked in the dashboard. You can see completed lessons, scores, and time spent learning.",
        },
      ],
    },
    {
      title: "Technical Issues",
      icon: <ArticleIcon />,
      questions: [
        {
          question: "The video is not loading properly",
          answer:
            "Try refreshing the page, check your internet connection, or switch to a different browser. You can also try lowering the video quality.",
        },
        {
          question: "I forgot my password",
          answer:
            'Click on "Forgot Password" on the login page and follow the instructions sent to your email to reset your password.',
        },
        {
          question: "The exam is not submitting",
          answer:
            "Check your internet connection and ensure all questions are answered. If the problem persists, contact support immediately.",
        },
      ],
    },
    {
      title: "Billing & Payments",
      icon: <ContactSupportIcon />,
      questions: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit cards, PayPal, and bank transfers for certain regions.",
        },
        {
          question: "Can I get a refund?",
          answer:
            "We offer a 30-day money-back guarantee for all courses. Contact our support team to request a refund.",
        },
        {
          question: "How do I cancel my subscription?",
          answer:
            'Go to your account settings, click on "Subscription", and follow the cancellation process. Your access will continue until the end of the billing period.',
        },
      ],
    },
  ];

  // Popular Articles
  const popularArticles = [
    { title: "How to reset your password", category: "Account", views: "1.2k" },
    {
      title: "Troubleshooting video playback issues",
      category: "Technical",
      views: "890",
    },
    {
      title: "Understanding your learning dashboard",
      category: "Learning",
      views: "756",
    },
    { title: "Payment and billing FAQ", category: "Billing", views: "643" },
  ];

  // Contact Methods
  const contactMethods = [
    {
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@learnai.com",
      buttonText: "Send Email",
    },
    {
      title: "Live Chat",
      description: "Instant help during business hours",
      contact: "Available 9 AM - 6 PM EST",
      buttonText: "Start Chat",
    },
    {
      title: "Community Forum",
      description: "Get help from other learners",
      contact: "Join discussions and ask questions",
      buttonText: "Visit Forum",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 12 }}>
      {/* Header */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom color="primary">
          Help Center
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Find answers to common questions and get support
        </Typography>

        {/* Search Bar */}
        <Paper sx={{ maxWidth: 600, mx: "auto", p: 2, mt: 3 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            />
            <Button variant="contained" sx={{ minWidth: 120 }}>
              Search
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Quick Help Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {contactMethods.map((method, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: "100%", textAlign: "center" }}>
              <CardContent sx={{ p: 3 }}>
                <ContactSupportIcon
                  color="primary"
                  sx={{ fontSize: 48, mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  {method.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {method.description}
                </Typography>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  {method.contact}
                </Typography>
                <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                  {method.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Popular Articles */}
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Popular Articles
        </Typography>
        <Grid container spacing={2}>
          {popularArticles.map((article, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {article.title}
                  </Typography>
                  <Chip label={article.category} size="small" sx={{ mt: 1 }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {article.views} views
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* FAQ Sections */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ textAlign: "center", mb: 4 }}
        >
          Frequently Asked Questions
        </Typography>

        {faqCategories.map((category, categoryIndex) => (
          <Paper key={categoryIndex} sx={{ mb: 3 }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {category.icon}
                <Typography variant="h6">{category.title}</Typography>
              </Box>
            </Box>

            {category.questions.map((item, questionIndex) => {
              const panelId = `panel-${categoryIndex}-${questionIndex}`;
              return (
                <Accordion
                  key={questionIndex}
                  expanded={expanded === panelId}
                  onChange={handleAccordionChange(panelId)}
                  elevation={0}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight="medium">{item.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Paper>
        ))}
      </Box>

      {/* Still Need Help */}
      <Paper
        sx={{
          p: 4,
          textAlign: "center",
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Still need help?
        </Typography>
        <Typography variant="body1" paragraph sx={{ opacity: 0.9 }}>
          Our support team is here to assist you with any questions or issues.
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: "white",
            color: "primary.main",
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          Contact Support
        </Button>
      </Paper>

      {/* Emergency Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Emergency Support:</strong> For urgent issues affecting your
          learning, call us at +1 (555) 123-HELP
        </Typography>
      </Alert>
    </Container>
  );
};

export default HelpCenter;
