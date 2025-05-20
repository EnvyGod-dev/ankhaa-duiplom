import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import logo from "./logo.jpg";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import PriceCalculator from "./components/PriceCalculator";
import CarListings from "./components/CarListings";

function App() {
  const API_URL = "http://103.50.205.86:8000/api";
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // dropdown data
  const [makers, setMakers] = useState([]);
  const [models, setModels] = useState([]);
  const [chassisIds, setChassisIds] = useState([]);
  const [fuels, setFuels] = useState([]);
  const [colours, setColours] = useState([]);
  const [years, setYears] = useState([]);

  // user selections
  const [maker, setMaker] = useState("");
  const [model, setModel] = useState("");
  const [chassisId, setChassisId] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [colour, setColour] = useState("");
  const [registrationYear, setRegistrationYear] = useState("");
  const [condition, setCondition] = useState("4.5");
  const [engineSize, setEngineSize] = useState(2000);
  const [odometer, setOdometer] = useState(100000);

  // results / loading
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [loading, setLoading] = useState(false);

  // clocks
  const [japanTime, setJapanTime] = useState("");
  const [mongoliaTime, setMongoliaTime] = useState("");

  // initial metadata load
  useEffect(() => {
    fetch(`${API_URL}/model-info/`)
      .then((res) => res.json())
      .then((info) => {
        setMakers(info.allowed_makers);
        setFuels(info.allowed_fuel_types);
        if (info.allowed_makers.length) setMaker(info.allowed_makers[0]);
        if (info.allowed_fuel_types.length) setFuelType(info.allowed_fuel_types[0]);
      })
      .catch(console.error);
  }, []);

  // update dependent dropdowns
  useEffect(() => {
    if (!maker) return;
    fetch(`${API_URL}/model-info/?maker=${encodeURIComponent(maker)}`)
      .then((res) => res.json())
      .then((info) => {
        setModels(info.allowed_car_names);
        setChassisIds(info.allowed_chassis_ids);
        setColours(info.allowed_colours);
        setYears(info.allowed_years);
        if (info.allowed_car_names.length) setModel(info.allowed_car_names[0]);
        if (info.allowed_chassis_ids.length) setChassisId(info.allowed_chassis_ids[0]);
        if (info.allowed_colours.length) setColour(info.allowed_colours[0]);
        if (info.allowed_years.length) setRegistrationYear(info.allowed_years[0]);
      })
      .catch(console.error);
  }, [maker]);

  // live clocks
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const jpn = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
      );
      const mng = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Ulaanbaatar" })
      );
      setJapanTime(jpn.toLocaleTimeString());
      setMongoliaTime(mng.toLocaleTimeString());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // logout
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  // batch prediction next 10 years
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPredictedPrice(null);
    setTimeSeriesData([]);

    const base = {
      maker,
      car_name: model,
      chassis_id: chassisId,
      fuel_type: fuelType,
      colour,
      condition: parseFloat(condition),
      engine_size: parseInt(engineSize, 10),
      odometer: parseInt(odometer, 10),
    };
    const start = parseInt(registrationYear, 10);
    const batch = Array.from({ length: 10 }, (_, i) => ({
      ...base,
      registration_year: start + i,
    }));

    try {
      const res = await fetch(`${API_URL}/predict/batch/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch),
      });
      if (!res.ok) throw await res.json();
      const { predicted_prices } = await res.json();
      setPredictedPrice(predicted_prices[0]);
      setTimeSeriesData(
        batch.map((item, idx) => ({
          year: item.registration_year,
          predicted_price: predicted_prices[idx],
        }))
      );
    } catch (err) {
      console.error(err);
      alert("Prediction failed: " + (err.error || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <img src={logo} alt="Logo" style={{ height: 40, marginRight: 12 }} />
            <Typography variant="h6" fontWeight={700} fontSize={20}>
              AutoPredict
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography>Japan: {japanTime}</Typography>
            <Typography>Mongolia: {mongoliaTime}</Typography>
            <Button variant="outlined" color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <CarListings position="left" />
      <CarListings position="right" />

      <Container maxWidth="lg" sx={{ py: 4, mx: "auto" }}>
        <Paper
          elevation={3}
          sx={{ p: 3, mb: 4, textAlign: "center" }}
        >
          <Typography variant="h6" gutterBottom>
            Машиний үнэ таамаглах
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box component="form" onSubmit={handleSearch}>
            <Grid container spacing={2}>
              {/* Maker */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Maker</InputLabel>
                  <Select
                    value={maker}
                    onChange={(e) => setMaker(e.target.value)}
                  >
                    {makers.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Model */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Model</InputLabel>
                  <Select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    {models.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Chassis */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Chassis</InputLabel>
                  <Select
                    value={chassisId}
                    onChange={(e) => setChassisId(e.target.value)}
                  >
                    {chassisIds.map((id) => (
                      <MenuItem key={id} value={id}>
                        {id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Fuel */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Fuel</InputLabel>
                  <Select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                  >
                    {fuels.map((f) => (
                      <MenuItem key={f} value={f}>
                        {f}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Year */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={registrationYear}
                    onChange={(e) => setRegistrationYear(e.target.value)}
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Condition */}
              <Grid item xs={6} sm={6} md={1}>
                <TextField
                  label="Cond."
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  fullWidth
                />
              </Grid>
              {/* Engine */}
              <Grid item xs={6} sm={6} md={1}>
                <TextField
                  label="Engine"
                  type="number"
                  value={engineSize}
                  onChange={(e) => setEngineSize(e.target.value)}
                  fullWidth
                />
              </Grid>
              {/* Odometer */}
              <Grid item xs={6} sm={6} md={1}>
                <TextField
                  label="Odo"
                  type="number"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  fullWidth
                />
              </Grid>
              {/* Colour */}
              <Grid item xs={6} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Colour</InputLabel>
                  <Select
                    value={colour}
                    onChange={(e) => setColour(e.target.value)}
                  >
                    {colours.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Submit */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}>
                  {loading ? "Таамаглаж байна…" : "Таамаглах"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Current Prediction */}
        {predictedPrice !== null && (
          <Paper elevation={3} sx={{ p: 3, mb: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Тооцоолсон үнэ
            </Typography>
            <Typography variant="h4" color="primary">
              ¥ {predictedPrice.toLocaleString()}
            </Typography>
          </Paper>
        )}

        {/* Time-Series Chart */}
        {timeSeriesData.length > 0 && (
          <Box mt={6}>
            <Typography variant="h6" gutterBottom>
              Дараагийн 10 жилийн үнийг таамаглал
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={timeSeriesData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="predicted_price"
                  stroke="#ff5722"
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
        {/* Price Calculator */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Total Cost Calculator
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <PriceCalculator predictedPrice={predictedPrice} />
        </Paper>

      </Container>
    </>
  );
}

export default App;
