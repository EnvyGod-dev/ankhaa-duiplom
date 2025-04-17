import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

function App() {
  const [maker, setMaker] = useState("");
  const [makers, setMakers] = useState([]);
  const [fuelType, setFuelType] = useState("");
  const [fuels, setFuels] = useState([]);

  const [selectedCar, setSelectedCar] = useState("");
  const [cars, setCars] = useState([]);

  const [engineSize, setEngineSize] = useState(1500);
  const [mileage, setMileage] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://103.50.205.42:8000/api";
  // const API_URL = "http://localhost:8000/api"

  useEffect(() => {
    fetch(`${API_URL}/model-info/`)
      .then((res) => res.json())
      .then((info) => {
        setMakers(info.allowed_makers);
        setFuels(info.allowed_fuel_types);
        setMaker(info.allowed_makers[0]);
        setFuelType(info.allowed_fuel_types[0]);
      })
      .catch((err) => console.error("Model info load error:", err));
  }, []);

  useEffect(() => {
    if (!maker) return;
    fetch(`${API_URL}/model-info/?maker=${encodeURIComponent(maker)}`)
      .then((res) => res.json())
      .then((info) => {
        setCars(info.allowed_car_names);
        setSelectedCar(info.allowed_car_names[0]);
      })
      .catch((err) => console.error("Cars load error:", err));
  }, [maker]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    try {
      const res = await fetch(`${API_URL}/predict/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registration_year: 2022,
          manufacture_year: 2022,
          maker,
          car_name: selectedCar,
          fuel_type: fuelType,
          engine_size: parseInt(engineSize, 10),
          odometer: parseInt(mileage, 10),
        }),
      });
      const { predicted_price } = await res.json();
      setPrediction(predicted_price ? `${predicted_price}₮` : "Алдаа гарлаа!");
    } catch {
      setPrediction("Алдаа гарлаа!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          Автомашины үнэ, үнэлгээний таамаг
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            {/* Maker */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="maker-label">Үйлдвэрлэгч</InputLabel>
                <Select
                  labelId="maker-label"
                  value={maker}
                  label="Үйлдвэрлэгч"
                  onChange={(e) => setMaker(e.target.value)}
                  required
                >
                  {makers.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Car (dependent) */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="car-label">Машины нэр</InputLabel>
                <Select
                  labelId="car-label"
                  value={selectedCar}
                  label="Машины нэр"
                  onChange={(e) => setSelectedCar(e.target.value)}
                  required
                >
                  {cars.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Fuel type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="fuel-label">Түлшний төрөл</InputLabel>
                <Select
                  labelId="fuel-label"
                  value={fuelType}
                  label="Түлшний төрөл"
                  onChange={(e) => setFuelType(e.target.value)}
                  required
                >
                  {fuels.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Engine size */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Хөдөлгүүрийн багтаамж (cc)"
                value={engineSize}
                onChange={(e) => setEngineSize(Number(e.target.value))}
                required
              />
            </Grid>

            {/* Mileage */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Км гүйлт"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                required
              />
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Таамаглаж байна..." : "Таамаглах"}
              </Button>
            </Grid>

            {/* Result */}
            {prediction && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                  <Typography variant="h6" align="center">
                    Таамагласан үнэ: {prediction}M
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default App;
