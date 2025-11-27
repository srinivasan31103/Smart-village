const PriorityBadge = ({ priority }) => {
  const getPriorityClass = () => {
    switch (priority?.toLowerCase()) {
      case 'low':
        return 'badge-low'
      case 'medium':
        return 'badge-medium'
      case 'high':
        return 'badge-high'
      case 'critical':
        return 'badge-critical'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`badge ${getPriorityClass()}`}>
      {priority?.toUpperCase()}
    </span>
  )
}

export default PriorityBadge
