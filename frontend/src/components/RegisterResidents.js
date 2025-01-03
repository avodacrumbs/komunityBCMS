import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { FaTrashAlt } from 'react-icons/fa';
import '../styles/AddResident.css';

const RegisterResidents = ({ resident, onClose }) => {
    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        address: "",
        gender: "",
        birthdate: "",
        civilStatus: "",
        contactNo: "",
        email: "",
        voterStatus: "",
        PWDStatus: 0,
        youthOrganizationMembership: 0,
        senior_citizen: 0,
        Erpat: 0,
        Womens: 0,
        is_alive: 1,
    });

    const [familyRelationships, setFamilyRelationships] = useState([
        {
            related_resident_id: "",
            relationship: "",
        },
    ]);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const formRef = useRef(null);
    const [residents, setResidents] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [customServices, setCustomServices] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));

    // Load resident data if editing
    useEffect(() => {
        if (resident) {
            const nameParts = resident.complete_name.split(" ");
            const firstName = nameParts[0] || "";
            const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : ""; 
            const lastName = nameParts[nameParts.length - 1] || "";

            setFormData({
                firstName,
                middleName,
                lastName,
                address: resident.address || "",
                gender: resident.gender || "",
                birthdate: resident.birthdate || "",
                civilStatus: resident.civilStatus || "",
                contactNo: resident.contactNo || "",
                email: resident.email || "",
                voterStatus: resident.voterStatus || "",
                PWDStatus: resident.PWDStatus || 0,
                youthOrganizationMembership: resident.youthOrganizationMembership || 0,
                senior_citizen: resident.senior_citizen || 0,
                Erpat: resident.Erpat || 0,
                Womens: resident.Womens || 0,
            });

            if (Array.isArray(resident.familyRelationships)) {
                setFamilyRelationships(
                    resident.familyRelationships.map(relationship => ({
                        related_resident_id: relationship.related_resident_id || '',
                        relationship: relationship.relationship || 'Mother', // Default to 'Mother'
                    }))
                );
            } else {
                setFamilyRelationships([{ related_resident_id: '', relationship: 'Mother' }]);
            }

            if (Array.isArray(resident.services)) {
                setCustomServices(
                    resident.services.map(service => ({
                        name: service.service_name || '',
                        date: service.service_date || '',
                        notes: service.notes || '',
                    }))
                );
            } else {
                setCustomServices([]); // Start with an empty array for services
            }

            setIsEdit(true);
        } else {
            setIsEdit(false);
            resetForm(); // Reset the form if no resident is found
        }
    }, [resident]);

    const resetForm = () => {
        setFormData({
            firstName: "",
            middleName: "",
            lastName: "",
            address: "",
            gender: "",
            birthdate: "",
            civilStatus: "",
            contactNo: "",
            email: "",
            voterStatus: "",
            PWDStatus: 0,
            youthOrganizationMembership: 0,
            senior_citizen: 0,
            Erpat: 0,
            Womens: 0,
            is_alive: 1,
        });
        setFamilyRelationships([{ related_resident_id: '', relationship: 'Mother' }]);
        setCustomServices([]); // Reset services to an empty array
    };

    useEffect(() => {
        fetchResidents();
    }, []);

    useEffect(() => {
        if (error || success) {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [error, success]);

    const fetchResidents = async (query = "") => {
        try {
            const response = await axios.get("http://localhost/backend/processes/searchresident.php", {
                params: { query },
            });
            setResidents(response.data.residents || []);
        } catch (error) {
            console.error("Error fetching residents:", error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        }));
    };

    const handleFamilyRelationshipChange = (index, e) => {
        const { name, value } = e.target;
        const newFamilyRelationships = [...familyRelationships];
        newFamilyRelationships[index][name] = value;
        setFamilyRelationships(newFamilyRelationships);
    };

    const addFamilyRelationship = () => {
        setFamilyRelationships([...familyRelationships, { related_resident_id: "", relationship: "Mother" }]);
    };

    const removeFamilyRelationship = (index) => {
        const newFamilyRelationships = familyRelationships.filter((_, i) => i !== index);
        setFamilyRelationships(newFamilyRelationships);
    };

    const addService = () => {
        setCustomServices([...customServices, { name: "", date: "", notes: "" }]);
    };

    const handleServiceChange = (index, field, event) => {
        const newServiceArray = [...customServices];
        newServiceArray[index][field] = event.target.value;
        setCustomServices(newServiceArray);
    };

    const removeService = (index) => {
        const newServiceArray = customServices.filter((_, i) => i !== index);
        setCustomServices(newServiceArray);
    };

    const validateForm = () => {
        if (!formData.firstName || !formData.lastName || !formData.address || !formData.gender || !formData.birthdate || !formData.civilStatus || !formData.voterStatus) {
            setError("Please fill in all required fields.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validate the main form fields only
        if (!validateForm()) {
            return;  // Stop if validation fails
        }

        const validFamilyRelationships = familyRelationships.filter((relation) => relation.related_resident_id);
        const combinedData = {
            ...formData,
            familyRelationships: validFamilyRelationships,
            services: customServices
                .filter(service => service.name && service.date) // Only include valid services
                .map(service => ({
                    service_name: service.name,
                    service_date: service.date,
                    notes: service.notes,
                })),       
            id: isEdit ? resident.id : undefined, // Add the resident ID only in edit mode
        };

        const endpoint = isEdit ? 'http://localhost/backend/processes/update.php' : 'http://localhost/backend/processes/addres.php';
        const method = isEdit ? 'PUT' : 'POST';
        
        try {
            console.log("Sending data to backend:", combinedData);
            const response = await axios({
                method,
                url: endpoint,
                data: combinedData,
            });

            console.log("Response from API:", response.data);

            if (response.data && response.data.success) {
                setSuccess(response.data.message);
                resetForm();  
                setIsEdit(false);
                fetchResidents();
            } else if (response.data) {
                setError(response.data.message);
            } else {
                setError("Unexpected response.");
            }
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : error.message;
            setError(errorMessage);
            console.error("Error creating or updating resident:", error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="add-resident">
            <form className="add-resident-form" onSubmit={handleSubmit} style={{ borderTop: '5px solid gray', borderRadius: '0px' }}>
                <h2>{isEdit ? 'Edit Resident' : 'Add Resident'}</h2>
                <div ref={formRef}></div>
                <div className='form-row'>
                    {success && <p className="success-message">{success}</p>}
                    {error && <p className="error-message">{error}</p>}
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="firstName">First Name:<span className="required">*</span></label>
                        <input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="First Name"
                            autoComplete="given-name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="middleName">Middle Name:</label>
                        <input
                            id="middleName"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleInputChange}
                            autoComplete="additional-name"
                            placeholder="Middle Name"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name:<span className="required">*</span></label>
                        <input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Last Name"
                            autoComplete="family-name"
                            required
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="address">Address:<span className="required">*</span></label>
                        <input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Address"
                            autoComplete="street-address"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender">Gender:<span className="required">*</span></label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            autoComplete="sex"
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="LGBTQ+">LGBTQ+</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="birthdate">Birthdate:<span className="required">*</span></label>
                        <input
                            id="birthdate"
                            type="date"
                            name="birthdate"
                            value={formData.birthdate}
                            onChange={handleInputChange}
                            placeholder="Birthdate"
                            autoComplete="bday"
                            required
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="contactNo">Contact #:</label>
                        <input
                            id="contactNo"
                            name="contactNo"
                            value={formData.contactNo}
                            onChange={handleInputChange}
                            placeholder="Contact Number"
                            autoComplete="tel"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            autoComplete="email"
                        />
                    </div>
                </div>
                <div className="wid">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="voterStatus">Voter Status:<span className="required">*</span></label>
                            <select
                                id="voterStatus"
                                name="voterStatus"
                                value={formData.voterStatus}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Voter Status</option>
                                <option value="Regular">Regular</option>
                                <option value="SK">SK</option>
                                <option value="Not yet registered">Not yet registered</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="civilStatus">Civil Status:<span className="required">*</span></label>
                            <select
                                id="civilStatus"
                                name="civilStatus"
                                value={formData.civilStatus}
                                onChange={handleInputChange}
                                autoComplete="off"
                                required
                            >
                                <option value="">Select Status</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                            </select>
                        </div>
                    </div>
                </div>
                <h3>Organization</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>
                            <input
                                id="PWDStatus"
                                type="checkbox"
                                name="PWDStatus"
                                checked={formData.PWDStatus === 1}
                                onChange={handleInputChange}
                                autoComplete="off"
                            />
                            PWD
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <input
                                id="youthOrganizationMembership"
                                type="checkbox"
                                name="youthOrganizationMembership"
                                checked={formData.youthOrganizationMembership === 1}
                                onChange={handleInputChange}
                                autoComplete="off"
                            />
                            Youth Org. Member
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <input
                                id="senior_citizen"
                                type="checkbox"
                                name="senior_citizen"
                                checked={formData.senior_citizen === 1}
                                onChange={handleInputChange}
                                autoComplete="off"
                            />
                            Senior Citizen
                        </label>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>
                            <input
                                id="Erpat"
                                type="checkbox"
                                name="Erpat"
                                checked={formData.Erpat === 1}
                                onChange={handleInputChange}
                                autoComplete="off"
                            />
                            Erpat
                        </label>
                    </div>
                    <div className="form-group">
                        <label style={{ marginLeft: '-110px' }}>
                            <input
                                id="Womens"
                                type="checkbox"
                                name="Womens"
                                checked={formData.Womens === 1}
                                onChange={handleInputChange}
                                autoComplete="off"
                            />
                            Womens
                        </label>
                    </div>
                </div>
                <h3>Family Relationships</h3>
                <div className="form-row">
                    {familyRelationships.map((family, index) => (
                        <div key={index} className="form-row">
                            <div className="form-group">
                                <select
                                    name="related_resident_id"
                                    value={family.related_resident_id}
                                    onChange={(e) => handleFamilyRelationshipChange(index, e)}
                                >
                                    <option value="">Select Related Resident</option>
                                    {residents.map((resident) => (
                                        <option key={resident.id} value={resident.id}>
                                            {resident.firstName} {resident.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <select
                                    name="relationship"
                                    value={family.relationship}
                                    onChange={(e) => handleFamilyRelationshipChange(index, e)}
                                >
                                    <option value="Mother">Mother</option>
                                    <option value="Father">Father</option>
                                    <option value="Sibling">Sibling</option>
                                    <option value="Child">Child</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Guardian">Guardian</option>
                                </select>
                            </div>
                            <div className="form-group">
                                {familyRelationships.length > 1 && (
                                    <FaTrashAlt 
                                        onClick={() => removeFamilyRelationship(index)} 
                                        style={{ cursor: 'pointer', color: 'red', fontSize: '20', marginTop: '8px' }} 
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <button type="button" style={{ marginTop: "-10px", backgroundColor: 'white', color: 'black', border: '1px solid gray', marginLeft: '1px', padding: '9px', marginBottom: '15px', width: '150px' }} onClick={addFamilyRelationship}>
                    + Add Family Member
                </button>

                <h3>Services</h3>
                {customServices.map((service, index) => (
                    <div key={index} className="form-group" style={{ marginBottom: '15px' }}>
                        <div className='form-row' style={{ gap: "6px" }}>
                            <input
                                type="text"
                                value={service.name}
                                onChange={(e) => handleServiceChange(index, 'name', e)}
                                placeholder="Enter Service Name"
                                style={{ width: '27%', height: "17px", marginTop: "5px" }}
                            />
                            <input
                                type="date"
                                value={service.date}
                                onChange={(e) => handleServiceChange(index, 'date', e)}
                                style={{ width: '27%', marginTop: '5px' }}
                            />
                            <input
                                type="text"
                                value={service.notes}
                                onChange={(e) => handleServiceChange(index, 'notes', e)}
                                placeholder="Enter Notes"
                                style={{ width: '27%', marginTop: '5px' }}
                            />
                            {customServices.length > 1 && (
                                <FaTrashAlt 
                                    onClick={() => removeService(index)} 
                                    style={{ cursor: 'pointer', color: 'red', fontSize: '20', marginTop: '13px' }} 
                                />
                            )}
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addService} style={{ marginTop: "-10px", backgroundColor: 'white', color: 'black', border: '1px solid gray', marginLeft: '1px', padding: '9px', marginBottom: '15px', width: '150px' }}>
                    + Add Service
                </button>
                
                {(user.role === 'Admin' && isEdit) ? (
                    <button type="submit" style={{ marginLeft: '1px', padding: "12px", marginTop: "20px" }}>
                        Update Resident
                    </button>
                ) : (user.role === 'Encoder' && isEdit) && (
                    <p style={{ color: "red" }}>You do not have permission to update this resident.</p>
                )}
                {(user.role === 'Admin' && !isEdit) && (
                    <button type="submit" style={{ marginLeft: '1px', padding: "12px", marginTop: "20px" }}>Add Resident</button>
                )}

                {(user.role === 'Encoder' && !isEdit) && (
                    <button type="submit" style={{ marginLeft: '1px', padding: "12px", marginTop: "20px" }}>Add Resident</button>
                )}
                {(user.role === 'User') && (
                    <p style={{ color: "red" }}>You do not have permission to add residents.</p>
                )}
            </form>
        </div>
    );
};

export default RegisterResidents;