export function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`transition-all duration-300 ease-in-out font-medium rounded-xl px-3 py-2 ${className}`}
    >
      {children}
    </button>
  );
}
