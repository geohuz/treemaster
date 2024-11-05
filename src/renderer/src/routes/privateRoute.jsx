import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { api } from '../stores/api'

export default function PrivateRoute({
  isAllowed,
  redirectPath,
  children,
}) {
  const location = useLocation()
  isAllowed = (api.getToken()!==undefined)
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace state={{from: location}} />
  } else {
    return children ? children : <Outlet />
  }
}

