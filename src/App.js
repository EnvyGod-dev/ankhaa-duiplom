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
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function App() {
  const [maker, setMaker] = useState("");
  const [makers, setMakers] = useState([]);
  const [fuelType, setFuelType] = useState("");
  const [fuels, setFuels] = useState([]);
  const [selectedCar, setSelectedCar] = useState("");
  const [cars, setCars] = useState([]);

  const [registrationYear, setRegistrationYear] = useState(
    new Date().getFullYear()
  );
  const [manufactureYear, setManufactureYear] = useState(
    new Date().getFullYear()
  );
  const [engineSize, setEngineSize] = useState(1500);
  const [mileage, setMileage] = useState("");

  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [currentPrediction, setCurrentPrediction] = useState(null);

  const API_URL = "http://localhost:8000/api";

  useEffect(() => {
    fetch(`${API_URL}/model-info/`)
      .then((res) => res.json())
      .then((info) => {
        setMakers(info.allowed_makers);
        setFuels(info.allowed_fuel_types);
        setMaker(info.allowed_makers[0]);
        setFuelType(info.allowed_fuel_types[0]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!maker) return;
    fetch(`${API_URL}/model-info/?maker=${encodeURIComponent(maker)}`)
      .then((res) => res.json())
      .then((info) => {
        setCars(info.allowed_car_names);
        setSelectedCar(info.allowed_car_names[0]);
      })
      .catch(console.error);
  }, [maker]);

  const yenFmt = (val) =>
    new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setChartData([]);
    setCurrentPrediction(null);

    // build the last 6 years array: [year-5, year-4, ..., year]
    const years = Array.from({ length: 6 }, (_, idx) =>
      registrationYear - (5 - idx)
    );

    try {
      const results = await Promise.all(
        years.map(async (year) => {
          const res = await fetch(`${API_URL}/predict/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              registration_year: year,
              manufacture_year: manufactureYear,
              maker,
              car_name: selectedCar,
              fuel_type: fuelType,
              engine_size: engineSize,
              odometer: parseInt(mileage, 10),
            }),
          });
          const { predicted_price } = await res.json();
          return {
            year,
            price:
              predicted_price != null ? Number(predicted_price) : null,
          };
        })
      );

      // set chart data
      setChartData(
        results
          .filter((r) => r.price != null)
          .map((r) => ({ year: r.year.toString(), price: r.price }))
      );

      // pick out current-year prediction
      const current = results.find((r) => r.year === registrationYear);
      setCurrentPrediction(
        current && current.price != null ? yenFmt(current.price) : "—"
      );
    } catch (err) {
      console.error(err);
      setCurrentPrediction("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Автомашины үнэ, үнэлгээний таамаг
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            {/* Registration Year */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Бүртгэлийн он"
                type="number"
                fullWidth
                value={registrationYear}
                onChange={(e) =>
                  setRegistrationYear(Number(e.target.value))
                }
                required
              />
            </Grid>

            {/* Manufacture Year */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Үйлдвэрлэсэн он"
                type="number"
                fullWidth
                value={manufactureYear}
                onChange={(e) =>
                  setManufactureYear(Number(e.target.value))
                }
                required
              />
            </Grid>

            {/* Maker */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Үйлдвэрлэгч</InputLabel>
                <Select
                  value={maker}
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

            {/* Car */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Машины нэр</InputLabel>
                <Select
                  value={selectedCar}
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

            {/* Fuel */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Түлшний төрөл</InputLabel>
                <Select
                  value={fuelType}
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

            {/* Engine Size */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Хөдөлгүүрийн багтаамж (cc)"
                type="number"
                fullWidth
                value={engineSize}
                onChange={(e) => setEngineSize(Number(e.target.value))}
                required
              />
            </Grid>

            {/* Mileage */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Км гүйлт"
                type="number"
                fullWidth
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
                size="large"
                fullWidth
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? "Таамаглаж байна..." : "Таамаглах"}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Current-year prediction */}
        {currentPrediction != null && (
          <Box textAlign="center" mt={2}>
            <Typography variant="h6">
              Таамагласан үнэ (он {registrationYear}):{" "}
              <strong>{currentPrediction}</strong>
            </Typography>
          </Box>
        )}

        {/* 6-year line chart */}
        {chartData.length > 0 && (
          <Box mt={4} height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(val) => yenFmt(val)} />
                <Tooltip formatter={(val) => yenFmt(val)} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#1976d2"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default App;
