import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NewRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userRole: 'student' | 'faculty';
  requestType?: 'personal' | 'students';
}

export const NewRequestDialog: React.FC<NewRequestDialogProps> = ({
  open,
  onClose,
  onSuccess,
  userRole,
  requestType = 'personal',
}) => {
  const [formData, setFormData] = useState({
    purpose: '',
    date: '',
    inTime: '',
    outTime: '',
    numSystems: '',
    numStudents: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.purpose || !formData.date || !formData.inTime || !formData.outTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (userRole === 'faculty' && requestType === 'students') {
      if (!formData.numSystems || !formData.numStudents) {
        toast({
          title: "Error",
          description: "Please specify number of systems and students",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const requestData: any = {
        user_id: user?.id,
        purpose: formData.purpose,
        request_date: formData.date,
        in_time: formData.inTime,
        out_time: formData.outTime,
        is_for_students: userRole === 'faculty' && requestType === 'students',
      };

      if (userRole === 'faculty' && requestType === 'students') {
        requestData.num_systems = parseInt(formData.numSystems);
        requestData.num_students = parseInt(formData.numStudents);
      }

      const { error } = await supabase
        .from('access_requests')
        .insert(requestData);

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your access request has been submitted successfully",
      });

      // Reset form
      setFormData({
        purpose: '',
        date: '',
        inTime: '',
        outTime: '',
        numSystems: '',
        numStudents: '',
      });

      onSuccess();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            New {userRole === 'faculty' && requestType === 'students' ? 'Student' : 'Personal'} Access Request
          </DialogTitle>
          <DialogDescription>
            Fill in the details for your lab access request.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              placeholder="Describe the purpose of your visit"
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inTime">In Time</Label>
              <Input
                id="inTime"
                type="time"
                value={formData.inTime}
                onChange={(e) => handleInputChange('inTime', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outTime">Out Time</Label>
              <Input
                id="outTime"
                type="time"
                value={formData.outTime}
                onChange={(e) => handleInputChange('outTime', e.target.value)}
                required
              />
            </div>
          </div>

          {userRole === 'faculty' && requestType === 'students' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numSystems">Number of Systems</Label>
                <Input
                  id="numSystems"
                  type="number"
                  min="1"
                  max="28"
                  placeholder="Max 28"
                  value={formData.numSystems}
                  onChange={(e) => handleInputChange('numSystems', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numStudents">Number of Students</Label>
                <Input
                  id="numStudents"
                  type="number"
                  min="1"
                  placeholder="Number of students"
                  value={formData.numStudents}
                  onChange={(e) => handleInputChange('numStudents', e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};