import React, { useEffect, useState, useCallback } from 'react';
import Header from './Header';
import { useNavigate } from 'react-router-dom'; 
import RegisterResidents from './RegisterResidents';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../styles/AddResident.css';

const ResidentsList = () => {
    const [residents, setResidents] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [showRegister, setShowRegister] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredResidents, setFilteredResidents] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
   

    const fetchResidents = useCallback(async (page) => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/processes/residentsprocess.php?page=${page}&recordsPerPage=10&active=true`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setResidents(data.residents);

            const sortedResidents = data.residents.sort((a, b) => a.complete_name.localeCompare(b.complete_name));
        
            setFilteredResidents(sortedResidents);

            setTotalPages(data.totalPages);
            setFilteredResidents(data.residents); // Initialize with full residents list.
        } catch (error) {
            console.error('Error fetching residents:', error);
        } finally {
            setLoading(false);
        }
    }, []);

   

    useEffect(() => {
        fetchResidents(currentPage);
    }, [currentPage, fetchResidents]);

    const handleSearch = useCallback(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const filteredList = residents.filter(resident =>
            resident.complete_name.toLowerCase().includes(lowerCaseQuery) ||
            resident.address.toLowerCase().includes(lowerCaseQuery)
        );

        filteredList.sort((a, b) => a.complete_name.localeCompare(b.complete_name));

        setFilteredResidents(filteredList);
    }, [searchQuery, residents]);

    useEffect(() => {
        handleSearch();
    }, [searchQuery, handleSearch]);

    

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleAddNewClick = () => {
        setSelectedResident(null);
        setShowRegister(true);
    };
    
    const handleEditClick = (resident, event) => {
        event.stopPropagation();
        setSelectedResident(resident);
        setShowRegister(true);
    };

    const handleDeleteClick = async (residentId) => {
        if (user.role === 'Encoder') {
            alert("You do not have permission to delete residents.");
            return;
        }

        if (window.confirm('Are you sure you want to delete this resident?')) {
          try {
            await deleteResident(residentId);
          } catch (error) {
            console.error('Error deleting resident:', error);
            alert(`An error occurred while deleting the resident: ${error.message}`);
          }
        }
    };

    const deleteResident = async (residentId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/processes/deleteres.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: residentId }),
            });
    
            console.log("Response: ", await response.clone().text()); // Log the response body for debugging
   
            // Check for response status
            if (!response.ok) {
                const errorDetails = await response.text(); // Fetch the text response for debugging
                throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorDetails}`);
            }
    
            const data = await response.json();
            if (data.success) {
                alert('Resident deleted successfully.');
                navigate('/dashboard/residents');
            } else {
                alert(`Deletion failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error deleting resident:', error);
            alert(`An error occurred while deleting the resident: ${error.message}`);
        }
    };

    const handleCloseModal = () => {
        setShowRegister(false);
    };

    const handleResidentClick = (residentId) => {
        navigate(`/dashboard/resident/${residentId}`);
    };

    return (
        <div className='landing-page'>
            <div className="content">
                {showRegister && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <RegisterResidents resident={selectedResident} onClose={handleCloseModal} />
                            <button className="close-btns" onClick={handleCloseModal}>&times;</button>
                        </div>
                    </div>
                )}

                {!showRegister && (
                    <>
                        <div className="titles" style={{marginRight:"auto"}}>Residents</div>
                        <div className="members1">
                            <div className='content-wrapper'>
                            <div className='form-row' style={{ display: "flex", alignItems: "center" }}>
    <div style={{ marginRight: '10px', flexShrink: 0 }}>
        {(user.role === 'Admin' || user.role === 'Encoder') && (
            <button onClick={handleAddNewClick} className="btnreg" style={{ width: "100%" }}>Add New</button>
        )}   
     </div>
    
    <div className="search-wrapper" style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        <input
            style={{ marginLeft:"50%",width: "30%", padding: "9px", marginRight: '10px' }} // Margin for separation
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch} style={{ width:"15%",padding: "10px 16px" }}>Search</button>
    </div>
</div>

                                {loading ? (
                                    <p>Loading...</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Complete Name</th>
                                                <th>Address</th>
                                                <th>Contact#</th>
                                                <th>Email</th>
                                                {(user.role === 'Admin' || user.role === 'Encoder') && <th>Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredResidents.map((resident) => (
                                                <tr key={resident.id} onClick={() => handleResidentClick(resident.id)}>
                                                    <td>{resident.complete_name}</td>
                                                    <td>{resident.address}</td>
                                                    <td>{resident.contactNo}</td>
                                                    <td>{resident.email}</td>
                                                    
                                                    {(user.role === 'Admin' || user.role === 'Encoder') && (
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button className="actlinks" onClick={(e) => handleEditClick(resident, e)}>
                                                                    <FontAwesomeIcon icon={faEdit} />
                                                                </button>
                                                                {user.role === 'Admin' && (  // Show delete button only for Admin
                                                                    <>
                                                                        <span className="divider">|</span>
                                                                        <button className="deletes" onClick={() => handleDeleteClick(resident.id)}>
                                                                            <FontAwesomeIcon icon={faTrash} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                    
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <button disabled={currentPage === 1} onClick={() => handlePageChange(1)}>&laquo;</button>
                                        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>&lt;</button>
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
                                        <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>&gt;</button>
                                        <button disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>&raquo;</button>
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

export default ResidentsList;


// //---------------------------------------------------------


