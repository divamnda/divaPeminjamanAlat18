import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Login.css";

import { GiSoccerBall } from "react-icons/gi";
import { FaUser, FaLock, FaTwitter, FaFacebookF } from "react-icons/fa";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Login gagal");
        return;
      }

      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Login berhasil");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Server tidak merespon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-stage">
        <div className="login-card2">
          {/* PANEL KIRI */}
          <div className="login-left2">
            <div className="brand-badge">
              <GiSoccerBall />
            </div>

            <div className="left-copy">
              <h2>
                Un<span>LOCKED</span>: Your
                <br />
                Potential
              </h2>
              <p>Masuk untuk mengakses dashboard peralatan olahraga kamu.</p>
            </div>
          </div>

          {/* PANEL KANAN */}
          <div className="login-right2">
            <div className="right-header">
              <div className="logo-mini">
                <span className="dot" />
                <span className="logo-text">SportRent</span>
              </div>

              <h3>Access Your Locker</h3>
            </div>

            <form className="form2" onSubmit={handleLogin}>
              <label className="field2">
                <span className="icon">
                  <FaUser />
                </span>
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </label>

              <label className="field2">
                <span className="icon">
                  <FaLock />
                </span>
                <input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </label>

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "LOADING..." : "LOGIN NOW"}
              </button>

              <div className="form-footer">
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => alert("Arahkan ke halaman lupa password")}
                >
                  Forgot Password?
                </button>

                <div className="social">
                  <button
                    type="button"
                    className="social-btn"
                    aria-label="Twitter"
                    onClick={() => alert("Login Twitter (contoh)")}
                  >
                    <FaTwitter />
                  </button>
                  <button
                    type="button"
                    className="social-btn"
                    aria-label="Facebook"
                    onClick={() => alert("Login Facebook (contoh)")}
                  >
                    <FaFacebookF />
                  </button>
                </div>

                <button
                  type="button"
                  className="link-btn"
                  onClick={() => alert("Arahkan ke halaman register")}
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* efek glow (opsional) */}
        <div className="glow glow-1" />
        <div className="glow glow-2" />
      </div>
    </div>
  );
}

export default Login;