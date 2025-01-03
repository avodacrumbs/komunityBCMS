import React, { useEffect, useState, useCallback } from 'react';
import Header from './Header';
import { useNavigate } from 'react-router-dom'; 
import RegisterResidents from './RegisterResidents';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../styles/AddResident.css';

const Residents = () => {
    const [residents, setResidents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [showRegister, setShowRegister] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredResidents, setFilteredResidents] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const fetchResidents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/processes/residentlocationprocess.php?active=true`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const sortedResidents = data.residents.sort((a, b) => a.complete_name.localeCompare(b.complete_name));
            setResidents(sortedResidents);
            setFilteredResidents(sortedResidents);
        } catch (error) {
            console.error('Error fetching residents:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResidents();
    }, [fetchResidents]);

    const handleSearch = useCallback(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const filteredList = residents.filter(resident =>
            resident.complete_name.toLowerCase().includes(lowerCaseQuery) ||
            resident.address.toLowerCase().includes(lowerCaseQuery)
        );
        setFilteredResidents(filteredList);
        setCurrentPage(1); // Reset to the first page after filtering
    }, [searchQuery, residents]);

    useEffect(() => {
        handleSearch();
    }, [searchQuery, handleSearch]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= Math.ceil(filteredResidents.length / recordsPerPage)) {
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

            if (!response.ok) {
                const errorDetails = await response.text();
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

    const startIndex = (currentPage - 1) * recordsPerPage;
    const paginatedResidents = filteredResidents.slice(startIndex, startIndex + recordsPerPage);

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
                                            style={{ marginLeft:"50%",width: "30%", padding: "9px", marginRight: '10px' }}
                                            type="text"
                                            placeholder="Search by name"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        
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
                                            {paginatedResidents.map((resident) => (
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
                                                                {user.role === 'Admin' && (
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

                                {Math.ceil(filteredResidents.length / recordsPerPage) > 1 && (
                                    <div className="pagination">
                                        <button disabled={currentPage === 1} onClick={() => handlePageChange(1)}>&laquo;</button>
                                        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>&lt;</button>
                                        <input
                                            type="number"
                                            value={currentPage}
                                            onChange={(e) => {
                                                const page = Number(e.target.value);
                                                if (page >= 1 && page <= Math.ceil(filteredResidents.length / recordsPerPage)) {
                                                    handlePageChange(page);
                                                }
                                            }}
                                            style={{ width: '50px', textAlign: 'center' }}
                                        />
                                        <button disabled={currentPage === Math.ceil(filteredResidents.length / recordsPerPage)} onClick={() => handlePageChange(currentPage + 1)}>&gt;</button>
                                        <button disabled={currentPage === Math.ceil(filteredResidents.length / recordsPerPage)} onClick={() => handlePageChange(Math.ceil(filteredResidents.length / recordsPerPage))}>&raquo;</button>
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

export default Residents;
