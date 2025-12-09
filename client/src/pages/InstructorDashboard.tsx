import { Navigate } from 'react-router-dom';

export const InstructorDashboard: React.FC = () => {
    return <Navigate to="/admin/dashboard" replace />;
};
