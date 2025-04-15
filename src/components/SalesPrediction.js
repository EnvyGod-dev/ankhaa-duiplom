import React, { useState, useEffect } from "react";

function SalesPrediction() {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState("");
  const [odometer, setOdometer] = useState("");
  const [predictedPrice, setPredictedPrice] = useState(null);

  // Backend-с машины жагсаалтыг авах
  useEffect(() => {
    fetch("http://103.50.205.42:8000/api/cars/")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched cars:", data);  // Алдааг шалгахын тулд лог гаргах
        setCars(data);
      })
      .catch((error) => console.error("Error fetching car list:", error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestData = {
      car_name: selectedCar,
      odometer: parseInt(odometer, 10),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/predict/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      setPredictedPrice(data.predicted_price);
    } catch (error) {
      console.error("Error predicting price:", error);
    }
  };

  return (
    <div>
      <h1>Автомашины үнэ, үнэлгээний таамаг</h1>
      <form onSubmit={handleSubmit}>
        <label>Автомашин сонгох:</label>
        <select value={selectedCar} onChange={(e) => setSelectedCar(e.target.value)}>
          <option value="">Сонгох...</option>
          {cars.map((car, index) => (
            <option key={index} value={car.car_name}>
              {car.car_name}
            </option>
          ))}
        </select>

        <br />
        <label>Км гүйлт:</label>
        <input
          type="number"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
        />

        <br />
        <button type="submit">Таамаглах</button>
      </form>

      {predictedPrice && <h2>Таамагласан үнэ: {predictedPrice}₮</h2>}
    </div>
  );
}

export default SalesPrediction;
