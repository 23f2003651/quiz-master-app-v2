
const Login = {
	template: `
	
	<div class="container">
			<div class="login-container">
			
				<h2>Login</h2>
				
				<input v-model="email" type="email" id="email" name="email" placeholder="Email" required>

				<input v-model="password" id="password" name="password" type="password" placeholder="Password" required>
				<button @click="submitInfo" id="login" type="submit"><login-icon></login-icon></button>
			
			</div>
    </div>
	
	`,

	data() {
		return {
			"email": "",
			"password": "",
		}
	},

	methods: {
		async submitInfo() {
			const url = window.location.origin;

			console.log("Submitting Info");
			const res = await axios.post(url + '/user-login', {
				email: this.email,
				password: this.password
			}, {
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (res.status == 200) {
				console.log("Login Successful");
				console.log(res.data);
				this.$router.push('/user-dashboard')
			} else {
				console.log(res);
				console.log("Login Failed");
				console.log(res.data);
			}
		}
	}
}

export default Login;
