import { ShoppingBag } from 'lucide-react';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../../contexts/LoginContext';
import styles from './Login.module.css'; // Importing CSS Module

function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const { login,error ,GetRole} = useContext(LoginContext);
    const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await login(form);  // wait for the promise to resolve
        if (res.message === "success") {
            navigate('/admin');
        } else {
            alert("Wrong credentials - User not found");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Something went wrong. Please try again.");
    }
};


    return (
        <div className={styles.loginContainer}>
            <div className={styles.leftSection}>
                <div className={styles.logo}>
                    <div className={styles.logoDots}>
                        <ShoppingBag />
                    </div>
                    NOOR
                </div>

                <h1 className={styles.mainHeading}>
                    Seamless Login for Exclusive Access
                </h1>

                <p className={styles.subtitle}>
                    Immerse yourself in a hassle-free login journey with our intuitively designed
                    login form. Effortlessly access your account.
                </p>
            </div>

            <div className={styles.loginCard}>
                <h2 className={styles.cardTitle}>Admin</h2>

                <div>
                    <div className={styles.formGroup}>
                        <input
                            type="text"
                            className={styles.formInput}
                            placeholder="username"
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <input
                            type="password"
                            className={styles.formInput}
                            placeholder="Password"
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    </div>

                    <button onClick={handleSubmit} className={styles.loginButton}>
                        Log in
                    </button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            </div>
        </div>
    );
}

export default Login;
