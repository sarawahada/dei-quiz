import React, { useEffect, useRef } from "react";
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaChevronLeft, FaShareAlt } from "react-icons/fa";

// Register Chart.js components
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Constants for consistent styling
const COLOR_PRIMARY = "#FF8C42"; // Orange-Red
const COLOR_SECONDARY = "#FFB347"; // Lighter Orange
const COLOR_BACKGROUND_LIGHT = "#fffaf8"; // Very light off-white
const COLOR_TEXT_DARK = "#5e4033"; // Dark Brown

// Helper function to safely get the character name from the URL
const getCharacterName = (pathname) => {
    // pathname format is /character/Character-Name-Here
    const parts = pathname.split('/');
    if (parts.length < 3) return "Unknown Character";
    const nameSlug = parts[2];
    // Convert 'character-name-here' to 'Character Name Here'
    return nameSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function CharacterPage() {
    const location = useLocation();
    const navigate = useNavigate();
    // Get the character name from the URL params
    const { characterSlug } = useParams();
    
    // The results object and roomId should be passed in the state from the PlayerPage navigation link
    const resultsData = location.state?.results;
    const roomId = location.state?.roomId;
    
    const chartRef = useRef(null);

    // Safely derive the character name and image path
    const characterName = getCharacterName(location.pathname);
    const resultImage = `/characters/${characterSlug}.png`;
    
    // Use the specific character's traits for the radar chart (Example: If resultsData has the character's traits)
    // NOTE: If resultsData doesn't contain the traits, you'd need another data source (like a global map of traits).
    // For this example, we assume resultsData might be structured like { 'Empathy': 4, 'Analysis': 3, ... }
    const characterTraits = resultsData || {
        "Empathy": 3,
        "Strategy": 4,
        "Vision": 2,
        "Resilience": 3,
    }; // Fallback data

    useEffect(() => {
        if (!characterTraits || !chartRef.current) return;

        const ctx = chartRef.current.getContext("2d");
        // Destroy existing chart instance if it exists
        if (chartRef.current.chart) {
            chartRef.current.chart.destroy();
        }

        const labels = Object.keys(characterTraits);
        const values = Object.values(characterTraits);
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "rgba(107, 141, 214, 0.8)"); // New gradient color (Blue)
        gradient.addColorStop(1, "rgba(107, 141, 214, 0.2)");

        chartRef.current.chart = new Chart(ctx, {
            type: "radar",
            data: {
                labels,
                datasets: [
                    {
                        label: `${characterName} Traits`,
                        data: values,
                        backgroundColor: gradient,
                        borderColor: "#6B8DD6", // Blue outline
                        borderWidth: 3,
                        pointBackgroundColor: "#6B8DD6",
                        pointBorderColor: COLOR_BACKGROUND_LIGHT,
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        fill: true,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: COLOR_TEXT_DARK,
                        titleFont: { weight: 'bold' },
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        suggestedMax: 4,
                        angleLines: { color: "rgba(94, 64, 51, 0.1)" },
                        grid: { color: "rgba(94, 64, 51, 0.15)" },
                        pointLabels: {
                            color: COLOR_TEXT_DARK,
                            font: { size: 14, weight: '600' },
                        },
                        ticks: {
                            display: false,
                        },
                    },
                },
            },
        });
    }, [characterTraits, characterName]);

    // **UPDATED** Navigation logic for "Back to Quiz"
    const handleGoBackToQuiz = () => {
        // We MUST navigate back to the player page and restore the results state
        // so the user sees the results screen, not the waiting screen.
        if (roomId && location.state?.fullResults) {
            navigate(`/player/${roomId}`, { state: { results: location.state.fullResults } });
        } else {
            // Fallback: If roomId or full results weren't passed, just go back one step.
            navigate(-1);
        }
    };
    
    // Ensure data is present before rendering the page
    if (!characterSlug) {
        return (
            <div style={{ textAlign: "center", padding: 50, color: COLOR_TEXT_DARK }}>
                <h2>Character Not Found</h2>
                <button 
                    onClick={() => navigate('/')} 
                    style={{ ...buttonStyle, background: COLOR_SECONDARY }}>
                    Go Home
                </button>
            </div>
        );
    }
    
    // Reusable Button Style
    const buttonStyle = {
        padding: "12px 25px",
        borderRadius: 20,
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        cursor: "pointer",
        border: "none",
        width: "90%",
        maxWidth: "300px",
        fontSize: "1.1em",
        fontWeight: 600,
        transition: "transform 0.2s",
        color: '#fff',
    };

    return (
        <div
            style={{
                textAlign: "center",
                padding: "20px",
                color: COLOR_TEXT_DARK,
                maxWidth: "500px",
                margin: "0 auto",
                background: `linear-gradient(to top, ${COLOR_BACKGROUND_LIGHT}, #fbe9e7)`,
                minHeight: '100vh',
                fontFamily: "'Nunito', 'Inter', sans-serif",
            }}
        >
            <h1 style={{ 
                fontFamily: "'Pacifico', cursive", 
                color: COLOR_PRIMARY,
                fontSize: "2em",
                marginBottom: 10
            }}>
                The {characterName}
            </h1>
            <h2 style={{ fontSize: "1.2em", marginBottom: 20 }}>Your Change Agent Profile</h2>

            <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: 20, borderRadius: 20, boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}>
                <img
                    src={resultImage}
                    alt={characterName}
                    style={{
                        width: "80%",
                        maxWidth: "200px",
                        height: "auto",
                        borderRadius: "15px",
                        marginBottom: "20px",
                        boxShadow: "0 8px 15px rgba(0,0,0,0.3)",
                        border: `4px solid ${COLOR_SECONDARY}`
                    }}
                />
            </div>

            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "350px",
                    margin: "30px auto 20px",
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: 15,
                    borderRadius: 20,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                }}
            >
                <h3 style={{ marginBottom: 10, color: COLOR_TEXT_DARK }}>Trait Breakdown</h3>
                <canvas ref={chartRef}></canvas>
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "15px",
                    marginTop: "30px",
                    paddingBottom: 20
                }}
            >
                {/* 1. Back to Quiz Button (The main action) */}
                <button
                    onClick={handleGoBackToQuiz}
                    style={{
                        ...buttonStyle,
                        background: COLOR_PRIMARY,
                        boxShadow: `0 4px 8px ${COLOR_PRIMARY}60`,
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                    <FaChevronLeft style={{ marginRight: 8 }} /> Back to Quiz Results
                </button>

                {/* 2. Share Button (More relevant than Replay Quiz here) */}
                <button
                    onClick={() => alert(`Share link for ${characterName} copied!`)} // Replace with actual share logic
                    style={{
                        ...buttonStyle,
                        background: '#6B8DD6', // A complementary blue
                        boxShadow: '0 4px 8px #6B8DD660',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                    <FaShareAlt style={{ marginRight: 8 }} /> Share My Profile
                </button>
            </div>
        </div>
    );
}