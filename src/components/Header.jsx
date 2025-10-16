// src/components/Header.jsx
import { useNavigate } from 'react-router-dom';

const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const FilterIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);


function Header({title, hasFilter = false}){
    const navigate = useNavigate(); // Initialize the hook

    const RightIcon = hasFilter ? FilterIcon : MoreIcon;

    return(
        <header className="app-header">
			<div onClick={() => navigate(-1)} aria-hidden>
				<BackIcon />
			</div>
				<h1>{title}</h1>
				<RightIcon />
		</header>
    )
}

export default Header;

// NOTE: I kept the unused 'MoreIcon' from the original file to avoid breaking other files, 
// but it is not used here unless you re-add it or remove the unused import later.
const MoreIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
);