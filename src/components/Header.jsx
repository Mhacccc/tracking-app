const BackIcon = () => (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
	);
const MoreIcon = () => (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
	);


function Header({title}){
    return(
        <header className="app-header">
			<div onClick={() => navigate(-1)} aria-hidden>
				<BackIcon />
			</div>
				<h1>{title}</h1>
				<MoreIcon />
		</header>
    )
}

export default Header;