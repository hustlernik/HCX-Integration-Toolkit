import { Card } from '@/components/ui/card';
import { Bot, Settings, Loader2 } from 'lucide-react';

interface ProcessingProgressProps {
  step: string;
  mode: string;
}

export const ProcessingProgress = ({ step, mode }: ProcessingProgressProps) => {
  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          {mode === 'ai' ? (
            <Bot className="w-8 h-8 text-blue-600" />
          ) : (
            <Settings className="w-8 h-8 text-blue-600" />
          )}
        </div>
        <h2 className="text-2xl font-semibold mb-2">AI Processing</h2>
        <p className="text-gray-600">Converting your data to FHIR R4 format</p>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-lg font-medium">{step}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
