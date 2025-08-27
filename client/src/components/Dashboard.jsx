import { useState, useEffect } from 'react';
import api from '../api';
import useAuthStore from '../hooks/useAuth';
import TopicMasteryChart from './TopicMasteryChart';
import AiModal from './AiModal';
import AiFeedbackDisplay from './AiFeedbackDisplay'; // Import the new component
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { LogOut, RefreshCw, Trophy, BrainCircuit, ListChecks } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
    const { logout, setUser } = useAuthStore();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/user/me');
            setUserData(res.data);
            setUser(res.data);
        } catch (error) {
            toast.error("Failed to fetch user data.", {
              description: "Please try logging in again."
            });
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        toast.info("Refreshing your LeetCode stats...");
        try {
            const res = await api.post('/user/refresh-stats');
            setUserData(res.data.user);
            setUser(res.data.user);
            toast.success("Stats refreshed successfully!");
        } catch (error) {
            toast.error("Failed to refresh stats.", {
              description: error.response?.data?.message || "Please try again later."
            });
        } finally {
            setIsRefreshing(false);
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
    if (!userData) return <div className="flex justify-center items-center h-screen text-destructive">Could not load user data.</div>;

    const latestStats = userData.statsHistory[userData.statsHistory.length - 1];
    const latestFeedback = userData.aiFeedback.length > 0 ? userData.aiFeedback[userData.aiFeedback.length - 1].feedback : "No feedback yet. Generate one!";

    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Welcome, {userData.username}!</h1>
                    <p className="text-muted-foreground">Your LeetCode journey at a glance.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleRefresh} variant="outline" size="icon" disabled={isRefreshing}>
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={logout} variant="secondary">
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Solved</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{latestStats?.totalSolved || 0}</div>
                        <div className="flex space-x-2 text-xs text-muted-foreground mt-1">
                            <span className="text-green-400">E: {latestStats?.easySolved || 0}</span>
                            <span className="text-yellow-400">M: {latestStats?.mediumSolved || 0}</span>
                            <span className="text-red-400">H: {latestStats?.hardSolved || 0}</span>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last AI Feedback</CardTitle>
                        <BrainCircuit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        {/* This uses the new component to properly render the AI response */}
                        <AiFeedbackDisplay responseString={latestFeedback} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Topic Mastery</CardTitle>
                        <CardDescription>Problems solved per topic.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {latestStats?.topicStats && <TopicMasteryChart data={latestStats.topicStats} />}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center"><ListChecks className="h-5 w-5 mr-2" /> AI Suggested Questions</CardTitle>
                        <CardDescription>Personalized recommendations to target weak areas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                        {userData.suggestedQuestions && userData.suggestedQuestions.length > 0 ? (
                            userData.suggestedQuestions.map((q, i) => (
                                <li key={i} className="flex flex-col p-3 bg-background rounded-md border">
                                    <a href={q.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{q.title}</a>
                                    <span className={`text-xs font-bold ${q.difficulty === 'Easy' ? 'text-green-400' : q.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>{q.difficulty}</span>
                                    <p className="text-sm text-muted-foreground mt-1">{q.reason}</p>
                                </li>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center pt-8">Click the magic wand to get your first set of recommendations!</p>
                        )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
            
            <AiModal onSuggestionGenerated={fetchData} />
        </div>
    );
};

export default Dashboard;