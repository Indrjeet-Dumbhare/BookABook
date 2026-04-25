import { useNavigate } from "react-router-dom";
import styles from "./SignIn.module.css";
import { useState } from "react";
import axios from "axios";

export const SignIn = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formHandling = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(
        "http://localhost:3000/auth/user/login",
        { email, password },
        { withCredentials: true }
      );

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <form onSubmit={formHandling}>
          <h1 className={styles.heading}>Sign In</h1>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className={styles.email}>
            <input
              type="email"
              className={styles.input}
              value={email}
              id="floatingInput"
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.password}>
            <input
              type="password"
              className={styles.input}
              id="floatingPassword"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.label}>
            <input
              className={styles.checkbox}
              type="checkbox"
              value="remember-me"
              id="checkDefault"
            />
            <label htmlFor="checkDefault">Remember me</label>
          </div>

          <button className={styles.ctabtn} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <button className={styles.btn} onClick={() => navigate("/")}>
          Go Back
        </button>

        <div className={styles.signup}>
          Don't have an account?{" "}
          <span className={styles.signupbtn} onClick={() => navigate("/signup")}>
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
};