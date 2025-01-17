import "../styles/login.css"

function Login() {
    return (
        <div class="Login">
            <h2>Log In</h2>
            <form>
                <label for="email">Email</label>
                <input type="email" id="email" name="email"></input>
                <label for="password">Password</label>
                <input type="password" id="password" name="password"></input>
                <button class="Button1" type="submit">Log In</button>
            </form>
        </div>
    );
}

export default Login;