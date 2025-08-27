import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import useAuthStore from '../hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

const AuthForm = ({ isLogin = false }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        leetcodeUsername: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        try {
            const res = await api.post(endpoint, formData);
            login(res.data);
            navigate('/');
            toast.success(`Welcome ${isLogin ? '' : 'aboard'}, ${res.data.username}!`, {
                description: `You have successfully ${isLogin ? 'logged in' : 'registered'}.`,
            });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
            toast.error("Authentication Failed", {
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">{isLogin ? 'Login' : 'Register'}</CardTitle>
                <CardDescription>
                    {isLogin ? 'Enter your email below to login to your account.' : 'Enter your information to create an account.'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                    {!isLogin && (
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" type="text" onChange={handleChange} required />
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" onChange={handleChange} required />
                    </div>
                    {!isLogin && (
                         <div className="grid gap-2">
                            <Label htmlFor="leetcodeUsername">LeetCode Username</Label>
                            <Input id="leetcodeUsername" name="leetcodeUsername" type="text" onChange={handleChange} required />
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" onChange={handleChange} required />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                    <Button className="w-full" type="submit" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}
                    </Button>
                    <div className="mt-4 text-center text-sm">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <Link to={isLogin ? '/register' : '/login'} className="underline">
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
};

export default AuthForm;