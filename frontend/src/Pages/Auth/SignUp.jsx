import { useNavigate } from "react-router-dom";
import styles from "./SignUp.module.css";
import { useState } from "react";
import axios from "axios";

export const SignUp = () => {
  const navigate = useNavigate();

  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formHandling = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/auth/user/register",
        { first_name, last_name, email, password, phone },
        { withCredentials: true }  // same as credentials: "include" — required for cookies
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
          <h1 className={styles.heading}>Sign Up</h1>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className={styles.firstnm}>
            <input
              type="text"
              className={styles.input}
              value={first_name}
              onChange={(e) => setFirst_name(e.target.value)}
              placeholder="First Name"
            />
          </div>

          <div className={styles.lastnm}>
            <input
              type="text"
              className={styles.input}
              value={last_name}
              onChange={(e) => setLast_name(e.target.value)}
              placeholder="Last Name"
            />
          </div>

          <div className={styles.mobno}>
            <input
              type="tel"
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile No"
            />
          </div>

          <div className={styles.email}>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
            />
          </div>

          <div className={styles.password}>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
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
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <button className={styles.btn} onClick={() => navigate("/")}>
          Go to Home
        </button>

        <div className={styles.signup}>
          Already have an account?{" "}
          <span className={styles.signupbtn} onClick={() => navigate("/signin")}>
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
};