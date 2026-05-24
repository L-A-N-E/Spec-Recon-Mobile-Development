import { Navigate, Outlet } from "react-router-dom"

function PublicRoute() {

    const isAuthenticated = true

    return isAuthenticated
        ? <Navigate to="/dashboard" replace />
        : <Outlet />
}

export default PublicRoute