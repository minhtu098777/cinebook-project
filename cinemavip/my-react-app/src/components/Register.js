import React, { useState } from "react";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    city: "",
    language: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        alert('Registration successful!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" className="form-control mb-2" onChange={handleChange} />
        <input name="age" placeholder="Age" className="form-control mb-2" onChange={handleChange} />
        <input name="city" placeholder="City" className="form-control mb-2" onChange={handleChange} />
        <input name="language" placeholder="Preferred Language" className="form-control mb-2" onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" className="form-control mb-2" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" className="form-control mb-2" onChange={handleChange} />
        <button type="submit" className="btn btn-success">Register</button>
      </form>
    </div>
  );
}

export default Register;