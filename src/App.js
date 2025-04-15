import React, { useState, useEffect } from "react";

function App() {
  const [selectedCar, setSelectedCar] = useState("");
  const [maker, setMaker] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [mileage, setMileage] = useState("");
  const [engineSize, setEngineSize] = useState(1500);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState({
    makers: [],
    cars: [],
    fuels: [],
  });

  const API_URL = "http://103.50.205.42:8000/api";

  useEffect(() => {
    fetch(`${API_URL}/model-info/`)
      .then((res) => res.json())
      .then((info) => {
        setModelInfo({
          makers: info.allowed_makers,
          cars: info.allowed_car_names,
          fuels: info.allowed_fuel_types,
        });

        // Set defaults
        setMaker(info.allowed_makers[0]);
        setFuelType(info.allowed_fuel_types[0]);
        setSelectedCar(info.allowed_car_names[0]);
      })
      .catch((err) => console.error("Model info load error:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    try {
      const response = await fetch(`${API_URL}/predict/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registration_year: 2022,
          manufacture_year: 2022,
          maker: maker,
          car_name: selectedCar,
          fuel_type: fuelType,
          engine_size: parseInt(engineSize),
          odometer: parseInt(mileage),
        }),
      });

      const data = await response.json();
      setPrediction(data.predicted_price || "Алдаа гарлаа!");
    } catch (error) {
      console.error("Error fetching prediction:", error);
      setPrediction("Алдаа гарлаа!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Автомашины үнэ, үнэлгээний таамаг</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label>
          Машины нэр:
          <select
            value={selectedCar}
            onChange={(e) => setSelectedCar(e.target.value)}
            required
            style={styles.input}
          >
            {modelInfo.cars.map((car, index) => (
              <option key={index} value={car}>
                {car}
              </option>
            ))}
          </select>
        </label>

        <label>
          Үйлдвэрлэгч:
          <select
            value={maker}
            onChange={(e) => setMaker(e.target.value)}
            required
            style={styles.input}
          >
            {modelInfo.makers.map((m, index) => (
              <option key={index} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label>
          Түлшний төрөл:
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            required
            style={styles.input}
          >
            {modelInfo.fuels.map((fuel, index) => (
              <option key={index} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
        </label>

        <label>
          Хөдөлгүүрийн багтаамж (cc):
          <input
            type="number"
            value={engineSize}
            onChange={(e) => setEngineSize(e.target.value)}
            required
            style={styles.input}
          />
        </label>

        <label>
          Км гүйлт:
          <input
            type="number"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            required
            style={styles.input}
          />
        </label>

        <button type="submit" style={styles.button}>
          {loading ? "Болж байна..." : "Таамаглах"}
        </button>
      </form>

      {prediction && (
        <div style={styles.result}>
          <h2>Таамагласан үнэ: {prediction}₮</h2>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    maxWidth: "400px",
    margin: "auto",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  result: {
    marginTop: "20px",
    padding: "10px",
    borderRadius: "5px",
    backgroundColor: "#f8f9fa",
  },
};

export default App;
