import React from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Divider,
  Link,
} from "@mui/material";

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 12 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            Privacy Policy
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Last updated: {new Date().getFullYear()}
          </Typography>
        </Box>

        <Box sx={{ maxWidth: "800px", mx: "auto" }}>
          <Typography variant="body1" paragraph>
            At LearnAI, we are committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, and safeguard your
            information.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            1. Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect information that you provide directly to us, including:
          </Typography>
          <ul>
            <li>Personal information (name, email, etc.)</li>
            <li>Account credentials</li>
            <li>Payment information</li>
            <li>Course progress and performance data</li>
            <li>Communication preferences</li>
          </ul>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            2. How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information we collect to:
          </Typography>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Process your transactions</li>
            <li>Personalize your learning experience</li>
            <li>Send you important updates and notifications</li>
            <li>Improve our platform and develop new features</li>
            <li>Ensure platform security</li>
          </ul>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            3. Data Sharing and Disclosure
          </Typography>
          <Typography variant="body1" paragraph>
            We do not sell your personal information. We may share your
            information with:
          </Typography>
          <ul>
            <li>Service providers who assist in our operations</li>
            <li>Legal authorities when required by law</li>
            <li>Other users in discussion forums (your username only)</li>
          </ul>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            4. Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We implement appropriate security measures to protect your personal
            information. However, no method of transmission over the Internet is
            100% secure.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            5. Cookies and Tracking
          </Typography>
          <Typography variant="body1" paragraph>
            We use cookies and similar technologies to:
          </Typography>
          <ul>
            <li>Remember your preferences</li>
            <li>Analyze platform usage</li>
            <li>Provide personalized content</li>
            <li>Improve our services</li>
          </ul>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            6. Your Rights
          </Typography>
          <Typography variant="body1" paragraph>
            You have the right to:
          </Typography>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Export your data</li>
          </ul>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            7. Data Retention
          </Typography>
          <Typography variant="body1" paragraph>
            We retain your personal information for as long as necessary to
            provide our services and comply with legal obligations.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            8. Children's Privacy
          </Typography>
          <Typography variant="body1" paragraph>
            Our service is not intended for children under 13. We do not
            knowingly collect information from children under 13.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            9. International Transfers
          </Typography>
          <Typography variant="body1" paragraph>
            Your information may be transferred to and processed in countries
            other than your own. We ensure appropriate safeguards are in place.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            10. Changes to This Policy
          </Typography>
          <Typography variant="body1" paragraph>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new policy on this page.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            11. Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, please contact
            us at:
          </Typography>
          <Typography variant="body1">
            Email: privacy@learnai.com
            <br />
            Address: 123 Education Street, Learning City, 12345
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              By using LearnAI, you consent to the data practices described in
              this Privacy Policy.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;
