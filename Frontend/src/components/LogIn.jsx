import React, { useState } from "react";
import './LogIn.css';
import Register from "./Register";
import { Link } from 'react-router-dom';

import Validation from "./LoginValidation";
function LogIn() {

    //login validation
    const [values, setValues] = useState({
        email: '',
        password: ''
    })
    const [errors, setErrors] = useState({

    }

    )
    /* server.use(express.json())
     //login check
     server.post('/api/login', async (req, res) => {
         const { email, password } = req.body
 
         if (!email || !password)
             return res.status(400).send({ error: 'Invalid request' })
 
         const q = await pool.query(
             'SELECT password, id, nickname from login WHERE email=$1',
             [email]
         )
 
         if (q.rowCount === 0) {
             return res.status(404).send({ error: 'This user does not exist' })
         }
     })*/
    const handleInput = (event) => {
        setValues(prev => ({ ...prev, [event.target.name]: [event.target.value] }))
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        setErrors(Validation(values));
    }

    return (
        <>

            <div className="login">
                <h2 style={{ color: "white" }}>Welcome to Lockerroom Chat</h2>
                <h3 style={{ color: "white" }}>Login</h3>
                <br />
                <form action="" onSubmit={handleSubmit}>
                    <div className="login-data">

                        <input type="email" id="uname" name="email" placeholder="Enter UserName" onChange={handleInput} style={{ backgroundColor: "white", height: "30px", width: "180px" }}></input><br />
                        {errors.email && <span>{errors.email}</span>}
                        <input type="password" id="pwd" name="password" placeholder="Enter Password" onChange={handleInput} style={{ backgroundColor: "white", height: "30px", width: "180px" }}></input><br />
                        {errors.password && <span>{errors.password}</span>}
                    </div>
                    <button type="submit" className="signinbtn" id="signin" >Sign In</button><br />
                    <br />
                    <label style={{ color: "white" }}>New to chatroom?Sign up to create account</label><br />
                    <Link to="/signup" id="signup" className="signupbtn" >Sign Up</Link>
                </form>
            </div>
        </>
    )
}
export default LogIn