import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      // Redirect authenticated users to their appropriate dashboard
      switch (profile.role) {
        case 'student':
          navigate('/student-dashboard');
          break;
        case 'faculty':
          navigate('/faculty-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          break;
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="mb-4 text-4xl font-bold">AI Robotics Lab</h1>
        <p className="text-xl text-muted-foreground">Access Management System</p>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Welcome to the AI Robotics Lab Access Management System. 
            Please login or register to access the lab facilities.
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="w-full max-w-xs"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
