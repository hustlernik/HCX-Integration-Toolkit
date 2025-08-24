import { Bundle } from 'fhir/r4';

interface BuildTaskBundleOpts {
  responseBundle: Bundle;
  now?: string;
}

export function buildInsurancePlanTaskBundle(opts: BuildTaskBundleOpts): Bundle {
  const { responseBundle, now } = opts;
  const taskId = `task-${Date.now()}`;
  const currentTimestamp = now || new Date().toISOString();

  return {
    resourceType: 'Bundle',
    id: `task-bundle-${Date.now()}`,
    type: 'collection',
    timestamp: currentTimestamp,
    entry: [
      {
        fullUrl: `urn:uuid:${taskId}`,
        resource: {
          resourceType: 'Task',
          id: taskId,
          status: 'completed',
          intent: 'order',
          output: [
            {
              type: { text: 'InsurancePlanBundle' },
              valueReference: {
                reference: `Bundle/${responseBundle?.id || 'insurance-plan-bundle'}`,
              },
            },
          ],
        } as any,
      },
      {
        fullUrl: `Bundle/${responseBundle?.id || 'insurance-plan-bundle'}`,
        resource: responseBundle as any,
      },
    ],
  } as Bundle;
}
