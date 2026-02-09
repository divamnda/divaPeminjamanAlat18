import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Login.css";
import { GiTennisRacket, GiSoccerBall, GiBasketballBall } from "react-icons/gi";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [role, setRole] = useState("");


  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password,
          role
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message);
        return;
      }

      const data = await response.json();

      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Login berhasil");

      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);
      alert("Server tidak merespon");
    }
  };


  return (
    <div className="login-page">
      <div className="login-card">

        {/* KIRI */}
        <div className="login-left">

          <div className="icons">
            <GiTennisRacket />
            <GiSoccerBall />
            <GiBasketballBall />
          </div>

          <h2>Welcome to Sports Equipment Center</h2>

        </div>

        <div className="login-right">
          <h1>LOGIN</h1>

          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Pilih Role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="petugas">Petugas</option>
            </select>


            <button type="submit">Login</button>
          </form>
        </div>

      </div>
    </div>
  );

}

export default Login;
