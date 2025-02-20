import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Alert } from '@mui/material';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.message) {
      setError('All fields are required.');
      return;
    }

    // Simulate form submission (Replace this with API call)
    setTimeout(() => {
      setSuccess('Your message has been sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    }, 1000);
  };

  return (
    <Container>
      <Box my={4} sx={{ textAlign: 'center', maxWidth: '600px', margin: 'auto' }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontFamily: 'Orbitron, sans-serif', color: '#FFFFFF', marginBottom: '16px' }}
        >
          Contact Us
        </Typography>
        <Typography variant="body1" sx={{ color: '#B0BEC5', marginBottom: '16px' }}>
          Have questions or want to get in touch? Fill out the form below, and we'll get back to you shortly.
        </Typography>

        {error && <Alert severity="error" sx={{ marginBottom: '16px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ marginBottom: '16px' }}>{success}</Alert>}

        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            variant="filled"
            fullWidth
            required
            margin="dense"
            sx={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', input: { color: '#FFFFFF' } }}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            variant="filled"
            fullWidth
            required
            margin="dense"
            sx={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', input: { color: '#FFFFFF' } }}
          />
          <TextField
            label="Message"
            name="message"
            multiline
            rows={4}
            value={formData.message}
            onChange={handleChange}
            variant="filled"
            fullWidth
            required
            margin="normal"
            sx={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', textarea: { color: '#FFFFFF' } }}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ marginTop: '16px' }}>
            Submit
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Contact;
