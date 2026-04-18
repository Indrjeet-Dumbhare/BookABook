import { useNavigate } from "react-router-dom";
import styles from "./SignIn.module.css";

export const SignIn = () => {
  const navigate = useNavigate();
  const formHandling = (e) =>{
    e.preventDefault();
  }
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
                id="floatingInput"
                placeholder="Email address"
              />
  
            </div>
            <div className={styles.password}>
              <input
                type="password"
                className={styles.input}
                id="floatingPassword"
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
