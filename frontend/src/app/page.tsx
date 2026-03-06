export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl font-bold mb-4 text-blue-600">Cruise</h1>
        <p className="text-xl text-gray-600 mb-8">智能开发管理平台</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">需求管理</h3>
            <p className="text-gray-600">需求录入、状态流转、优先级管理</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">任务管理</h3>
            <p className="text-gray-600">任务拆解、分配、进度跟踪</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">开发看板</h3>
            <p className="text-gray-600">多角色视图、实时数据聚合</p>
          </div>
        </div>
        <div className="mt-12 text-gray-500 text-sm">
          Phase 0 骨架搭建中...
        </div>
      </div>
    </main>
  );
}