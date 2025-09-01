import { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConversionResult } from '@/pages/Index';
import { CheckCircle, AlertTriangle, XCircle, Download, Eye, Code } from 'lucide-react';

type ErrorType = string | Error | Record<string, unknown> | null;

interface FHIRResource {
  resourceType: string;
  id?: string;
  [key: string]: unknown;
}

interface BundleEntry {
  resource?: FHIRResource;
  [key: string]: unknown;
}

interface Bundle {
  entry?: BundleEntry[];
  [key: string]: unknown;
}

interface ResultsDisplayProps {
  results:
    | (ConversionResult & {
        error?: ErrorType;
        warnings?: ErrorType[];
        errors?: ErrorType[];
        bundle?: Bundle;
      })
    | null;
  error?: ErrorType;
}

const formatError = (error: ErrorType): string => {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return JSON.stringify(error, null, 2);
};

export const ResultsDisplay = ({ results, error }: ResultsDisplayProps) => {
  const [showJson, setShowJson] = useState(false);

  const resources = useMemo<FHIRResource[]>(() => {
    if (!results) return [];

    try {
      if (results.error) {
        console.error('Error in response:', results.error);
        return [];
      }

      if (results.bundle?.entry?.length > 0) {
        return results.bundle.entry
          .map((entry) => entry?.resource as FHIRResource | undefined)
          .filter((r): r is FHIRResource => Boolean(r));
      }

      return (results.resources as FHIRResource[]) || [];
    } catch (err) {
      console.error('Error processing resources:', err);
      return [];
    }
  }, [results]);

  const downloadResults = useCallback(() => {
    try {
      if (!results) {
        console.error('No results to download');
        return;
      }

      const dataToDownload =
        results.bundle ||
        (resources.length > 0
          ? {
              resourceType: 'Bundle',
              type: 'collection',
              entry: resources.map((r) => ({ resource: r })),
            }
          : null);

      if (!dataToDownload) {
        console.error('No valid data to download');
        return;
      }

      const dataStr = JSON.stringify(dataToDownload, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fhir-results-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading results:', err);
    }
  }, [results, resources]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!results ? (
              <>
                <XCircle className="w-8 h-8 text-yellow-500" />
                <div>
                  <h2 className="text-xl font-semibold">No Results</h2>
                  <p className="text-gray-600">Upload a file to begin conversion</p>
                </div>
              </>
            ) : (
              <>
                {results.success ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500" />
                )}
                <div>
                  <h2 className="text-xl font-semibold">
                    {results.success ? 'Conversion Successful' : 'Conversion Failed'}
                  </h2>
                  <p className="text-gray-600">
                    {resources.length} resource(s) generated
                    {results.warnings?.length > 0 && ` • ${results.warnings.length} warning(s)`}
                    {results.errors?.length > 0 && ` • ${results.errors.length} error(s)`}
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowJson(!showJson)}
              disabled={!results?.success}
            >
              {showJson ? <Eye className="w-4 h-4 mr-2" /> : <Code className="w-4 h-4 mr-2" />}
              {showJson ? 'Readable View' : 'JSON View'}
            </Button>
            <Button onClick={downloadResults} disabled={!results.success}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </Card>

      {(error || (results && (results.errors?.length > 0 || results.warnings?.length > 0))) && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Issues Found</h3>
          <div className="space-y-3">
            {error && (
              <div key="error" className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700">{formatError(error)}</p>
                </div>
              </div>
            )}
            {results?.errors?.map((err, index) => (
              <div
                key={`error-${index}`}
                className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg"
              >
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700">{formatError(err)}</p>
                </div>
              </div>
            ))}
            {results?.warnings?.map((warning, index) => (
              <div
                key={`warning-${index}`}
                className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Warning</p>
                  <p className="text-sm text-yellow-700">{formatError(warning)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Resources Display */}
      {results?.success &&
        (showJson ? (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Generated FHIR Bundle</h3>
            <pre className="text-xs overflow-x-auto bg-white p-3 rounded border">
              {JSON.stringify(results.bundle, null, 2)}
            </pre>
          </Card>
        ) : (
          resources.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Generated FHIR Resources</h3>
              <Tabs defaultValue={resources[0]?.resourceType || 'resources'} className="w-full">
                <TabsList className="mb-4">
                  {Array.from(new Set(resources.map((r) => r.resourceType).filter(Boolean))).map(
                    (resourceType) => (
                      <TabsTrigger key={resourceType} value={resourceType}>
                        {resourceType}
                        <Badge variant="secondary" className="ml-2">
                          {resources.filter((r) => r.resourceType === resourceType).length}
                        </Badge>
                      </TabsTrigger>
                    ),
                  )}
                </TabsList>
                {Array.from(new Set(resources.map((r) => r.resourceType))).map((resourceType) => (
                  <TabsContent key={resourceType} value={resourceType} className="space-y-4">
                    {resources
                      .filter((resource) => resource.resourceType === resourceType)
                      .map((resource, index) => (
                        <Card key={index} className="p-4 bg-gray-50">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{resource.resourceType}</h4>
                              <Badge variant="outline">{resource.id}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {Object.entries(resource)
                                .filter(([key]) => key !== 'resourceType' && key !== 'id')
                                .slice(0, 6)
                                .map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium text-gray-600">{key}:</span>
                                    <span className="ml-2">
                                      {typeof value === 'object'
                                        ? JSON.stringify(value).substring(0, 50) + '...'
                                        : String(value)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                  </TabsContent>
                ))}
              </Tabs>
            </Card>
          )
        ))}
    </div>
  );
};
