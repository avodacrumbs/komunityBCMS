import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../styles/style.css';

const ResidentDetails = () => {
  const { id } = useParams();
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  

  useEffect(() => {
    const fetchResidentDetails = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/processes/residentdetails.php?id=${id}`);
        const text = await response.text();
        if (!response.ok) {
            throw new Error('Failed to fetch resident details');
        }
        const data = JSON.parse(text);
        setResident(data);
      } catch (error) {
          console.error('Error fetching resident details:', error);
      } finally {
          setLoading(false);
      }
    };

    fetchResidentDetails();
  }, [id]);

  

  const downloadPDF = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(16);
    doc.text('Resident Details', 14, 22);
  
    doc.setFontSize(12);
    const tableColumn = ["Field", "Details"];
    const tableData = [
      ["Name", `${resident.firstName} ${resident.middleName || ''} ${resident.lastName}`],
      ["Address", resident.address],
      ["Gender", resident.gender],
      ["Birthdate", resident.birthdate],
      ["Civil Status", resident.civilStatus],
      ["Contact#", resident.contactNo],
      ["Email", resident.email],
      ["Voter Status", resident.voterStatus],
    ];
  
    // Add the table using autoTable plugin
    doc.autoTable({
      head: [tableColumn],  // Table headers
      body: tableData,      // Table data
      startY: 40            // Position where the table starts on the PDF
    });
  
    // Organization Memberships
    let currentY = doc.previousAutoTable.finalY + 10; // Get Y position after the table
    doc.text('Organization Memberships', 14, currentY);
    currentY += 10;
  
    resident.organizationMemberships.forEach((org, index) => {
      if (org.isMember) {
        doc.text(`${org.name}: Yes`, 14, currentY);
        currentY += 6;
      }
    });
  
    currentY += 10; // Add space after organization memberships
    doc.text('Family Members', 14, currentY);
    currentY += 10;
  
    // Check if familyMembers exists and is not null
    if (resident.familyMembers) {
      resident.familyMembers.split(', ').forEach(member => {
        doc.text(member, 14, currentY);
        currentY += 6;
      });
    } else {
      doc.text('No family members available', 14, currentY);
    }
  
    currentY += 10; // Add space before services
    doc.text('Services', 14, currentY);
    currentY += 10;
  
    // Check if services exists and is not null
    if (resident.services) {
      resident.services.split('; ').forEach(service => {
        doc.text(service, 14, currentY);
        currentY += 6;
      });
    } else {
      doc.text('No services available', 14, currentY);
    }
  
    const fileName = `${resident.firstName}${resident.lastName}-details.pdf`.replace(/\s+/g, ''); // Removes spaces

    doc.save(fileName);
  };


  if (loading) {
    return <p>Loading...</p>;
  }

  if (!resident) {
    return <p>No resident found</p>;
  }

  // Processing memberships
  const organizationMemberships = [
    { name: "PWD Status", isMember: resident.PWDStatus },
    { name: "Youth Organization", isMember: resident.youthOrganizationMembership },
    { name: "Women’s Organization", isMember: resident.Womens },
    { name: "ERPat", isMember: resident.Erpat },
    { name: "Senior Citizen", isMember: resident.senior_citizen },
  ];

  resident.organizationMemberships = organizationMemberships;
  const familyMembers = resident.familyMembers ? resident.familyMembers.split(', ') : [];
  const services = resident.services ? resident.services.split('; ') : [];

  return (
    <div className="resident-details">
      <h2>Resident Details</h2>
      
      <table>
        <tbody>
          <tr>
            <th>Name:</th>
            <td>{`${resident.firstName} ${resident.middleName || ''} ${resident.lastName}`}</td>
          </tr>
          <tr>
            <th>Address:</th>
            <td>{resident.address}</td>
          </tr>
          <tr>
            <th>Gender:</th>
            <td>{resident.gender}</td>
          </tr>
          <tr>
            <th>Birthdate:</th>
            <td>{resident.birthdate}</td>
          </tr>
          <tr>
            <th>Civil Status:</th>
            <td>{resident.civilStatus}</td>
          </tr>
          <tr>
            <th>Contact#:</th>
            <td>{resident.contactNo}</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>{resident.email}</td>
          </tr>
          <tr>
            <th>Voter Status:</th>
            <td>{resident.voterStatus}</td>
          </tr>
        </tbody>
      </table>

      <h3>Organization Memberships</h3>
      {organizationMemberships.filter(org => org.isMember).length > 0 ? (
        <ul>
          {organizationMemberships.filter(org => org.isMember).map((org, index) => (
            <li key={index}>{org.name}: Yes</li>
          ))}
        </ul>
      ) : (
        <p>No organization memberships.</p>
      )}

      <h3>Family Members</h3>
      <ul>
        {familyMembers.map((member, index) => (
          <li key={index}>{member}</li>
        ))}
      </ul>

      <h3>Services</h3>
      <ul>
        {services.map((service, index) => (
          <li key={index}>{service}</li>
        ))}
      </ul>
        {user.role !== 'Encoder' ? (
          <div className='dlb'>
            <p>Download <button onClick={downloadPDF}>{`${resident.firstName}${resident.lastName}`}-details.pdf</button></p>
          </div>
        ) : (
          <p style={{color:"red"}}>You do not have permission to download resident details.</p>
        )}      
      </div>
    
  );
};

export default ResidentDetails;