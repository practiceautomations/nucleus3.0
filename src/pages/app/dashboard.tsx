import AppLayout from '@/layouts/AppLayout';

const Dashboard = () => (
  <AppLayout title="Nucleus - Dashboard">
    <div className="p-4">
      <h1
        data-testid="dashboard"
        className="mt-2 mb-8 text-3xl font-extrabold text-gray-500"
      >
        Dashboard page
      </h1>
    </div>
  </AppLayout>
);

export default Dashboard;
