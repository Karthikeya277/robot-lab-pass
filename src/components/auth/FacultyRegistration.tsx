import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FacultyRegistrationProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const FacultyRegistration: React.FC<FacultyRegistrationProps> = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    designation: '',
    phoneNumber: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateLoginId = (phoneNumber: string) => {
    const lastFourDigits = phoneNumber.slice(-4);
    return `F${lastFourDigits}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.department || !formData.designation || !formData.phoneNumber || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.phoneNumber.length !== 10 || !/^\d+$/.test(formData.phoneNumber)) {
      toast({
        title: "Error",
        description: "Phone number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const loginId = generateLoginId(formData.phoneNumber);
      
      // Check if login ID already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('login_id')
        .eq('login_id', loginId)
        .maybeSingle();

      if (existingProfile) {
        toast({
          title: "Registration Failed",
          description: "A user with this phone number already exists",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create user account
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: formData.name,
            role: 'faculty',
          }
        }
      });

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            role: 'faculty',
            login_id: loginId,
            name: formData.name,
            phone_number: formData.phoneNumber,
            department: formData.department,
            designation: formData.designation,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast({
            title: "Registration Error",
            description: "Account created but profile setup failed. Please contact support.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        toast({
          title: "Registration Successful!",
          description: `Your login ID is: ${loginId}. Please remember it for login.`,
        });
        
        onSuccess();
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
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
        <CardTitle className="text-2xl font-bold">Faculty Registration</CardTitle>
        <CardDescription>
          Fill in your details to create a faculty account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CSE">Computer Science Engineering</SelectItem>
                <SelectItem value="ECE">Electronics and Communication</SelectItem>
                <SelectItem value="EEE">Electrical and Electronics</SelectItem>
                <SelectItem value="ME">Mechanical Engineering</SelectItem>
                <SelectItem value="CE">Civil Engineering</SelectItem>
                <SelectItem value="IT">Information Technology</SelectItem>
                <SelectItem value="AI">Artificial Intelligence</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Select value={formData.designation} onValueChange={(value) => handleInputChange('designation', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                <SelectItem value="Professor">Professor</SelectItem>
                <SelectItem value="HOD">Head of Department</SelectItem>
                <SelectItem value="Lab Instructor">Lab Instructor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="10-digit phone number"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              maxLength={10}
              required
            />
            {formData.phoneNumber.length >= 4 && (
              <p className="text-sm text-muted-foreground">
                Your login ID will be: F{formData.phoneNumber.slice(-4)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email ID</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};