export default function AuthNavbar() {
  return (
    <nav
      style={{
        width: "100%",
        background: "white",
        color: "black",
        padding: "18px 40px",
        borderBottom: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <span
        style={{
          fontSize: "22px",
          fontWeight: "700",
          cursor: "pointer",
        }}
        onClick={() => (window.location.href = "/")}
      >
        Beatrix
      </span>
    </nav>
  );
}
