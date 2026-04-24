import { useNavigate } from "react-router-dom";
import styles from "./SignIn.module.css";
import { useState } from "react";

export const SignIn = () => {
  const navigate = useNavigate();
  const formHandling = (e) =>{
    e.preventDefault();
    setEmail('');
    setPass('');
  }
  const [ email, setEmail] = useState('');
  const [ pass, setPass] = useState('');

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        
          <form onSubmit={(e)=>{
              formHandling(e);
            }}>
            <h1 className={styles.heading}>Sign In</h1>
            <div className={styles.email} >
              <input
                type="email"
                className={styles.input}
                value={email}
                id="floatingInput"
                placeholder="Email address"
                onChange={(e) =>{
                  setEmail(e.target.value)
                }}
              />
  
            </div>
            <div className={styles.password}>
              <input
                type="password"
                className={styles.input}
                id="floatingPassword"
                value={pass}
                placeholder="Password"
                onChange={(e)=>{
                  setPass(e.target.value)
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
              <label htmlFor="checkDefault">
                Remember me
              </label>{" "}
            </div>{" "}
            <button className={styles.ctabtn} type="submit" >
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
          Don't have an account? <span className={styles.signupbtn} onClick={()=>{
            navigate("/signup")
          }}>sign up</span> 
        </div>
      </div>
    </div>
  );
};
