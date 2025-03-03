import LoginIcon from "../../components/LoginIcon.js";

const user_login = {
  template: /* html */ `

  <div class="register-parent-container">
			<div class="register-container">
			
				<h2 class="register-h2">Register</h2>
				
				<input class="register-input" v-model="email" type="email" id="email" name="email" placeholder="Email" required>

				<div class="row">
					<div class="col">
						<input class="register-input" v-model="username" type="text" id="username" name="email" placeholder="Username" required>
					</div>
					<div class="col">
						<input class="register-input" v-model="qualification" type="email" id="qualification" name="qualification" placeholder="Qualification" required>
					</div>
				</div>

				<input class="register-input" v-model="password" id="password" name="password" type="password" placeholder="Password" required>
				<input class="register-input" v-model="password2" id="password2" name="password2" type="password" placeholder="Confirm Password" required>
				<button class="register-button" @click="registerUser" id="login" type="submit">
				<LoginIcon></LoginIcon>
				</button>
			
			</div>
    </div>

  `,

	components: {
		LoginIcon
	},

	data() {
		return {
			email: '',
			username: '',
			qualification: '',
			password: '',
			password2: ''
		}
	},

	methods: {
		async registerUser() {
			try {
				const url = window.location.origin;
				const response = await axios.post(url + '/user-register', {
					email: this.email,
					username: this.username,
					qualification: this.qualification,
					password: this.password,
					password2: this.password2
				}, {
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (response.status == 200) {
					console.log("User registered successfully!");
					this.$store.commit('setAlert', { message: "New user created", type: "alert-success" });
					this.$router.push('/login');
				}
			} catch (error) {
				console.log("User registration failed!");
				this.$store.commit('setAlert', { message: "Failed creating new user", type: "alert-danger" });
			}
		}
	}
}

export default user_login;