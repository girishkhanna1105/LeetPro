import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import useAuthStore from './hooks/useAuth';
import { Toaster as SonnerToaster } from 'sonner';

function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <Router>
      <main className="dark bg-background text-foreground min-h-screen">
        <Routes>
          <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/" />} />
          <Route 
            path="/" 
            element={token ? <HomePage /> : <Navigate to="/login" />} 
          />
          <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
        </Routes>
        <SonnerToaster richColors position="top-right" />
      </main>
    </Router>
  );
}

export default App;