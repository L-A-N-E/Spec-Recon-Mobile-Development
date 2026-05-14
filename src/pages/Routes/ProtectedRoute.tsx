import { Navigate, Outlet } from "react-router-dom"

function ProtectedRoute() {

    const isAuthenticated = false

    return isAuthenticated
        ? <Outlet />
        : <Navigate to="/login" replace />
}

export default ProtectedRoute