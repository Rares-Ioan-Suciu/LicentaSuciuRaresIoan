import { useNavigate } from "react-router-dom";
import TeacherNavbar from "../components/TeacherNavbar";
import useCurrentUser from "../hooks/useCurrentUser";

export default function TeacherDashboard() {
  const user = useCurrentUser();
  const navigate = useNavigate();

  if (!user) return <p>Se încarcă...</p>;

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#fff", minHeight: "100vh" }}>
      <TeacherNavbar />

      <div
        style={{
          maxWidth: "900px",
          margin: "80px auto",
          padding: "0 20px",
        }}
      >
        <h1
          style={{
            fontSize: "38px",
            fontWeight: 700,
            marginBottom: "20px",
            color: "#000",
            lineHeight: "1.2",
          }}
        >
          Bine ai venit, {user.full_name}
        </h1>

        <p
          style={{
            maxWidth: "600px",
            color: "#555",
            fontSize: "18px",
            lineHeight: "1.5",
            marginBottom: "40px",
          }}
        >
          Ești conectat ca profesor.
          Gestionează-ți cursurile și interacționează cu studenții de aici.
        </p>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

          <button
            onClick={() => navigate("/classes")}
            style={{
              padding: "15px 30px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#fff",
              backgroundColor: "#007bff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
          >
            Gestionare Cursuri
          </button>

        </div>
      </div>
    </div>
  );
}