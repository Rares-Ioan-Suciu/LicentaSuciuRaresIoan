import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User, UserRole } from "../types/user"; 

export default function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      
      const payloadPart = token.split(".")[1];
      const decodedString = atob(payloadPart);
      const payload = JSON.parse(decodedString);

      const currentUser: User = {
        id: payload.id ? String(payload.id) : "0", 
        full_name: payload.full_name,
        sub: payload.sub,
        role: payload.role as UserRole, 
        is_active: true,
        avatar_color: undefined 
      };

      setUser(currentUser);

    } catch (err) {
      console.error("Eroare la procesarea token-ului:", err);
 
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  return user;
}