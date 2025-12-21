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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gọi API backend để lưu thông tin đăng ký
    console.log("Register with:", formData);
    alert("Registration successful (dummy)!");
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