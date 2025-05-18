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
  Checkbox,
  FormControlLabel,
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

function App() {
  const API_URL = "http://103.50.205.86:8000/api";
  const navigate = useNavigate();

  const [makers, setMakers] = useState([]);
  const [models, setModels] = useState([]);
  const [chassisIds, setChassisIds] = useState([]);
  const [fuels, setFuels] = useState([]);
  const [colours, setColours] = useState([]);
  const [years, setYears] = useState([]);

  const [maker, setMaker] = useState("");
  const [model, setModel] = useState("");
  const [chassisId, setChassisId] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [colour, setColour] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [condition, setCondition] = useState("4.5");
  const [transmission, setTransmission] = useState("Automatic");
  const [steering, setSteering] = useState(false);
  const [engineSize, setEngineSize] = useState(2000);
  const [odometer, setOdometer] = useState(100000);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);

  const [japanTime, setJapanTime] = useState("");
  const [mongoliaTime, setMongoliaTime] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/model-info/`)
      .then((res) => res.json())
      .then((info) => {
        setMakers(info.allowed_makers);
        setFuels(info.allowed_fuel_types);
        setChassisIds(info.allowed_chassis_ids);
        setColours(info.allowed_colours);
        setYears(info.allowed_years);
        setMaker(info.allowed_makers[0]);
        setFuelType(info.allowed_fuel_types[0]);
        setColour(info.allowed_colours[0]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!maker) return;
    fetch(`${API_URL}/model-info/?maker=${encodeURIComponent(maker)}`)
      .then((res) => res.json())
      .then((info) => {
        setModels(info.allowed_car_names);
        setModel(info.allowed_car_names[0]);
      })
      .catch(console.error);
  }, [maker]);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const jpn = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
      const mng = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ulaanbaatar" }));
      setJapanTime(jpn.toLocaleTimeString());
      setMongoliaTime(mng.toLocaleTimeString());
    };
    updateTimes();
    const timer = setInterval(updateTimes, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPredictedPrice(null);
    setComparisonData([]);
    setTimeSeriesData([]);

    const registrationYear = parseInt(yearTo || new Date().getFullYear());
    const basePayload = {
      maker,
      car_name: model,
      chassis_id: chassisId,
      fuel_type: fuelType,
      colour,
      condition: parseFloat(condition),
      engine_size: parseInt(engineSize),
      odometer: parseInt(odometer),
      manufacture_year: parseInt(yearFrom || registrationYear),
      transmission,
      steering: steering ? "LEFT" : "RIGHT",
    };

    try {
      const current = await fetch(`${API_URL}/predict/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...basePayload, registration_year: registrationYear }),
      });
      const currentData = await current.json();
      if (current.ok && currentData.predicted_price) setPredictedPrice(currentData.predicted_price);

      const prevYears = [...Array(5)].map((_, i) => registrationYear - 5 + i);
      const history = await Promise.all(
        prevYears.map((yr) =>
          fetch(`${API_URL}/predict/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...basePayload, registration_year: yr }),
          }).then((res) => res.json().then((d) => ({ registration_year: yr, predicted_price: d.predicted_price })))
        )
      );
      setComparisonData(history);

      const future = await fetch(`${API_URL}/predict/time-series/?periods=5`);
      const forecast = await future.json();
      if (future.ok && forecast.forecast) {
        const mapped = forecast.forecast.map((d) => ({ year: d.ds, predicted_price: d.yhat }));
        setTimeSeriesData(mapped);
      }
    } catch (err) {
      console.error(err);
      alert("Сервертэй холбогдож чадсангүй");
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
            <Typography variant="h6" fontWeight={700} fontSize={20}>AutoPredict</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2">Japan Time {japanTime}</Typography>
            <Typography variant="body2">Mongolian Time {mongoliaTime}</Typography>
            <Button variant="outlined" color="inherit" onClick={handleLogout}>Гарах</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Машины Үнэлгээ</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box component="form" onSubmit={handleSearch}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><FormControl fullWidth><InputLabel>Maker</InputLabel><Select value={maker} onChange={(e) => setMaker(e.target.value)}>{makers.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12} sm={6} md={3}><FormControl fullWidth><InputLabel>Model</InputLabel><Select value={model} onChange={(e) => setModel(e.target.value)}>{models.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12} sm={6} md={3}><FormControl fullWidth><InputLabel>Chassis</InputLabel><Select value={chassisId} onChange={(e) => setChassisId(e.target.value)}>{chassisIds.map((id) => <MenuItem key={id} value={id}>{id}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12} sm={6} md={3}><FormControl fullWidth><InputLabel>Fuel</InputLabel><Select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>{fuels.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={6} sm={6} md={2}><FormControl fullWidth><InputLabel>Year From</InputLabel><Select value={yearFrom} onChange={(e) => setYearFrom(e.target.value)}>{years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={6} sm={6} md={2}><FormControl fullWidth><InputLabel>Year To</InputLabel><Select value={yearTo} onChange={(e) => setYearTo(e.target.value)}>{years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12} sm={6} md={2}><FormControl fullWidth><InputLabel>Color</InputLabel><Select value={colour} onChange={(e) => setColour(e.target.value)}>{colours.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={6} sm={6} md={2}><TextField label="Condition" fullWidth value={condition} onChange={(e) => setCondition(e.target.value)} /></Grid>
              <Grid item xs={6} sm={6} md={2}><TextField label="Engine Size" type="number" fullWidth value={engineSize} onChange={(e) => setEngineSize(e.target.value)} /></Grid>
              <Grid item xs={6} sm={6} md={2}><TextField label="Odometer" type="number" fullWidth value={odometer} onChange={(e) => setOdometer(e.target.value)} /></Grid>
              <Grid item xs={6} sm={6} md={3}><FormControlLabel control={<Checkbox checked={steering} onChange={(e) => setSteering(e.target.checked)} />} label="Left Hand Drive" /></Grid>
              <Grid item xs={6} sm={6} md={3}><FormControlLabel control={<Checkbox checked={transmission === "Automatic"} onChange={(e) => setTransmission(e.target.checked ? "Automatic" : "Manual")} />} label="Automatic" /></Grid>
              <Grid item xs={12}><Button type="submit" variant="contained" fullWidth disabled={loading} startIcon={loading && <CircularProgress size={20} />}>{loading ? "Таамаглаж байна..." : "Таамаглах"}</Button></Grid>
            </Grid>
          </Box>

          {predictedPrice && (<Box mt={4} textAlign="center"><Typography variant="h5">Таамагласан үнэ: ¥{Number(predictedPrice).toLocaleString()}</Typography></Box>)}

          {/* {comparisonData.length > 0 && (<Box mt={6}><Typography variant="h6" gutterBottom>Харьцуулалтын график</Typography><ResponsiveContainer width="100%" height={300}><LineChart data={comparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="registration_year" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="predicted_price" stroke="#1976d2" activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></Box>)} */}

          {timeSeriesData.length > 0 && (<Box mt={6}><Typography variant="h6" gutterBottom>Цаг хугацааны таамаглал</Typography><ResponsiveContainer width="100%" height={300}><LineChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="predicted_price" stroke="#ff5722" activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></Box>)}
        </Paper>
      </Container>
    </>
  );
}

export default App;
