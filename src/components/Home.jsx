import { useState, useEffect, useRef, useCallback } from 'react';
import './styles/home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faBars,faFutbol, faTableTennisPaddleBall, faBasketball, faBaseballBatBall, faFootball,faHockeyPuck,faVolleyball,faHandBackFist,faDumbbell,faHandshakeSlash,faArrowsToCircle,faHourglassHalf,faTrophy} from '@fortawesome/free-solid-svg-icons';
import {faCircleXmark} from '@fortawesome/free-regular-svg-icons';
import api from '../api.js';
import { usePrivy } from '@privy-io/react-auth';
import { ConnectButton, WalletProvider } from "@razorlabs/razorkit";

const Home = () => {
    const { user, authenticated, getAccessToken, logout } = usePrivy();
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const containerRef = useRef(null);
    const [scrollPos, setScrollPos] = useState(0);
    const [scrollDirection, setScrollDirection] = useState('right');
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [initialScroll, setInitialScroll] = useState(0);
    const [selectedBet, setSelectedBet] = useState(null);
    const [betInput, setBetInput] = useState('');
    const [placedBets, setPlacedBets] = useState([]);
    const [rewardData, setRewardData] = useState(null); 
    const [tasks, setTasks] = useState([]);
    const [selectedTrustworthyPerson, setSelectedTrustworthyPerson] = useState({});

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
              const response = await api.get('/api/users/profile');
              setRewardData(response.data.rewardModel);
            } catch (error) {
              console.error("Profile fetch failed:", error);
            }
          };

        const fetchTasks = async () => {
            try {
              const response = await api.get('/api/tasks');
              setTasks(response.data);
            } catch (error) {
              console.error("Error fetching tasks:", error);
            }
        };

        fetchUserProfile();
        fetchTasks();
    }, [authenticated, user]);

    const handleSelectTrustworthyPerson = async (taskId, trustworthyPersonId) => {
        try {
            await api.post('api/tasks/selectTrustworthy', { taskId, trustworthyPersonId });
            setSelectedTrustworthyPerson(prev => ({ ...prev, [taskId]: trustworthyPersonId }));
            alert('Trustworthy person selected successfully!');
        } catch (error) {
            console.error("Error selecting trustworthy person:", error);
            alert('Failed to select trustworthy person.');
        }
    };

    useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        if (isDragging) return;

        const interval = setInterval(() => {
            if (!containerRef.current) return;

            const maxScroll = containerRef.current.scrollWidth - containerRef.current.clientWidth;

            setScrollPos(prev => {
                if (scrollDirection === 'right') {
                    const newPos = prev + 3;
                    if (newPos >= maxScroll) {
                        setScrollDirection('left');
                        return maxScroll;
                    }
                    return newPos;
                }

                const newPos = prev - 3;
                if (newPos <= 0) {
                    setScrollDirection('right');
                    return 0;
                }
                return newPos;
            });
        }, 30);

        return () => clearInterval(interval);
    }, [scrollDirection, isDragging]);

    const handleMouseDown = useCallback((e) => {
        setIsDragging(true);
        setDragStartX(e.pageX);
        setInitialScroll(scrollPos);
    }, [scrollPos]);

    const handleMouseUp = useCallback(() => setIsDragging(false), []);
    const handleMouseLeave = useCallback(() => setIsDragging(false), []);
    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !containerRef.current) return;
        const delta = (e.pageX - dragStartX) * 2;
        setScrollPos(Math.max(0, Math.min(
            initialScroll - delta,
            containerRef.current.scrollWidth - containerRef.current.clientWidth
        )));
    }, [isDragging, dragStartX, initialScroll]);

    const handlePlaceBet = useCallback(() => {
        const amount = parseInt(betInput, 10);
        if (!amount || amount < selectedBet?.min || amount > selectedBet?.reward) {
            alert(`Bet amount must be between $${selectedBet?.min} and $${selectedBet?.reward}`);
            return;
        }

        setPlacedBets(prev => [...prev, {
            title: selectedBet.title,
            amount,
            status: 'pending',
            date: new Date().toISOString()
        }]);

        setSelectedBet(null);
        setBetInput('');
        alert(`Your bet of $${amount} on "${selectedBet.title}" has been placed!`);
    }, [betInput, selectedBet]);

    return (
        <div className="app-container">
            <header>
                <img
                    src="https://t3.ftcdn.net/jpg/02/51/80/40/360_F_251804029_ON3oL8BkopdueiT61zXaDMOF3qfSiWNx.jpg"
                    alt="Logo"
                    className="logo"
                />
                <button
                    className="toggle-theme"
                    onClick={() => setDarkMode(!darkMode)}
                    aria-label="Toggle theme"
                >
                    {darkMode ? '☀️' : '🌙'}
                </button>
                <button
                    className="logout-btn"
                    onClick={async () => {
                        try {
                            await logout();
                            console.log("User logged out successfully!");
                            window.location.href = "/"; 
                        } catch (error) {
                            console.error("Logout failed:", error);
                        }
                    }}
                >
                    Logout
                </button>

                <nav>
                    <ul className="navlinks">
                        {['Home', 'Services', 'Blog', 'About-Us'].map((item) => (
                            <li key={item} className="items">
                                <a href="#">{item}</a>
                            </li>
                        ))}
                        <li><a href="#"><button>Contact Us</button></a></li>
                        <li onClick={() => setSidebarOpen(true)}>
                            <a href="#"><FontAwesomeIcon icon={faBars} /></a>
                        </li>
                    </ul>

                    <ul className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                        <li onClick={() => setSidebarOpen(false)}>
                            <a href="#"><FontAwesomeIcon icon={faCircleXmark} /></a>
                        </li>
                        {['Home', 'Services', 'Blog', 'About-Us'].map((item) => (
                            <li key={item}><a href="#">{item}</a></li>
                        ))}
                        <img
                            src="https://t3.ftcdn.net/jpg/02/51/80/40/360_F_251804029_ON3oL8BkopdueiT61zXaDMOF3qfSiWNx.jpg"
                            alt="Logo"
                        />
                    </ul>
                </nav>
            </header>

            <section className="main-section">
                <div className="left-section">
                    <h3>Sports Options</h3>

                    <h4 className="section-title">Popular</h4>
                    <ul className="sports-list">
                        <li><FontAwesomeIcon icon={faFutbol} /><span>Soccer</span></li>
                        <li><FontAwesomeIcon icon={faTableTennisPaddleBall} /><span>Tennis</span></li>
                        <li><FontAwesomeIcon icon={faBasketball} /><span>Basketball</span></li>
                        <li><FontAwesomeIcon icon={faBaseballBatBall} /><span>Cricket</span></li>
                        <li><FontAwesomeIcon icon={faFootball} /><span>American Football</span></li>
                    </ul>

                    <h4 className="section-title">Other</h4>
                    <ul className="sports-list">
                        <li><FontAwesomeIcon icon={faHockeyPuck} />Ice Hockey</li>
                        <li><FontAwesomeIcon icon={faVolleyball} />Volleyball</li>
                        <li><FontAwesomeIcon icon={faHandBackFist} />Handball</li>
                        <li><FontAwesomeIcon icon={faTableTennisPaddleBall} />Table Tennis</li>
                        <li><FontAwesomeIcon icon={faDumbbell} />Wrestling</li>
                        <li><FontAwesomeIcon icon={faHandshakeSlash} />Squash</li>
                        <li><FontAwesomeIcon icon={faArrowsToCircle} />Darts</li>
                    </ul>
                </div>

                <div className="right-section">

                    {/* Display User Reward Data */}
                    <h3>User Reward Data</h3>
                    {rewardData ? (
                        <div>
                            <p>Bet Amount: {rewardData.betAmount}</p>
                            <p>Fee: {rewardData.fee}</p>
                            <p>Votes Casted: {rewardData.votes}</p>
                            <p>Profit/Loss: {rewardData.profitLoss}</p>
                        </div>
                    ) : (
                        <p>Loading reward data...</p>
                    )}

                    <h3>Ongoing Bets</h3>
                    <div
                        className="scroll-container"
                        ref={containerRef}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onMouseMove={handleMouseMove}
                    >
                        <div className="container"
                            style={{
                                transform: `translateX(-${scrollPos}px)`,
                                transition: isDragging ? 'none' : 'transform 0.03s linear'
                            }}
                        >
                            {Array.from({ length: 14 }).map((_, i) => (
                                <div key={`bet-${i}`} className="card">
                                    <h3>BET {i + 1}</h3>
                                    <p className="description">Short description for card {i + 1}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <h3>Available Bets</h3>
                    <div className="available-bets">
                        {tasks.map((task) => (
                            <div key={task._id} className="bet-item">
                                <h4>{task.title}</h4>
                                <p>{task.description}</p>
                                <p>
                                    Bet Amount: <span>${task.betAmount}</span> |
                                    Duration: <span>{task.duration} days</span>
                                </p>
                                {/* Trustworthy Person Selection */}
                                <div>
                                    <label>Select Trustworthy Person:</label>
                                    <select
                                        value={selectedTrustworthyPerson[task._id] || ''}
                                        onChange={(e) => handleSelectTrustworthyPerson(task._id, e.target.value)}
                                    >
                                        <option value="">Choose...</option>
                                        {task.participants.map(participant => (
                                            <option key={participant._id} value={participant._id}>
                                                {participant.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    className="bet-now"
                                    onClick={() => setSelectedBet({ title: task.title, min: task.betAmount, reward: task.betAmount })}
                                >
                                    Bet Now
                                </button>
                            </div>
                        ))}
                    </div>

                    {selectedBet && (
                        <div className="modal-overlay" onClick={() => setSelectedBet(null)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <button
                                    className="close-btn"
                                    onClick={() => setSelectedBet(null)}
                                    aria-label="Close"
                                >
                                    &times;
                                </button>
                                <h3>{selectedBet.title}</h3>
                                <p>Min Bet: ${selectedBet.min}</p>
                                <p>Max Bet: ${selectedBet.reward}</p>
                                <input
                                    type="number"
                                    value={betInput}
                                    onChange={(e) => setBetInput(e.target.value)}
                                    placeholder="Enter your bet amount"
                                    min="1"
                                />
                                <button onClick={handlePlaceBet}>Place Bet</button>
                            </div>
                        </div>
                    )}

                    <h3>Placed Bets</h3>
                    <div className="placed-bets">
                        {placedBets.length === 0 ? (
                            <p className="no-bets-placed">No Bets Placed</p>
                        ) : (
                            placedBets.map((bet) => (
                                <div key={bet.date} className={`bet-result ${bet.status}`}>
                                    <p>
                                    <FontAwesomeIcon icon={faHourglassHalf} />
                                        Placed Bet - {bet.title}
                                    </p>
                                    <span className="reward">Amount: ${bet.amount}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <h3>Create Your Own Bet</h3>
                    <div className="create-bet-section">
                        <p>Want to create a custom bet? Click below to set your own rules!</p>
                        <button
                            className="create-bet-btn"
                            onClick={() => {
                                window.location.href = '/create-bet';
                                console.log('Authenticated:', authenticated);
                                console.log('User:', user);
                            }}
                        >
                            Create Bet
                        </button>
                    </div>

                    <h3>Previous Bets</h3>
                    <div className="previous-bets">
                        <div className="bet-result won">
                            <p>
                            <FontAwesomeIcon icon={faTrophy} />
                                Bet 1: WON - LinkedIn Post Reactions
                            </p>
                            <span className="reward">Reward: $500</span>
                        </div>
                        <div className="bet-result lost">
                            <p>
                                <FontAwesomeIcon icon={faCircleXmark} />
                                Bet 2: LOST - Instagram Story Views
                            </p>
                            <span className="reward">Loss: $200</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
