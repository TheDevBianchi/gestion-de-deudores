const ErrorDisplay = ({ error }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Ha ocurrido un error
        </h3>
        <p className="text-red-600">
          {error}
        </p>
      </div>
    </div>
  );
};

export default ErrorDisplay; 