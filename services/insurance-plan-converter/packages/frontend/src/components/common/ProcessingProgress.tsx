import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Bot, Settings, Loader2 } from 'lucide-react';

interface ProcessingProgressProps {
  step: string;
  mode: string;
}

export const ProcessingProgress = ({ step, mode }: ProcessingProgressProps) => {
  const steps =
    mode === 'ai'
      ? [
          'Analyzing input...',
          'Extracting data with AI...',
          'Generating FHIR resources...',
          'Validating output...',
        ]
      : [
          'Parsing Excel structure...',
          'Validating input format...',
          'Mapping to FHIR...',
          'Validating FHIR resources...',
        ];

  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

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
        <h2 className="text-2xl font-semibold mb-2">
          {mode === 'ai' ? 'AI Processing' : 'Rule-Based Processing'}
        </h2>
        <p className="text-gray-600">Converting your data to FHIR R4 format</p>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-lg font-medium">{step}</span>
          </div>
          <Progress value={progress} className="w-full max-w-md mx-auto" />
          <p className="text-sm text-gray-500 mt-2">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((stepName, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border text-center text-sm ${
                index < currentStepIndex
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : index === currentStepIndex
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold ${
                  index < currentStepIndex
                    ? 'bg-green-500 text-white'
                    : index === currentStepIndex
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              {stepName.replace('...', '')}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
