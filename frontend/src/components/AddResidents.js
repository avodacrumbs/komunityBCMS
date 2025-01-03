import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import { FaTrashAlt } from 'react-icons/fa';
import '../styles/AddResident.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";


const Residents = () => {
  const [residents, setResidents] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    gender: "M",
    birthdate: "",
    civilStatus: "Single",
    contactNo: "",
    email: "",
    voterStatus: "Regular",
    PWDStatus: 0,
    youthOrganizationMembership: 0,
    senior_citizen: 0,
    Erpat: 0,
    Womens:0,
    is_alive: 1,
  });

  const [familyRelationships, setFamilyRelationships] = useState([
    {
      related_resident_id: "",
      relationship: "Mother",
    },
  ]);

  useEffect(() => {
    fetchResidents();
  }, []);

  useEffect(() => {
     if (error || success) {
       formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
     }
   }, [error, success]);
  // Fetch all residents for dropdowns
  const fetchResidents = async (query = "") => {
    try {
      const response = await axios.get("http://localhost/backend/processes/searchresident.php", {
        params: { query }, // Pass the query as a parameter
      });
      setResidents(response.data.residents || []); // Set residents from the response
    } catch (error) {
      console.error("Error fetching residents:", error.message); // Log the error message
    }
  };
  

  // Handle input changes for resident form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  // const handleInputChange = (e) => {
  //   const { name, checked } = e.target;
    
  //   setFormData((prevState) => ({
  //     ...prevState,
  //     [name]: checked ? 1 : 0,
  //   }));
  // };

  // Handle input changes for family relationships
  const handleFamilyRelationshipChange = (index, e) => {
    const { name, value } = e.target;
    const newFamilyRelationships = [...familyRelationships];
    newFamilyRelationships[index][name] = value;
    setFamilyRelationships(newFamilyRelationships);
  };

  // Add another family relationship input set
  const addFamilyRelationship = () => {
    setFamilyRelationships([
      ...familyRelationships,
      { related_resident_id: "", relationship: "Mother" },
    ]);
  };

  // Remove a family relationship input set
  const removeFamilyRelationship = (index) => {
    const newFamilyRelationships = [...familyRelationships];
    newFamilyRelationships.splice(index, 1);
    setFamilyRelationships(newFamilyRelationships);
  };

  // Handle form submission (resident + family relationships)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages before submission
    setError(null);
    setSuccess(null);
    
    navigate('/map', { state: { address: formData.address } });
    const validFamilyRelationships = familyRelationships.filter((relation) => relation.related_resident_id);
    const combinedData = {
        ...formData,
        familyRelationships: validFamilyRelationships,
    };

    try {
        const response = await axios.post("http://localhost/backend/processes/addres.php", combinedData);

        console.log("Response from API:", response.data); // Log the API response

        // Display messages based on the response conditions
        if (response.data && response.data.success) {
          setSuccess(response.data.message); // Set success message
          setError(null); // Clear any previous error
        } else if (response.data) {
            setError(response.data.message); // Set error message if not a success
            setSuccess(null); // Clear success message if there's an error
        } 
        else {
              setError("Unexpected response."); // Handle unexpected response
        }

        fetchResidents(); // Refresh residents list after submission
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        setError(errorMessage); // Set error message
        console.error("Error creating resident:", error.response ? error.response.data : error.message);
    }
};
  return (
    <div className="add-resident">
      <form className="add-resident-form" onSubmit={handleSubmit} style={{borderTop: '5px solid gray', borderRadius: '0px'}}>
        <div ref={formRef}></div>
        <div className='form-row'>
          {success && <p className="success-message">{success}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="form-row" >
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
            PWD</label>
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
            Youth Org. Member</label>
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
            Senior Citizen</label>
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
            Erpat</label>
          </div>

          <div className="form-group">
            <label style={{marginLeft: '-110px'}}>
            <input
                id="Womens"
                type="checkbox"
                name="Womens"
                checked={formData.Womens === 1}
                onChange={handleInputChange}
                autoComplete="off"
            />
            Womens</label>
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
              <FaTrashAlt onClick={() => removeFamilyRelationship(index)} style={{ cursor: 'pointer', color: 'red', fontSize: '20', marginTop: '8px' }} />
            )}
            </div>
          </div>
        ))}         
        </div>
        <button type="button" style={{backgroundColor: 'white', color: 'black', border: '1px solid gray', marginLeft: '12.9px', padding: '10px', marginBottom: '15px', width: '630px'}}  onClick={addFamilyRelationship}>
        + Add Family Member
        </button>

        <button type="submit" style={{marginLeft: '12.9px',width: '630px'}}>Add Resident</button>
      </form>
    </div>
  );
};

export default Residents;
