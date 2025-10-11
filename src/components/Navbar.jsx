
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header'

function Navbar() {
	const location = useLocation();
	const navigate = useNavigate();


	const HomeIcon = () => (
		<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
	);
	const PeopleIcon = () => (
		<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
	);
	const PlacesIcon = () => (
		<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
	);
	const ReportIcon = () => (
		<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
	);

		// derive active from prop or current location
		const path = location.pathname;

		let active = 'home';
    
		if (active) {
      

			if (path.startsWith('/report')) active = 'report';
			else if (path.startsWith('/people')) active = 'people';
			else if (path.startsWith('/places')) active = 'places';
			else active = 'home';
		}

		// derive a human-friendly title from path/active
		let title = 'App';
		if (path.startsWith('/people')) title = 'People';
		else if (path.startsWith('/places')) title = 'Places';
		else if (path.startsWith('/report')) title = 'Health Report';
		else if (active === 'home') title = 'Home';

		return (
			<>

        
				<footer className="app-footer">
				<Link to="/" className={`nav-item ${active === 'home' ? 'active' : ''}`}>
					<HomeIcon active={active === 'home'}/>
					<span>Home</span>
				</Link>

				<Link to="/people" className={`nav-item ${active === 'people' ? 'active' : ''}`}>
					<PeopleIcon  />
					<span>People</span>
				</Link>

				<Link to="/places" className={`nav-item ${active === 'places' ? 'active' : ''}`}>
					<PlacesIcon />
					<span>Places</span>
				</Link>

				<Link to="/report" className={`nav-item ${active === 'report' ? 'active' : ''}`}>
					<ReportIcon />
					<span>Incident Report</span>
				</Link>
			</footer>
		</>
	);
}

export default Navbar;