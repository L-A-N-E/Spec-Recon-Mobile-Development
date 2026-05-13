import { Navigate } from "react-router-dom"

interface PublicRouteProps {
    children: React.ReactNode
}

function PublicRoute({ children }: PublicRouteProps) {
    const isAuthenticated = false

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default PublicRoute