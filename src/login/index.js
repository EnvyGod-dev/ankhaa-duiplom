import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';

const API_URL = 'http://103.50.205.86:8000/api';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) throw new Error('Нэвтрэх амжилтгүй боллоо');
            const { access, refresh } = await res.json();
localStorage.setItem('access', access);
localStorage.setItem('refresh', refresh);
navigate('/', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Нэвтрэх
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
                    <TextField
                        label="Хэрэглэгчийн нэр"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                    <TextField
                        label="Нууц үг"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                        sx={{ mt: 2 }}
                    >
                        {loading ? 'Түр хүлээнэ үү...' : 'Нэвтрэх'}
                    </Button>
                </Box>
                <Box textAlign="center" mt={2}>
                    <Typography variant="body2">
                        Шинээр бүртгүүлэх? <Link to="/register">Бүртгүүлэх</Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}
