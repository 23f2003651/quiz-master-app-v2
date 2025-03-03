
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

				// set session storage variables
				sessionStorage.setItem('token', res.data.token);
				sessionStorage.setItem('email', res.data.email);
				sessionStorage.setItem('id', res.data.id);

				// set vuex store variables
				this.$store.commit('setLogin');
				this.$store.commit('setToken', res.data.token);

				this.$router.push('/user-dashboard')
			} else {
				console.log("Login Failed");
				console.log(res.data);
			}
		}
	}
}

export default Login;
