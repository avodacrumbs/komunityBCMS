import React, { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LinearScale, BarElement, CategoryScale } from 'chart.js';
import AdminBar from './AdminBar';
import Header from './Header';
import { faUsers,faUserCheck, faClock , faChild, faWheelchair, faFemale, faMale  } from '@fortawesome/free-solid-svg-icons'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdminLandingLayout from './AdminLandingLayout';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

// Register the necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Custom plugin to display number counts in the center of doughnut charts
const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart) => {
        const { width, height, ctx } = chart;
        const dataset = chart.data.datasets[0];
        const value = dataset.data[0];

        ctx.save();
        ctx.font = `${(height / 6).toFixed(2)}px sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        const text = value.toString();
        const textX = width / 2;
        const textY = height / 2 + (0.12 * height);

        ctx.fillText(text, textX, textY);
        ctx.restore();
    }
};

// Custom plugin to display total counts on the bars
const countPlugin = {
    id: 'countPlugin',
    afterDatasetsDraw: (chart) => {
        const { ctx, data } = chart;
        ctx.save();

        // Check if there are datasets and handle accordingly
        if (data && data.datasets && data.datasets.length > 0) {
            data.datasets.forEach((dataset, index) => {
                dataset.data.forEach((value, i) => {
                    const meta = chart.getDatasetMeta(index);
                    const dataPoint = meta.data[i];

                    if (dataPoint) { // check if the dataPoint exists
                        ctx.fillStyle = 'black'; // color for the count text
                        ctx.font = 'bold 12px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(value, dataPoint.x, dataPoint.y); // Display the total value
                    }
                });
            });
        }

        ctx.restore();
    }
};

const TestCard = () => {
    const handleClick = () => {
        console.log('Card clicked!');
    };

    return <DemographicCard label="Women's" onClick={handleClick} />;
};

const DemographicCard = ({ label, count, color, onClick }) => (
    <div 
        style={{ 
            border: '1px solid white', 
            padding: '20px', 
            width: '150px', 
            backgroundColor: color, 
            cursor: 'pointer' 
        }} 
        onClick={onClick}
    >
        <FontAwesomeIcon icon={faFemale} size="3x" /> {/* Example icon, replace with appropriate props */}
        <h2>{label}</h2>
        <p>{count}</p>
    </div>
);

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const location = useLocation();
    const navigate = useNavigate();
    const [demographicData, setDemographicData] = useState(null);
    const [residents, setResidents] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost/backend/processes/statprocess.php');
                setDemographicData(response.data);
            } catch (error) {
                console.error('Error fetching demographic data:', error);
            }
        };

        if (user && user.role) {
            fetchData();
        }
    }, [user]);

    

    if (!user || !user.role) {
        return <div>Please log in</div>;
    }

    const isDashboardRoute = location.pathname === '/dashboard';

    const handleResidentsClick = () => {
        navigate('/dashboard/exportdata');
    };


    const VoterStatusCard = ({ icon, label, count, color }) => (
        <div className="voter-card" style={{ backgroundColor: color }}>
            <FontAwesomeIcon icon={icon} size="3x" />
            <p>{label}</p>
            <h2>{count}</h2>
        </div>
    );
   
    // Create chart data for genders
    const genderData = demographicData
        ? {
              labels: ['Men', 'Women', 'LGBTQ+'],
              datasets: [
                  {
                      data: [
                          demographicData.totalMales,
                          demographicData.totalFemales,
                          demographicData.totalLGBTQPlus
                      ],
                      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                  },
              ],
          }
        : null;

    // Create age data
    const ageData = demographicData
        ? {
              labels: ['Children (0-14)', 'Youth (15-24)', 'Young Adults (25-39)', 'Adults (40-59)', 'Seniors (60+)'],
              datasets: [
                  {
                      label: 'Number of Residents',
                      data: [
                          demographicData.totalChildren || 0,
                          demographicData.totalYouth || 0,
                          demographicData.totalYoungAdults || 0,
                          demographicData.totalAdults || 0,
                          demographicData.totalSeniors || 0,
                      ],
                      backgroundColor: '#4BC0C0',
                  },
              ],
          }
        : null;
        const demographicCategories = demographicData
    ? [
        { label: "Women's", icon: faFemale, count: demographicData.totalWomens || 0, color: '#FF6384' },
        { label: 'ERPAT', icon: faMale, count: demographicData.totalErpat || 0, color: '#36A2EB' },
        { label: 'Senior Citizens', icon: faUsers, count: demographicData.totalSeniorCitizens || 0, color: '#FFCE56' },
        { label: 'Youth', icon: faChild, count: demographicData.totalYouthOrganization || 0, color: '#4BC0C0' },
        { label: 'PWDs', icon: faWheelchair, count: demographicData.totalPWDs || 0, color: '#9966FF' },
    ]
    : [];

    const handleDemographicClick = (category) => {
        console.log('Clicked category:', category);
        navigate('/dashboard/exportdata', { state: { category: category.label } });
    };
        
    return (
        <div className="dashboard-layout">
            <Header />
            <main className="contents">
                {isDashboardRoute && demographicData && (
                    <div>
                        <div className="grid-container">
                        <TestCard />
                            <div
                                className="residents-icon" 
                                onClick={handleResidentsClick} 
                                style={{marginLeft:"-50%",marginTop:"50%", cursor: 'pointer'}}
                            >
                                <FontAwesomeIcon icon={faUsers} size="10x" color="#4BC0C0" />
                                <p style={{marginLeft:"4.5%"}}><b>Residents: {demographicData.totalResidents}</b></p>
                            </div>
                            <div className="voter-status-cards" style={{ width:"500px",height:"64%",marginTop:"-34%", marginLeft:"118%"}}>
                                <VoterStatusCard icon={faUserCheck} label="SK Voter" count={demographicData.totalSkVoters} color="#36A2EB" />
                                <VoterStatusCard icon={faUsers} label="Regular Voter" count={demographicData.totalRegularVoters} color="#4BC0C0" />
                                <VoterStatusCard icon={faClock} label="Not Yet Registered" count={demographicData.totalNotRegisteredVoters} color="#FFCE56" />
                            </div>
                            
                            <div className="gender-chart" style={{marginLeft:"-70%" , width:"80%", marginTop:"5%"}}>
                                <h3 style={{marginLeft:"-75%", marginTop:"-1%"}}>Gender</h3>
                                {genderData && (
                                    <div className="charts" >
                                        <div>
                                            <Doughnut
                                                data={{
                                                    labels: ['Men'],
                                                    datasets: [{ 
                                                        data: [
                                                            demographicData.totalMales, 
                                                            demographicData.totalResidents - demographicData.totalMales
                                                        ], 
                                                        backgroundColor: ['#FF6384', '#EAEAEA'] 
                                                    }]
                                                }}
                                                options={{
                                                    plugins: {
                                                        centerText: true,
                                                    },
                                                }}
                                                plugins={[centerTextPlugin]} // Apply the plugin here
                                            />
                                            <p>Men</p>
                                        </div>
                                        
                                        <div>
                                            <Doughnut
                                                data={{
                                                    labels: ['Women'],
                                                    datasets: [{ 
                                                        data: [
                                                            demographicData.totalFemales, 
                                                            demographicData.totalResidents - demographicData.totalFemales
                                                        ], 
                                                        backgroundColor: ['#36A2EB', '#EAEAEA'] 
                                                    }]
                                                }}
                                                options={{
                                                    plugins: {
                                                        centerText: true,
                                                    },
                                                }}
                                                plugins={[centerTextPlugin]} // Apply the plugin here
                                            />
                                            <p>Women</p>
                                        </div>
                                        <div>
                                            <Doughnut
                                                data={{
                                                    labels: ['LGBTQ+'],
                                                    datasets: [{ 
                                                        data: [
                                                            demographicData.totalLGBTQPlus, 
                                                            demographicData.totalResidents - demographicData.totalLGBTQPlus
                                                        ], 
                                                        backgroundColor: ['#FFCE56', '#EAEAEA'] 
                                                    }]
                                                }}
                                                options={{
                                                    plugins: {
                                                        centerText: true,
                                                    },
                                                }}
                                                plugins={[centerTextPlugin]} // Apply the plugin here
                                            />
                                            <p>LGBTQ+</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="age-chart" style={{width: "100%",height:"75%", marginLeft:"120%",marginTop:"-45%" }}>
                                <h3>Age Groups</h3>
                                {ageData && (
                                    <Bar
                                        data={ageData}
                                        options={{
                                            indexAxis: 'y', // Set to 'y' for horizontal bar chart
                                            plugins: {
                                                legend: {
                                                    display: true,
                                                },
                                            },
                                            scales: {
                                                x: {
                                                    beginAtZero: true, // Ensures the x-axis starts from zero
                                                },
                                            },
                                        }}
                                        plugins={[countPlugin]} // Apply the count plugin here
                                    />
                                )}
                            </div>
                            
                            <div className="demographic-cards" style={{width:"180%", marginLeft:"-78%"}}>
                                {demographicCategories.map((category, index) => (
                                    <DemographicCard
                                        key={index}
                                        icon={category.icon}
                                        label={category.label}
                                        count={category.count}
                                        color={category.color}
                                        onClick={() => handleDemographicClick(category.label)}
                                    />
                                ))}
                            </div>
                            
                        </div>
                    </div>
                )}

                <AdminLandingLayout />
            </main>
        </div>
    );
};

export default Dashboard;