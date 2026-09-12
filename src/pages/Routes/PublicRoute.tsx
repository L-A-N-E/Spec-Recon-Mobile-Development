import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

function PublicRoute() {

    const { isAuthenticated } = useAuth()

    return isAuthenticated
        ? <Navigate to="/radar" replace />
        : <Outlet />
}

export default PublicRoute