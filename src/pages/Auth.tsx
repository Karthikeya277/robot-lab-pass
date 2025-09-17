import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupTypeSelection } from '@/components/auth/SignupTypeSelection';
import { StudentRegistration } from '@/components/auth/StudentRegistration';
import { FacultyRegistration } from '@/components/auth/FacultyRegistration';

type AuthView = 'main' | 'login' | 'signup-type' | 'student-signup' | 'faculty-signup';

export default function Auth() {
  const [currentView, setCurrentView] = useState<AuthView>('main');

  const renderContent = () => {
    switch (currentView) {
      case 'login':
        return <LoginForm onBack={() => setCurrentView('main')} />;
      case 'signup-type':
        return (
          <SignupTypeSelection
            onBack={() => setCurrentView('main')}
            onSelectStudent={() => setCurrentView('student-signup')}
            onSelectFaculty={() => setCurrentView('faculty-signup')}
          />
        );
      case 'student-signup':
        return (
          <StudentRegistration
            onBack={() => setCurrentView('signup-type')}
            onSuccess={() => setCurrentView('login')}
          />
        );
      case 'faculty-signup':
        return (
          <FacultyRegistration
            onBack={() => setCurrentView('signup-type')}
            onSuccess={() => setCurrentView('login')}
          />
        );
      default:
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">AI Robotics Lab Access</CardTitle>
              <CardDescription>
                Welcome to the AI Robotics Lab Access Management System
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setCurrentView('login')} 
                className="w-full"
                size="lg"
              >
                Login
              </Button>
              <Button 
                onClick={() => setCurrentView('signup-type')} 
                variant="outline" 
                className="w-full"
                size="lg"
              >
                Sign Up
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {renderContent()}
    </div>
  );
}