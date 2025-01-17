import "../styles/signup.css"

function SignUp() {
    return (
        <div class="SignUp">
            <h2>Sign Up</h2>
            <form>
                <label for="email">Email</label>
                <input type="email" id="email" name="email"></input>
                <label for="password">Password</label>
                <input type="password" id="password" name="password"></input>
                <button class="Button1" type="submit">Sign Up</button>
            </form>
        </div>
    );
}

export default SignUp;