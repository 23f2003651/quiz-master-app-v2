const Home = {
    template: `
        <div class="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">

            <div class="text-center" style="transform: translateY(-25%);">
                <h1 class="text-black px-4 py-3 fw-bold" style="font-size: 6rem;">Welcome to Quizzy</h1>
                <button @click="redirectLogin" class="btn btn-primary mt-3 px-4 py-2 fs-4">Go to Login Page</button>
            </div>

        </div>
    `,

    methods: {
        redirectLogin() {
            this.$router.push('/login')
        }
    }
}

export default Home;
