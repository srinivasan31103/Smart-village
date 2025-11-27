import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  UsersIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

const Sidebar = () => {
  const { user } = useAuth()

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: ChartBarIcon,
      roles: ['admin', 'officer', 'citizen']
    },
    {
      name: 'Complaints',
      path: '/complaints',
      icon: ExclamationTriangleIcon,
      roles: ['admin', 'officer', 'citizen']
    },
    {
      name: 'Resources',
      path: '/resources',
      icon: CubeIcon,
      roles: ['admin', 'officer', 'citizen']
    },
    {
      name: 'Users',
      path: '/users',
      icon: UsersIcon,
      roles: ['admin']
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: UserCircleIcon,
      roles: ['admin', 'officer', 'citizen']
    }
  ]

  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(user?.role)
  )

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg overflow-y-auto">
      <nav className="p-4 space-y-2">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="h-6 w-6" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
