import React, { useEffect, useState } from 'react';

const EditResident = ({ user, onClose }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        address: '',
        gender: '',
        birthdate: '',
        civilStatus: '',
        contactNo: '',
        email: '',
        voterStatus: '',
        PWDStatus: 0,
        youthOrganizationMembership: 0,
        senior_citizen: 0,
        Erpat: 0,
        Womens: 0,
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    useEffect(() => {
      if (user && user.complete_name) {
          const [firstName, middleName, ...lastNameParts] = user.complete_name.split(' ');
          const lastName = lastNameParts.join(' '); // Ensure the last name is combined if split
          setFormData({
              ...user,
              firstName,
              middleName: middleName || '', // Handle case where there's no middle name
              lastName,
          });
      } else {
          setFormData({
              firstName: '',
              middleName: '',
              lastName: '',
              address: '',
              gender: '',
              birthdate: '',
              civilStatus: '',
              contactNo: '',
              email: '',
              voterStatus: '',
              PWDStatus: 0,
              youthOrganizationMembership: 0,
              senior_citizen: 0,
              Erpat: 0,
              Womens: 0,
          });
      }
  }, [user]);
  
  
  const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Ensure `formData` values are properly captured
      const residentData = {
          id: user.id, // Ensure user.id exists
          complete_name: `${formData.firstName} ${formData.middleName} ${formData.lastName}`,
          address: formData.address,
          gender: formData.gender,
          birthdate: formData.birthdate,
          civilStatus: formData.civilStatus,
          contactNo: formData.contactNo,
          email: formData.email,
          voterStatus: formData.voterStatus,
          PWDStatus: formData.PWDStatus,
          youthOrganizationMembership: formData.youthOrganizationMembership,
          senior_citizen: formData.senior_citizen,
          Erpat: formData.Erpat,
          Womens: formData.Womens,
      };
  
      // Log resident data to see what is being sent
      console.log('Submitting data:', residentData);
  
      // Check if all required fields are present
      const requiredFields = ['firstName', 'lastName', 'address', 'gender', 'birthdate', 'voterStatus', 'civilStatus'];
  
      // Check if all required fields are present
      for (const field of requiredFields) {
          if (!residentData[field]) {
              console.error(`Missing value for ${field}:`, residentData[field]);
              return; // Early exit if there's a missing required field
          }
      }
      
      try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/processes/updateresidentprocess.php`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(residentData),
          });
  
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to update resident');
          }
  
          const result = await response.json();
          console.log('Resident updated successfully:', result);
  
      } catch (error) {
          console.error('Error updating resident:', error);
          alert(`An error occurred while updating the resident: ${error.message}`);
      }
  };  
    
    
    

    return (
        <div className="add-resident">
        <form className='add-resident-form' onSubmit={handleSubmit}>
        <div className="form-row" >
        <div className="form-group">
            <label htmlFor="firstName">First Name:<span className="required">*</span></label>
            <input
                id="firstName"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleChange}
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
              value={formData.middleName || ''}
              onChange={handleChange}
              autoComplete="additional-name"
              placeholder="Middle Name"
            />
            </div>
            <div className="form-group">
            <label htmlFor="lastName">Last Name:<span className="required">*</span></label>
            <input
              id="lastName"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleChange}
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
              value={formData.address || ''}
              onChange={handleChange}
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
              value={formData.gender || ''}
              onChange={handleChange}
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
              value={formData.birthdate || ''}
              onChange={handleChange}
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
              value={formData.contactNo || ''}
              onChange={handleChange}
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
              value={formData.email || ''}
              onChange={handleChange}
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
              value={formData.voterStatus || ''}
              onChange={handleChange}
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
              value={formData.civilStatus || ''}
              onChange={handleChange}
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
              onChange={(e) => handleChange({ target: { name: 'PWDStatus', value: e.target.checked } })} 
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
              onChange={(e) => handleChange({ target: { name: 'youthOrganizationMembership', value: e.target.checked } })} 
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
              onChange={(e) => handleChange({ target: { name: 'senior_citizen', value: e.target.checked } })} 
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
                onChange={(e) => handleChange({ target: { name: 'Erpat', value: e.target.checked } })} 
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
                onChange={(e) => handleChange({ target: { name: 'Womens', value: e.target.checked } })} 
                autoComplete="off"
            />
            Womens</label>
          </div>
        </div>
        {/* <h3>Family Relationships</h3>
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
        </button> */}
            <div>
                <button type="submit">Update Resident</button>
                <button type="button" onClick={onClose}>Close</button>
            </div>
        </form>
        </div>
    );
};

export default EditResident;
