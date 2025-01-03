import React, { useEffect, useState, useCallback } from 'react';
import Header from './Header';
import RegisterPage from './RegisterPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const [filteredUsers, setFilteredUsers] = useState([]); // Filtered users state

  const fetchUsers = useCallback(async (page) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/processes/landingprocess.php?page=${page}&recordsPerPage=10`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setFilteredUsers(data.users); // Initialize with fetched users
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers]);

  // Update filteredUsers whenever the users or searchTerm changes
  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = users.filter(user =>
      user.complete_name.toLowerCase().includes(lowerCaseSearchTerm) ||
      user.username.toLowerCase().includes(lowerCaseSearchTerm) ||
      user.contact_number.includes(lowerCaseSearchTerm) ||
      user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
      user.role_name.toLowerCase().includes(lowerCaseSearchTerm)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddNewClick = () => {
    setSelectedUser(null);
    setShowRegister(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setShowRegister(true);
  };

  const handleDeleteClick = async (user) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(user.username);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(`An error occurred while deleting the user: ${error.message}`);
      }
    }
  };

  const deleteUser = async (username) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/processes/deleteuserprocess.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, action: 'delete' }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.success) {
        alert('User deleted successfully.');
        fetchUsers(currentPage);
      } else {
        alert(`Deletion failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`An error occurred while deleting the user: ${error.message}`);
    }
  };

  const handleCloseModal = () => {
    setShowRegister(false);
  };

  return (
    <div className="landing-page">
      <div className="content">
        {showRegister && (
          <div className="modal-overlays">
            <div className="modal-contents">
              <RegisterPage user={selectedUser} onClose={handleCloseModal} />
            </div>
          </div>
        )}

        {!showRegister && (
          <>
            <div className='fin'>
              <div className="title">Users</div>
              <div className="members">
                <div style={{ marginBottom: '20px', display:"flex"}}>
                  <button onClick={handleAddNewClick} className="btnreg">Add New</button>
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    style={{ marginLeft: '20px', padding: '5px', display:"flex", width:"30%"}} 
                  />
                  {/* The Search button has been removed as searching happens on input change */}
                </div>

                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Complete Name</th>
                        <th>Username</th>
                        <th>Contact#</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Operation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.username}>
                          <td>{user.complete_name}</td>
                          <td>{user.username}</td>
                          <td>{user.contact_number}</td>
                          <td>{user.email}</td>
                          <td>{user.role_name}</td>
                          <td>
                            <div className='action-buttons'>
                              <button
                                className="actlink"
                                onClick={() => handleEditClick(user)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button> 
                              | 
                              <button
                                className="delete"
                                onClick={() => handleDeleteClick(user)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button> 
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {totalPages > 1 && (
                  <div className="paginations">
                    <button 
                      disabled={currentPage === 1} 
                      onClick={() => handlePageChange(1)}
                    >
                      &laquo; {/* << */}
                    </button>

                    <button 
                      disabled={currentPage === 1} 
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      &lt; {/* < */}
                    </button>

                    <input 
                      type="number" 
                      value={currentPage} 
                      onChange={(e) => {
                          const page = Number(e.target.value);
                          if (page >= 1 && page <= totalPages) {
                              handlePageChange(page);
                          }
                      }} 
                      style={{ width: '50px', textAlign: 'center' }} 
                    />

                    <button 
                      disabled={currentPage === totalPages} 
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      &gt; {/* > */}
                    </button>

                    <button 
                      disabled={currentPage === totalPages} 
                      onClick={() => handlePageChange(totalPages)}
                    >
                      &raquo; {/* >> */}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LandingPage;