import React from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Divider,
  Link,
} from "@mui/material";

const TermsAndConditions = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 12 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            Terms and Conditions
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Last updated: {new Date().getFullYear()}
          </Typography>
        </Box>

        <Box sx={{ maxWidth: "800px", mx: "auto" }}>
          <Typography variant="body1" paragraph>
            Welcome to LearnAI. These terms and conditions outline the rules and
            regulations for the use of our platform.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing and using LearnAI, you accept and agree to be bound by
            the terms and provision of this agreement.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            2. User Accounts
          </Typography>
          <Typography variant="body1" paragraph>
            You must be at least 13 years old to use this service. You are
            responsible for maintaining the confidentiality of your account and
            password.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            3. Course Content and Usage
          </Typography>
          <Typography variant="body1" paragraph>
            All course materials, including videos, text, and assessments, are
            protected by copyright. You may not distribute, modify, or create
            derivative works without permission.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            4. Payment and Subscription
          </Typography>
          <Typography variant="body1" paragraph>
            Subscription fees are billed in advance. You can cancel your
            subscription at any time, but no refunds will be provided for the
            current billing period.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            5. User Conduct
          </Typography>
          <Typography variant="body1" paragraph>
            You agree not to use the service to:
          </Typography>
          <ul>
            <li>Violate any laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Upload malicious code or viruses</li>
            <li>Harass other users</li>
            <li>Attempt to gain unauthorized access</li>
          </ul>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            6. Termination
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to terminate or suspend your account for
            violations of these terms.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            7. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            LearnAI shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages resulting from your use of the
            service.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            8. Changes to Terms
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to modify these terms at any time. Continued
            use of the service after changes constitutes acceptance of the new
            terms.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 4, color: "primary.main" }}
          >
            9. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms and Conditions, please
            contact us at:
          </Typography>
          <Typography variant="body1">
            Email: legal@learnai.com
            <br />
            Address: 123 Education Street, Learning City, 12345
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              By using LearnAI, you acknowledge that you have read, understood,
              and agree to be bound by these Terms and Conditions.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsAndConditions;
