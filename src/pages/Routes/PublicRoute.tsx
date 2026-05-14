import { Navigate } from "react-router-dom"

interface PublicRouteProps {
    children: React.ReactNode
}

function PublicRoute({
    children,
}: PublicRouteProps) {

    // futuramente:
    // const { user } = useAuth()

    const isAuthenticated = false

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default PublicRoute