export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl overflow-hidden shadow-md ${className}`}>{children}</div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-6 py-4 border-b ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-lg font-bold ${className}`}>{children}</h3>
  );
}