import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onBack: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onBack }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getUserRole = (loginId: string) => {
    const firstChar = loginId.charAt(0).toUpperCase();
    switch (firstChar) {
      case 'S':
        return 'student';
      case 'F':
        return 'faculty';
      case 'A':
        return 'admin';
      default:
        return null;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginId || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const role = getUserRole(loginId);
    if (!role) {
      toast({
        title: "Invalid Login ID",
        description: "Login ID must start with S (student), F (faculty), or A (admin)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // First, get the user's email from the profile using login_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, role')
        .eq('login_id', loginId)
        .maybeSingle();

      if (profileError || !profileData) {
        toast({
          title: "Login Failed",
          description: "Invalid login ID or user not found",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Get user email from auth.users
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profileData.user_id);
      
      if (userError || !userData.user?.email) {
        toast({
          title: "Login Failed", 
          description: "Unable to retrieve user information",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Login Successful",
        description: `Welcome back!`,
      });

      // Navigate based on role
      switch (profileData.role) {
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
          navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Enter your login ID and password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loginId">Login ID</Label>
            <Input
              id="loginId"
              type="text"
              placeholder="e.g., S1234, F5678, A0001"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              S = Student, F = Faculty, A = Admin
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};