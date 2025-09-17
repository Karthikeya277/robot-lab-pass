import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap, Users } from 'lucide-react';

interface SignupTypeSelectionProps {
  onBack: () => void;
  onSelectStudent: () => void;
  onSelectFaculty: () => void;
}

export const SignupTypeSelection: React.FC<SignupTypeSelectionProps> = ({
  onBack,
  onSelectStudent,
  onSelectFaculty,
}) => {
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
        <CardTitle className="text-2xl font-bold">Choose Account Type</CardTitle>
        <CardDescription>
          Select the type of account you want to create
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={onSelectStudent}
          variant="outline"
          className="w-full h-20 flex flex-col items-center justify-center space-y-2"
        >
          <GraduationCap className="w-8 h-8" />
          <span className="text-lg font-medium">Student</span>
        </Button>
        <Button
          onClick={onSelectFaculty}
          variant="outline"
          className="w-full h-20 flex flex-col items-center justify-center space-y-2"
        >
          <Users className="w-8 h-8" />
          <span className="text-lg font-medium">Faculty</span>
        </Button>
      </CardContent>
    </Card>
  );
};