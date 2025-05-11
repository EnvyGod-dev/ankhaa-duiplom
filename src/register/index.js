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

const API_URL = 'http://103.50.205.42:8000/api';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        if (password !== confirm) {
            setError('Нууц үгс таарахгүй байна');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) throw new Error('Бүртгэл амжилтгүй');
            // maybe API returns user or token; here we just redirect to login
            navigate('/login', { replace: true });
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
                    Шинэ бүртгэл
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
                    <TextField
                        label="Нууц үг давтан"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
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
                        {loading ? 'Түр хүлээнэ үү...' : 'Бүртгүүлэх'}
                    </Button>
                </Box>
                <Box textAlign="center" mt={2}>
                    <Typography variant="body2">
                        Аль хэдийн эсэх? <Link to="/login">Нэвтрэх</Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}
