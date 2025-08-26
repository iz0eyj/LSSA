{/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          // ... existing code ...
        </div>
        
        {/* Navigation */}
        <nav className="mt-6">
          // ... existing code ...
        </nav>
        
        {/* Status */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          // ... existing code ...
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          // ... existing code ...
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          // ... existing code ...
        </main>
      </div>