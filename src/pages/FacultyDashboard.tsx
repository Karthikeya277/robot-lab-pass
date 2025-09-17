import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Plus, Clock, Calendar, User, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NewRequestDialog } from '@/components/dashboard/NewRequestDialog';

interface AccessRequest {
  id: string;
  purpose: string;
  request_date: string;
  in_time: string;
  out_time: string;
  status: string;
  created_at: string;
  is_for_students: boolean;
  num_systems?: number;
  num_students?: number;
  systems_allocated: number[] | null;
}

export default function FacultyDashboard() {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [requestType, setRequestType] = useState<'personal' | 'students'>('personal');

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch access requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const personalRequests = requests.filter(r => !r.is_for_students);
  const studentRequests = requests.filter(r => r.is_for_students);

  const handleLogout = async () => {
    await signOut();
  };

  const openNewRequest = (type: 'personal' | 'students') => {
    setRequestType(type);
    setShowNewRequest(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const renderRequestCard = (request: AccessRequest) => (
    <Card key={request.id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              {request.is_for_students ? (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  {request.purpose} (For Students)
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  {request.purpose}
                </>
              )}
            </CardTitle>
            <CardDescription className="flex items-center mt-2">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(request.request_date).toLocaleDateString()}
              <Clock className="w-4 h-4 ml-4 mr-1" />
              {request.in_time} - {request.out_time}
            </CardDescription>
            {request.is_for_students && (
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span>Students: {request.num_students}</span>
                <span>Systems: {request.num_systems}</span>
              </div>
            )}
          </div>
          <Badge className={getStatusColor(request.status)}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Submitted: {new Date(request.created_at).toLocaleDateString()}
          </p>
          {request.systems_allocated && request.systems_allocated.length > 0 && (
            <p className="text-sm font-medium">
              Systems Allocated: {request.systems_allocated.join(', ')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {profile?.name}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Profile Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Login ID</p>
                <p className="font-medium">{profile?.login_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{profile?.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Designation</p>
                <p className="font-medium">{profile?.designation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="personal">Personal Requests</TabsTrigger>
              <TabsTrigger value="students">Student Requests</TabsTrigger>
            </TabsList>
            <div className="space-x-2">
              <Button onClick={() => openNewRequest('personal')} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Personal Request
              </Button>
              <Button onClick={() => openNewRequest('students')}>
                <Plus className="w-4 h-4 mr-2" />
                Student Request
              </Button>
            </div>
          </div>

          <TabsContent value="personal" className="space-y-4">
            {personalRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Personal Requests</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't submitted any personal access requests yet.
                  </p>
                  <Button onClick={() => openNewRequest('personal')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Personal Request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              personalRequests.map(renderRequestCard)
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            {studentRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Student Requests</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't submitted any requests for your students yet.
                  </p>
                  <Button onClick={() => openNewRequest('students')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Student Request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              studentRequests.map(renderRequestCard)
            )}
          </TabsContent>
        </Tabs>
      </div>

      <NewRequestDialog
        open={showNewRequest}
        onClose={() => setShowNewRequest(false)}
        onSuccess={() => {
          fetchRequests();
          setShowNewRequest(false);
        }}
        userRole="faculty"
        requestType={requestType}
      />
    </div>
  );
}