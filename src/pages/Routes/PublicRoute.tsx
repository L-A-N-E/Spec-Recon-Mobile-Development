import { Navigate, Outlet } from "react-router-dom"

function PublicRoute() {

    const isAuthenticated = false

    return isAuthenticated
        ? <Navigate to="/dashboard" replace />
        : <Outlet />
}

export default PublicRoute