// /* eslint-disable */
import React, { useState, } from "react";
import * as MyUtils from "./utils"

function Login() {
    const [email, setEmail] = useState();
    const [pwd, setPwd] = useState();
    const [loading, setLoading] = useState(false);

    let handleSubmit = (e) => {
        e.preventDefault();
        if (email === undefined || pwd === undefined
            || email === '' || pwd === '') {
            alert("Please enter email and password!");
            return
        }
        setLoading(true);

        let onSuccess = (data, t, xhr) => {
            console.log("log in success!")
            console.log(data, t, xhr)
            // MyUtils.setCookie('token', data.token, 7)
            window.location.reload(false);
        }

        let onFailure = (e) => {
            console.error(e.responseJSON)
            MyUtils.setCookie('token', null, 0)
            setLoading(false);
            alert("Email or password error!")
        }

        MyUtils.login(email, pwd, onSuccess, onFailure);
    }

    return (
        <div className="container-sm mt-5" style={{ "width": "500px" }}>
            <form id="login" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                    <input type="email" className="form-control" id="exampleInputEmail1" autoComplete="account" aria-describedby="emailHelp"
                        onChange={(e) => { setEmail(e.target.value) }} />
                    <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                    <input type="password" className="form-control" autoComplete="current-password" id="exampleInputPassword1"
                        onChange={(e) => { setPwd(e.target.value) }} />
                </div>
                <button type="submit" className="btn btn-primary">Login
                    <span>
                        {loading ? <div className="spinner-border spinner-border-sm ms-2" role="status" /> : null}
                    </span>
                </button>
            </form>
        </div>
    )
}

export default Login