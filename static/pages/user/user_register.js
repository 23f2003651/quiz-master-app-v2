
const user_login = {
  template: /* html */ `

  <div class="container">
			<div class="login-container">
			
				<h2>Login</h2>
				
				<input v-model="email" type="email" id="email" name="email" placeholder="Email" required>
				<input v-model="username" type="text" id="username" name="email" placeholder="Username" required>
				<input v-model="qualification" type="email" id="qualification" name="qualification" placeholder="Qualification" required>

				<input v-model="password" id="password" name="password" type="password" placeholder="Password" required>
				<button @click="registerUser" id="login" type="submit"><login-icon></login-icon></button>
			
			</div>
    </div>

  `,

	data() {
		return {
			email: '',
			username: '',
			qualification: '',
			password: ''
		}
	},

	methods: {
		async registerUser() {
			console.log("Registering User");
		}
	}
}

export default user_login;