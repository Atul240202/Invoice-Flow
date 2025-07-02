export function SidebarLogo() {
  return (
    <div className="p-6 border-b border-slate-200">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg">
          <span className="text-white text-lg font-bold">IF</span>
        </div>
        <div>
          <h2 className="font-bold text-xl text-slate-900">InvoiceFlow</h2>
          <p className="text-sm text-slate-500 font-medium">GST Compliant</p>
        </div>
      </div>
    </div>
  );
}
