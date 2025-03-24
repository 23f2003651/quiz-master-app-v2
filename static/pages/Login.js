
const Login = {
	template: `

	<div>
		<div class="login-parent-container">

			<div class="login-container">
			
				<h2 class="login-h2">Login</h2>
				
				<input class="login-input" v-model="email" type="email" id="email" name="email" placeholder="Email" required>

				<input class="login-input" v-model="password" id="password" name="password" type="password" placeholder="Password" required>
				<button class="login-button" @click="submitInfo" id="login" type="submit"><LoginIcon></LoginIcon></button>

			</div>

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

			try {
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

				this.$store.commit('setAlert', { message: "Logged in as " + this.email, type: "alert-success" });

				// set session storage variables
				sessionStorage.setItem('token', res.data.token);
				sessionStorage.setItem('email', res.data.email);
				sessionStorage.setItem('id', res.data.id);
				sessionStorage.setItem('role', res.data.role);

				// set vuex store variables
				this.$store.commit('setLogin');
				this.$store.commit('setToken', res.data.token);

				if (res.data.role == "user") {
					this.$router.push('/user-dashboard')
				} else {
					this.$router.push('/admin-dashboard')
				}
			}
			} catch (error) {
				console.log("Login Failed");
				console.log(error.response.data)

				this.$store.commit('setAlert', { message: error.response.data.message, type: "alert-danger" });

			}
		}
	}
}

export default Login;
