import { Button, TextField, Stack, Typography, Alert, CircularProgress } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useState } from "react";
import api from "../api/axios";
import LoginImage from "../assets/roby.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", form);

      localStorage.setItem("token", data.access_token);

      try {
        const payload = JSON.parse(atob(data.access_token.split(".")[1]));
        console.log(payload)
        navigate(payload.role === "student" ? "/student" : "/teacher");
      } catch (e) {
        const meRes = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${data.access_token}` }
        });
        if (meRes.data.role === "teacher") navigate("/teacher");
        else navigate("/student");
      }

    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {

        setError(err.response.data.detail);
      } else {
        setError("Autentificare eșuată. Te rugăm să verifici conexiunea.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Mobilizează-te pentru vârf"
      subtitle="Intră în contul tău Beatrix pentru a continua."
      image={LoginImage}
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Adresă de email"
            name="email"
            onChange={handleChange}
            required
            error={!!error}
          />
          <TextField
            label="Parolă"
            name="password"
            type="password"
            onChange={handleChange}
            required
            error={!!error}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: "black",
              "&:hover": { background: "#333" },
              borderRadius: "20px",
              py: 1.2,
              minHeight: "45px",
              textTransform: "none",
              fontSize: "1rem"
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Conectare"}
          </Button>

          <Typography variant="body2" align="center" sx={{ color: "#666" }}>
            Nu ai un cont?{" "}
            <Link to="/register" style={{ color: "black", fontWeight: 600, textDecoration: 'none' }}>
              Înregistrează-te
            </Link>
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}