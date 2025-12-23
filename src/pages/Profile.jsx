// src/pages/app/Profile.jsx
import React, { useState } from 'react';
import './Profile.css';
import avatar from '../assets/profile.png'; // Use our mock avatar

const Profile = () => {
  // Mock data for the logged-in user
  const [name, setName] = useState('Eman Miranda');
  const [email, setEmail] = useState('test@test.com');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Profile details updated! (Mock)');
  };

  return (
    <div className="profile-page-container">
      <header className="profile-page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and personal details.</p>
      </header>

      <div className="profile-content-wrapper">
        
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <img src={avatar} alt="User Avatar" className="profile-card-avatar" />
            <div className="profile-card-info">
              <h2>{name}</h2>
              <p>{email}</p>
            </div>
            <button className="change-avatar-btn">Change</button>
          </div>
          
          <form className="profile-card-body" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="form-divider"></div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input type="password" id="password" placeholder="Enter new password" />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input type="password" id="confirm-password" placeholder="Confirm new password" />
              </div>
            </div>
            <div className="form-footer">
              <button type="submit" className="save-changes-btn">
                Save Changes
              </button>
            </div>
          </form>
        </div>
        
        {/* (We can add other cards here later, like "Danger Zone") */}

      </div>
    </div>
  );
};

export default Profile;