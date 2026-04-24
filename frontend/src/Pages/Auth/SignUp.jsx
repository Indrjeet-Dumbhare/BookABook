import { useNavigate } from "react-router-dom";
import styles from "./SignUp.module.css";
import { useState } from "react";

export const SignUp = () => {
  const navigate = useNavigate();
 
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [mob, setMob] = useState("");
  const [upEmail, setUpEmail] = useState("");
  const [upPass, setUpPass] = useState("");


  const formHandling = (e) => {
    e.preventDefault();
  };
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <form action="http://localhost:3000/users/"
        method="POST" 
          onSubmit={(e) => {
            formHandling(e);
          }}
        >
          <h1 className={styles.heading}>Sign Up</h1>
          <div className={styles.firstnm}>
            <input
              type="text"
              className={styles.input}
              value={first}
              onChange={(e) => {
                setFirst(e.target.value);
              }}
              id="floatingemail"
              placeholder="First Name"
            />
          </div>
          <div className={styles.lastnm}>
            <input
              type="text"
              className={styles.input}
              value={last}
              onChange={(e) => {
                setLast(e.target.value);
              }}
              id="floatingmobno"
              placeholder="Last Name"
            />
          </div>
          <div className={styles.mobno}>
            <input
              type="digit"
              className={styles.input}
              value={mob}
              onChange={(e) => {
                setMob(e.target.value);
              }}
              id="floatingfirstname"
              placeholder="Mobile No"
            />
          </div>
          <div className={styles.email}>
            <input
              type="email"
              className={styles.input}
              value={upEmail}
              id="floatingfirstname"
              placeholder="Email address"
              onChange={(e) => {
                setUpEmail(e.target.value);
              }}
            />
          </div>
          <div className={styles.password}>
            <input
              type="password"
              className={styles.input}
              value={upPass}
              id="floatingPassword"
              placeholder="Password"
              onChange={(e) => {
                setUpPass(e.target.value);
              }}
            />
          </div>
          <div className={styles.label}>
            <input
              className={styles.checkbox}
              type="checkbox"
              value="remember-me"
              id="checkDefault"
            />
            <label htmlFor="checkDefault">Remember me</label>{" "}
          </div>{" "}
          <button className={styles.ctabtn} type="submit">
            Sign in
          </button>{" "}
        </form>{" "}
        <button
          className={styles.btn}
          onClick={() => {
            navigate("/");
          }}
        >
          Go Back
        </button>
        <div className={styles.signup}>
          Already have an account?{" "}
          <span
            className={styles.signupbtn}
            onClick={() => {
              navigate("/signin");
            }}
          >
            sign in
          </span>
        </div>
      </div>
    </div>
  );
};
