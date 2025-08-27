export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">UNO Digital Backend</h1>
      </div>
      
      <div className="mb-32 grid text-center lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">
            API Tracking Middleware
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Track all API requests with detailed analytics and monitoring.
          </p>
        </div>
        
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">
            Statistics Endpoints
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Real-time statistics and analytics for API usage.
          </p>
        </div>
        
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">
            Performance Monitoring
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Monitor response times and system performance.
          </p>
        </div>
        
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">
            Database Integration
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Prisma ORM with SQLite for data persistence.
          </p>
        </div>
      </div>
    </main>
  )
}