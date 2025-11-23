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
  alpha,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  InputAdornment,
  Avatar,
  AvatarGroup,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  ContactSupport as ContactSupportIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoLibraryIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Forum as ForumIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // FAQ Data
  const faqCategories = [
    {
      title: "Getting Started",
      icon: <SchoolIcon />,
      color: theme.palette.primary.main,
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
      color: theme.palette.secondary.main,
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
      color: theme.palette.error.main,
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
      color: theme.palette.success.main,
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
    {
      title: "How to reset your password",
      category: "Account",
      views: "1.2k",
      trending: true,
    },
    {
      title: "Troubleshooting video playback issues",
      category: "Technical",
      views: "890",
      trending: true,
    },
    {
      title: "Understanding your learning dashboard",
      category: "Learning",
      views: "756",
    },
    { title: "Payment and billing FAQ", category: "Billing", views: "643" },
    {
      title: "Mobile app installation guide",
      category: "Technical",
      views: "542",
    },
    {
      title: "Certificate download instructions",
      category: "Learning",
      views: "489",
    },
  ];

  // Contact Methods
  const contactMethods = [
    {
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@learnai.com",
      buttonText: "Send Email",
      icon: <EmailIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: "Live Chat",
      description: "Instant help during business hours",
      contact: "Available 9 AM - 6 PM EST",
      buttonText: "Start Chat",
      icon: <ChatIcon />,
      color: theme.palette.secondary.main,
    },
    {
      title: "Community Forum",
      description: "Get help from other learners",
      contact: "Join discussions and ask questions",
      buttonText: "Visit Forum",
      icon: <ForumIcon />,
      color: theme.palette.success.main,
    },
  ];

  // Stats
  const stats = [
    { value: "98%", label: "Satisfaction Rate" },
    { value: "<2h", label: "Avg. Response Time" },
    { value: "10k+", label: "Articles" },
    { value: "24/7", label: "Support Available" },
  ];

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="lg" sx={{ py: 7 }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box textAlign="center" mb={{ xs: 6, md: 8 }}>
            <Chip
              label="Help & Support"
              color="primary"
              sx={{ mb: 3, px: 2, py: 1, fontSize: "0.8rem" }}
            />
            <Typography
              variant={isMobile ? "h3" : "h2"}
              component="h1"
              gutterBottom
              color="primary"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                textFillColor: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              How can we help you?
            </Typography>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              color="text.secondary"
              paragraph
              sx={{ maxWidth: 600, mx: "auto", mb: 4 }}
            >
              Find instant answers to your questions with our comprehensive help
              resources and support team
            </Typography>

            {/* Search Bar */}
            <Zoom in timeout={1000}>
              <Paper
                sx={{
                  maxWidth: 600,
                  mx: "auto",
                  p: { xs: 2, sm: 3 },
                  mt: 3,
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.05
                  )}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: 4,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexDirection: isSmallMobile ? "column" : "row",
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Search for answers, articles, guides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 3 },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    sx={{
                      minWidth: 120,
                      borderRadius: 3,
                      px: 4,
                      ...(isSmallMobile && { width: "100%" }),
                    }}
                  >
                    Search
                  </Button>
                </Box>
              </Paper>
            </Zoom>
          </Box>
        </Fade>

        {/* Stats Section */}
        <Fade in timeout={1000} className="flex justify-center">
          <Grid container spacing={2} sx={{ mb: { xs: 6, md: 8 } }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.primary.main,
                      0.05
                    )}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}`,
                  }}
                >
                  <Typography
                    variant="h4"
                    component="div"
                    fontWeight="bold"
                    color="primary"
                    gutterBottom
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Fade>

        {/* Quick Help Cards */}
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h5"
            className="text-center"
            gutterBottom
            sx={{ mb: 4, fontWeight: 600 }}
          >
            Get Help Quickly
          </Typography>
          <Grid container spacing={3} className="flex justify-center">
            {contactMethods.map((method, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Zoom in timeout={800 + index * 200}>
                  <Card
                    sx={{
                      height: "100%",
                      textAlign: "center",
                      borderRadius: 4,
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          p: 2,
                          borderRadius: 3,
                          bgcolor: alpha(method.color, 0.1),
                          color: method.color,
                          mb: 3,
                        }}
                      >
                        {method.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom fontWeight="600">
                        {method.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {method.description}
                      </Typography>
                      <Typography
                        variant="body1"
                        gutterBottom
                        sx={{ fontWeight: "bold", mb: 2 }}
                      >
                        {method.contact}
                      </Typography>
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{
                          mt: 2,
                          borderRadius: 3,
                          borderColor: method.color,
                          color: method.color,
                          "&:hover": {
                            bgcolor: alpha(method.color, 0.1),
                            borderColor: method.color,
                          },
                        }}
                      >
                        {method.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Popular Articles */}
        <Fade in timeout={1200}>
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              mb: { xs: 6, md: 8 },
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.02
              )}, ${alpha(theme.palette.secondary.main, 0.02)})`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
              <TrendingUpIcon color="primary" />
              <Typography className="text-center" variant="h5" fontWeight="600">
                Popular Articles
              </Typography>
            </Box>
            <Grid container spacing={2} className="flex justify-center">
              {popularArticles.map((article, index) => (
                <Grid item xs={12} sm={6} lg={4} key={index}>
                  <Paper
                    sx={{
                      p: 3,
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                      borderRadius: 3,
                      transition: "all 0.2s ease-in-out",
                      cursor: "pointer",
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                      },
                      ...(article.trending && {
                        borderColor: theme.palette.warning.main,
                        bgcolor: alpha(theme.palette.warning.main, 0.03),
                      }),
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Chip
                        label={article.category}
                        size="small"
                        color={article.trending ? "warning" : "default"}
                        sx={{ borderRadius: 2 }}
                      />
                      {article.trending && (
                        <StarIcon
                          sx={{ color: "warning.main", fontSize: 16 }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="body1"
                      fontWeight="medium"
                      gutterBottom
                    >
                      {article.title}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {article.views} views
                      </Typography>
                      <AvatarGroup
                        sx={{
                          "& .MuiAvatar-root": {
                            width: 24,
                            height: 24,
                            fontSize: "0.8rem",
                          },
                        }}
                      >
                        <Avatar sx={{ bgcolor: "primary.main" }}>A</Avatar>
                        <Avatar sx={{ bgcolor: "secondary.main" }}>B</Avatar>
                      </AvatarGroup>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Fade>

        {/* FAQ Sections */}
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ textAlign: "center", mb: 6, fontWeight: 700 }}
          >
            Frequently Asked Questions
          </Typography>

          {faqCategories.map((category, categoryIndex) => (
            <Zoom in timeout={1000 + categoryIndex * 200} key={categoryIndex}>
              <Paper
                sx={{
                  mb: 4,
                  borderRadius: 4,
                  overflow: "hidden",
                  border: `1px solid ${alpha(category.color, 0.1)}`,
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    borderBottom: `1px solid ${alpha(category.color, 0.1)}`,
                    bgcolor: alpha(category.color, 0.03),
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        bgcolor: alpha(category.color, 0.1),
                        color: category.color,
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="600">
                      {category.title}
                    </Typography>
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
                      sx={{
                        "&:before": { display: "none" },
                        borderBottom: `1px solid ${alpha(
                          theme.palette.divider,
                          0.5
                        )}`,
                        "&:last-child": { borderBottom: "none" },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          py: 2,
                          px: 3,
                          "&:hover": { bgcolor: alpha(category.color, 0.02) },
                        }}
                      >
                        <Typography fontWeight="medium" sx={{ flex: 1 }}>
                          {item.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails
                        sx={{
                          px: 3,
                          pb: 3,
                          bgcolor: alpha(category.color, 0.02),
                        }}
                      >
                        <Typography color="text.secondary">
                          {item.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Paper>
            </Zoom>
          ))}
        </Box>

        {/* Still Need Help */}
        <Fade in timeout={1400}>
          <Paper
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: "center",
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: "white",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="m0 40l40-40h-40v40zm40 0v-40h-40l40 40z"/%3E%3C/g%3E%3C/svg%3E")',
              },
            }}
          >
            <Box position="relative" zIndex={1}>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                gutterBottom
                fontWeight="600"
              >
                Still need help?
              </Typography>
              <Typography
                variant={isMobile ? "body1" : "h6"}
                paragraph
                sx={{ opacity: 0.9, mb: 3 }}
              >
                Our dedicated support team is ready to assist you with any
                questions or issues you may have.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    "&:hover": {
                      bgcolor: "grey.100",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Contact Support
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: "white",
                    color: "white",
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.1)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Schedule Call
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>

        {/* Emergency Alert */}
        <Fade in timeout={1600}>
          <Alert
            severity="info"
            sx={{
              mt: 4,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              "& .MuiAlert-icon": { color: "info.main" },
            }}
            icon={<PhoneIcon />}
          >
            <Typography variant="body2">
              <strong>Emergency Support:</strong> For urgent issues affecting
              your learning, call us at <strong>+1 (555) 123-HELP</strong> -
              Available 24/7
            </Typography>
          </Alert>
        </Fade>
      </Container>
    </Box>
  );
};

export default HelpCenter;
