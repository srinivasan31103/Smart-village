const StatusBadge = ({ status }) => {
  const getStatusClass = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'badge-pending'
      case 'in-progress':
        return 'badge-in-progress'
      case 'resolved':
        return 'badge-resolved'
      case 'rejected':
        return 'badge-rejected'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`badge ${getStatusClass()}`}>
      {status?.toUpperCase()}
    </span>
  )
}

export default StatusBadge
