import { Box, Container, Typography } from "@mui/material";
import type { ReactNode } from "react";
import AuthNavbar from "./AuthNavbar";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  image: string;
}

export default function AuthLayout({ title, subtitle, children, image }: Props) {
  return (
    <>
      {}
      <AuthNavbar />

      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "85vh",          
          gap: 10,
          mt: -4,                 
        }}
      >
        {}
        <Box sx={{ flex: 1, textAlign: "left" }}>
          <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
            {title}
          </Typography>

          {subtitle && (
            <Typography sx={{ color: "gray", mb: 4 }}>
              {subtitle}
            </Typography>
          )}

          {children}
        </Box>

        {}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <img
            src={image}
            alt="illustration"
            style={{ width: "80%", opacity: 1 }}
          />
        </Box>
      </Container>
    </>
  );
}
