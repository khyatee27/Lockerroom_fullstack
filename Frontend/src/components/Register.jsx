import React, { useState } from "react";
import './Register.css';
import axios from 'axios';
function Register() {
    const [values, setValues] = useState({
        name: '',
        email: '',
        password: ''
    })
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("submit is called")

        axios.post('/api/signup', values)
            .then(res => console.log(res))
            .catch(err => console.log(err));
    }
    return (
        <>
            <div className="login">
                <h2>Welcome to Lockerroom Chat</h2>
                <h3>Sign Up</h3><br />
                <form action="" onSubmit={handleSubmit}>
                    <div className="signup-data">
                        <input type="text" id="username" placeholder="Enter UserName" style={{ backgroundColor: "white", height: "30px", width: "180px" }}></input><br />
                        <input type="text" id="email" placeholder="Enter E-mail id" style={{ backgroundColor: "white", height: "30px", width: "180px" }}></input><br />
                        <input type="password" id="password" placeholder="Enter Password" style={{ backgroundColor: "white", height: "30px", width: "180px" }}></input><br />
                        <input type="password" id="re-password" placeholder="Re-Enter Password" style={{ backgroundColor: "white", height: "30px", width: "180px" }}></input><br />
                    </div>
                    <button type="submit" className="btn_signup" id="sign_up" >Sign Up</button>

                    <button id="cancel" className="btn_signup" >Cancel</button>
                </form>
            </div>

        </>
    )
}
export default Register