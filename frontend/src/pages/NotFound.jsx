import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page not found</p>
        <Link to="/dashboard" className="btn btn-primary mt-6 inline-block">
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound
