import { useState } from 'react';
import { FileUploadZone } from '@/components/common/FileUploadZone';
import { ProcessingProgress } from '@/components/common/ProcessingProgress';
import { ResultsDisplay } from '@/components/common/ResultsDisplay';
import { Header } from '@/components/common/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export interface ConversionResult {
  success: boolean;
  resources: Record<string, unknown>[];
  errors: string[];
  warnings: string[];
  bundle?: Record<string, unknown>;
}

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [results, setResults] = useState<ConversionResult | null>(null);

  const [activeTab, setActiveTab] = useState('upload');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResults(null);
  };

  const handleConversion = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProcessingStep('Processing InsurancePlan conversion...');
    setActiveTab('results');
    setResults(null);

    const formData = new FormData();
    formData.append('inputFile', file);

    try {
      setProcessingStep('Processing InsurancePlan conversion...');
      const response = await fetch('http://localhost:5001/api/insuranceplan/convert', {
        method: 'POST',
        body: formData,
      });

      setProcessingStep('Processing response...');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      let bundle = null;
      let resources = [];
      let errors = [];
      let warnings = [];

      if (data.resourceType === 'Bundle') {
        bundle = data;
        resources = data.entry?.map((entry: any) => entry.resource).filter(Boolean) || [];
      } else if (data.bundle) {
        bundle = data.bundle;
        resources = data.bundle.entry?.map((entry: any) => entry.resource).filter(Boolean) || [];
      } else if (data.fhirResource) {
        resources = [data.fhirResource];

        bundle = {
          resourceType: 'Bundle',
          type: 'collection',
          entry: resources.map((resource: any) => ({ resource })),
        };
      }

      if (data.errors) errors = data.errors;
      if (data.warnings) warnings = data.warnings;

      setResults({
        success: resources.length > 0,
        resources: resources,
        errors: errors,
        warnings: warnings,
        bundle: bundle,
      });
    } catch (error) {
      console.error('Conversion error:', error);

      const errorMessages: string[] = [];
      if (error instanceof Error) {
        errorMessages.push(error.message);

        try {
          const parsedJsonError = JSON.parse(error.message);
          if (parsedJsonError.message) errorMessages.push(parsedJsonError.message);
          if (parsedJsonError.errors && Array.isArray(parsedJsonError.errors)) {
            errorMessages.push(...parsedJsonError.errors);
          }
        } catch (e) {}
      } else {
        errorMessages.push('An unknown error occurred during conversion.');
      }

      setResults({
        success: false,
        resources: [],
        errors: Array.from(
          new Set(errorMessages.filter((msg) => typeof msg === 'string' && msg.trim() !== '')),
        ),
        warnings: [],
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Excel to FHIR R4 Converter</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your healthcare data into standardized FHIR R4 resources with intelligent
            validation and AI-powered processing
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upload" className="text-sm">
              1. Upload File
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!file} className="text-sm">
              2. Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold mb-2">Upload Insurance Plan Document</h2>
                <p className="text-gray-600">
                  Convert Excel (.xlsx, .xls) or PDF documents to FHIR InsurancePlan resources
                </p>
              </div>
              <FileUploadZone
                onFileSelect={handleFileSelect}
                selectedFile={file}
                acceptedFormats={
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/pdf'
                }
              />
            </Card>

            {file && (
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Ready to Convert</h3>
                    <p className="text-gray-600">Convert to FHIR InsurancePlan resource</p>
                  </div>
                  <Button
                    onClick={handleConversion}
                    disabled={!file || isProcessing}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Start Conversion'
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {isProcessing ? (
              <ProcessingProgress step={processingStep} mode="insurance-plan" />
            ) : (
              <ResultsDisplay
                results={
                  results || {
                    success: false,
                    resources: [],
                    errors: [],
                    warnings: [],
                  }
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
