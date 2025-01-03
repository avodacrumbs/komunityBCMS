import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/AddResident.css";
import { type } from '@testing-library/user-event/dist/type';

const Archive = () => {
  const [archivedResidents, setArchivedResidents] = useState([]);
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("residents"); // Track the active tab

  useEffect(() => {
    const fetchArchivedData = async () => {
      try {
        // Fetch archived residents
        const residentResponse = await axios.get(`${process.env.REACT_APP_API_URL}/processes/getarchivelist.php`);
        if (residentResponse.data.success && Array.isArray(residentResponse.data.residents.residents)) {
          const sortedResidents = residentResponse.data.residents.residents.sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at));
          setArchivedResidents(sortedResidents);
        } else {
          console.error('Failed to fetch archived residents:', residentResponse.data);
        }
        const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/processes/getarchiveuser.php`);
        if (userResponse.data.success && Array.isArray(userResponse.data.residents)) {
        setArchivedUsers(userResponse.data.residents);  // Use 'residents' instead of 'users'
        } else {
        console.error('Failed to fetch archived users:', userResponse.data);
        }

      } catch (error) {
        console.error('Error fetching archived data:', error);
      }
    };

    fetchArchivedData();
  }, []);

  const restoreResident = async (residentId) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/processes/restoreresident.php`, 
        { id: residentId,
            type: 'resident',
         },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        setArchivedResidents(prevResidents =>
          prevResidents.filter(resident => resident.id !== residentId)
        );
        console.log('Resident restored successfully');
      } else {
        console.error('Failed to restore resident:', response.data.message);
      }
    } catch (error) {
      console.error('Error restoring resident:', error);
    }
  };

  const restoreUser = async (userId) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/processes/restoreresident.php`, 
        { id: userId ,
            type: 'user',
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        setArchivedUsers(prevUsers =>
          prevUsers.filter(user => user.id !== userId)
        );
        console.log('User restored successfully');
      } else {
        console.error('Failed to restore user:', response.data.message);
      }
    } catch (error) {
      console.error('Error restoring user:', error);
    }
  };

  return (
    <div className="archive">
      <div className="tabs">
        <button 
          className={activeTab === "residents" ? "active-tab" : ""} 
          onClick={() => setActiveTab("residents")}
        >
          Residents Archived
        </button>
        <button 
          className={activeTab === "users" ? "active-tab" : ""} 
          onClick={() => setActiveTab("users")}
        >
          Users Archived
        </button>
      </div>
      {activeTab === "residents" && (
        <div className="tab-content">
          <h2>Archived Residents</h2>
          <table>
            <thead>
              <tr>
                <th>Complete Name</th>
                <th>Address</th>
                <th>Contact #</th>
                <th>Email</th>
                <th>Date Deleted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {archivedResidents.length > 0 ? (
                archivedResidents.map((resident) => (
                  <tr key={resident.id}>
                    <td>{resident.complete_name}</td>
                    <td>{resident.address}</td>
                    <td>{resident.contactNo}</td>
                    <td>{resident.email}</td>
                    <td>{resident.deleted_at}</td>
                    <td>
                      <button onClick={() => restoreResident(resident.id)} style={{marginLeft: '2px'}}>Restore</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No archived residents available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === "users" && (
        <div className="tab-content">
          <h2>Archived Users</h2>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Complete Name</th>
                <th>Email</th>
                <th>Contact #</th>
                <th>Role</th>
                <th>Date Deleted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {archivedUsers.length > 0 ? (
                archivedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.complete_name}</td>
                    <td>{user.email}</td>
                    <td>{user.contact_number}</td>
                    <td>{user.role_id}</td>
                    <td>{user.deleted_at}</td>
                    <td>
                      <button onClick={() => restoreUser(user.id)} style={{marginLeft: '2px'}}>Restore</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No archived users available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Archive;
