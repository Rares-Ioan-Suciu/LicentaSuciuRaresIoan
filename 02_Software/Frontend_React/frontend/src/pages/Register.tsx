import { Button, TextField, Stack, MenuItem, Typography, Alert, CircularProgress } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useState } from "react";
import api from "../api/axios";
import RegisterImage from "../assets/boby.jpg"; 

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "student",
    password: "",
    confirmPassword: "", 
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); 
  };

  const validateForm = () => {
    if (!form.fullName.trim().includes(" ")) {
      return "Te rog să introduci numele și prenumele.";
    }
    if (form.password.length < 6) {
      return "Parola trebuie să aibă cel puțin 6 litere.";
    }
     if (form.password !== form.confirmPassword) {
      return "Parolele nu sunt identice.";
    
    };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
    
      const { confirmPassword, ...payload } = form;

      await api.post("/auth/register", payload);
      
      alert("Cont creat cu succes. Te rog să te autentifici");
      navigate("/login"); 

    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Înregistrare eșuată, te rog încearcă din nou.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Mobilizează-te pentru vârf"
      subtitle="Creează-ți contul pentru Beatrix."
      image={RegisterImage}
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            name="fullName"
            label="Nume complet"
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField 
            name="email" 
            label="Adresă de email" 
            type="email"
            onChange={handleChange} 
            required
            fullWidth
          />

          <TextField
            name="role"
            label="Sunt..."
            select
            value={form.role}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="student">Elev</MenuItem>
            <MenuItem value="teacher">Profesor</MenuItem>
          </TextField>

          <TextField
            name="password"
            label="Parolă"
            type="password"
            onChange={handleChange}
            required
            fullWidth
            helperText="Min. 6 caractere"
          />

          {}
          <TextField
            name="confirmPassword"
            label="Confirmă Parola"
            type="password"
            onChange={handleChange}
            required
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: "black",
              "&:hover": { background: "#333" },
              borderRadius: "20px",
              py: 1.5,
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '16px'
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Crează-ți contul"}
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Am deja un cont.{" "}
            <Link to="/login" style={{ color: "black", fontWeight: 700, textDecoration: 'none' }}>
              Auntetifică-te
            </Link>
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}