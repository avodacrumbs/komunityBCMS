import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { jsPDF } from 'jspdf';  // Import jsPDF
import '../styles/map.css';

const ExportData = () => {
    const [residents, setResidents] = useState([]);
    const [filteredResidents, setFilteredResidents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedOrg, setSelectedOrg] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [selectedVoterStatus, setSelectedVoterStatus] = useState('');
    const location = useLocation();
    const { category } = location.state || {};

    const fetchResidents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/processes/residentlocationprocess.php?active=true`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setResidents(data.residents);
            setFilteredResidents(data.residents);
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
        const filteredList = residents.filter((resident) => {
            const matchesNameOrAddress =
                resident.complete_name.toLowerCase().includes(lowerCaseQuery) ||
                resident.address.toLowerCase().includes(lowerCaseQuery);

            const matchesOrg =
                !selectedOrg || 
                (selectedOrg === 'PWD' && resident.PWDStatus) ||
                (selectedOrg === 'Youth Org' && resident.youthOrganizationMembership) ||
                (selectedOrg === 'Women\'s' && resident.Womens) ||
                (selectedOrg === 'ERPAT' && resident.Erpat) ||
                (selectedOrg === 'Senior Citizen' && resident.senior_citizen);

            const matchesGender =
                !selectedGender || 
                (selectedGender === 'Male' && resident.gender === 'M') ||
                (selectedGender === 'Female' && resident.gender === 'F') ||
                (selectedGender === 'LGBTQ+' && resident.gender === 'LGBTQ+');

            const matchesVoterStatus =
                !selectedVoterStatus || 
                resident.voterStatus === selectedVoterStatus;

            return matchesNameOrAddress && matchesOrg && matchesGender && matchesVoterStatus;
        });
        setFilteredResidents(filteredList);
    }, [searchQuery, residents, selectedOrg, selectedGender, selectedVoterStatus]);

    useEffect(() => {
        handleSearch();
    }, [searchQuery, selectedOrg, selectedGender, selectedVoterStatus, handleSearch]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleOrgChange = (e) => {
        setSelectedOrg(e.target.value);
    };

    const handleGenderChange = (e) => {
        setSelectedGender(e.target.value);
    };

    const handleVoterStatusChange = (e) => {
        setSelectedVoterStatus(e.target.value);
    };

    // PDF Generation Function
    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Resident List', 14, 20);  // Title

        doc.setFontSize(12);
        const headers = ['Complete Name', 'Address', 'Gender', 'Voter Status', 'Email', 'Contact#', 'Organization'];
        const rows = filteredResidents.map(resident => [
            resident.complete_name,
            resident.address,
            resident.gender,
            resident.voterStatus,
            resident.email,
            resident.contactNo,
            [
                resident.PWDStatus ? 'PWD' : '',
                resident.youthOrganizationMembership ? 'Youth Org' : '',
                resident.Womens ? "Women's" : '',
                resident.Erpat ? 'ERPAT' : '',
                resident.senior_citizen ? 'Senior Citizen' : ''
            ].filter(Boolean).join(', ')
        ]);

        doc.autoTable({
            head: [headers],
            body: rows,
            startY: 30,  // Start table 30 units below the title
            margin: { top: 10, left: 10, right: 10, bottom: 10 },
        });

        doc.save('residents.pdf');
    };

    return (
        <div className="export">
            <div className="search-wrappers">
                <input
                    type="text"
                    placeholder="Search by name or address"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="filters">
                {/* Organization Filter */}
                <div className="org-filter">
                    <select onChange={handleOrgChange} value={selectedOrg}>
                        <option value="">Select Organization</option>
                        <option value="PWD">PWD</option>
                        <option value="Youth Org">Youth Org</option>
                        <option value="Women's">Women's</option>
                        <option value="ERPAT">ERPAT</option>
                        <option value="Senior Citizen">Senior Citizen</option>
                    </select>
                </div>

                {/* Gender Filter */}
                <div className="gender-filter">
                    <select onChange={handleGenderChange} value={selectedGender}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="LGBTQ+">LGBTQ+</option>
                    </select>
                </div>

                {/* Voter Status Filter */}
                <div className="voter-status-filter">
                    <select onChange={handleVoterStatusChange} value={selectedVoterStatus}>
                        <option value="">Select Voter Status</option>
                        <option value="Regular">Regular</option>
                        <option value="SK">SK</option>
                        <option value="Not yet registered">Not yet registered</option>
                    </select>
                </div>
            </div>

            {/* PDF Download Button */}
            <div className="download-btn">
                <button onClick={generatePDF}>Download PDF</button>
            </div>

            <div className="members2">
                <p>
                    Showing {filteredResidents.length} resident{filteredResidents.length !== 1 ? 's' : ''} out of {residents.length} total
                </p>

                {filteredResidents.length === 0 ? (
                    <p>No matches found</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Complete Name</th>
                                <th>Address</th>
                                <th>Gender</th>
                                <th>Voter Status</th>
                                <th>Email</th>
                                <th>Contact#</th>
                                <th>Organization</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResidents.map((resident, index) => (
                                <tr key={index}>
                                    <td>{resident.complete_name}</td>
                                    <td>{resident.address}</td>
                                    <td>{resident.gender}</td>
                                    <td>{resident.voterStatus}</td>
                                    <td>{resident.email}</td>
                                    <td>{resident.contactNo}</td>
                                    <td>
                                        {[ 
                                            resident.PWDStatus ? 'PWD' : '',
                                            resident.youthOrganizationMembership ? 'Youth Org' : '',
                                            resident.Womens ? "Women's" : '',
                                            resident.Erpat ? 'ERPAT' : '',
                                            resident.senior_citizen ? 'Senior Citizen' : ''
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ExportData;
