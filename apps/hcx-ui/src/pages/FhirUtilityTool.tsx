import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FhirUtilityTool = () => {
  const navigate = useNavigate();
  const fhirToolUrl = 'http://localhost:8080';

  useEffect(() => {
    window.location.href = fhirToolUrl;
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to FHIR Utility Tool...</h1>
        <p className="mb-4">
          If you are not redirected automatically, please click the button below:
        </p>
        <button
          onClick={() => (window.location.href = fhirToolUrl)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Go to FHIR Utility Tool
        </button>
      </div>
    </div>
  );
};

export default FhirUtilityTool;
