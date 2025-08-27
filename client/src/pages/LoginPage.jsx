import AuthForm from "../components/AuthForm";

const LoginPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <AuthForm isLogin />
        </div>
    );
};

export default LoginPage;