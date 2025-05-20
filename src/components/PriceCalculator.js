import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

const PriceCalculator = ({ predictedPrice }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const [price, setPrice] = useState(predictedPrice?.toString() || '2500000');
  const [specialTaxInput, setSpecialTaxInput] = useState('6675000');
  const [exchangeRateInput, setExchangeRateInput] = useState('24.95');
  const [serviceChargeInput, setServiceChargeInput] = useState('120000');
  const [usdRateInput, setUsdRateInput] = useState('3560');
  const [transportUsdInput, setTransportUsdInput] = useState('1190');

  const [calculations, setCalculations] = useState({
    basePriceJpy: 0,
    consumptionTaxJpy: 0,
    serviceChargeJpy: 0,
    insuranceJpy: 0,
    advancePaymentJpy: 0,
    basePrice: 0,
    consumptionTax: 0,
    serviceCharge: 0,
    insurance: 0,
    advancePayment: 0,
    transportCost: 0,
    specialTax: 0,
    customsDuty: 0,
    customsVAT: 0,
    totalInMongolia: 0,
    grandTotal: 0,
  });

  const calculatePrices = useCallback(() => {
    const basePrice = parseFloat(price) || 0;
    const exchangeRate = parseFloat(exchangeRateInput) || 24.95;
    const usdRate = parseFloat(usdRateInput) || 3560;
    const transportUsd = parseFloat(transportUsdInput) || 1190;
    const serviceCharge = parseFloat(serviceChargeInput) || 120000;
    const specialTax = parseFloat(specialTaxInput) || 6675000;

    const basePriceMNT = basePrice * exchangeRate;
    const consumptionTaxJpy = basePrice * 0.07;
    const consumptionTaxMNT = consumptionTaxJpy * exchangeRate;
    const serviceChargeMNT = serviceCharge * exchangeRate;
    const insuranceJpy = basePrice * 0.013;
    const insuranceMNT = insuranceJpy * exchangeRate;
    const advancePaymentJpy = basePrice + consumptionTaxJpy + serviceCharge + insuranceJpy;
    const advancePaymentMNT = advancePaymentJpy * exchangeRate;
    const transportCostMNT = transportUsd * usdRate;
    const customsDuty = advancePaymentMNT * 0.05;
    const customsVAT = (basePriceMNT + serviceChargeMNT + insuranceMNT + transportCostMNT) * 0.10;
    const totalInMongolia = transportCostMNT + specialTax + customsDuty + customsVAT;
    const grandTotal = advancePaymentMNT + totalInMongolia;

    setCalculations({
      basePriceJpy: basePrice,
      consumptionTaxJpy,
      serviceChargeJpy: serviceCharge,
      insuranceJpy,
      advancePaymentJpy,
      basePrice: basePriceMNT,
      consumptionTax: consumptionTaxMNT,
      serviceCharge: serviceChargeMNT,
      insurance: insuranceMNT,
      advancePayment: advancePaymentMNT,
      transportCost: transportCostMNT,
      specialTax,
      customsDuty,
      customsVAT,
      totalInMongolia,
      grandTotal,
    });
  }, [
    price,
    exchangeRateInput,
    usdRateInput,
    transportUsdInput,
    serviceChargeInput,
    specialTaxInput,
  ]);

  // recalc whenever any input changes
  useEffect(() => {
    calculatePrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    price,
    exchangeRateInput,
    usdRateInput,
    transportUsdInput,
    serviceChargeInput,
    specialTaxInput,
  ]);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: '#1976d2', textAlign: 'center' }}
      >
        🧾 Үндсэн задаргаа ба тооцоолол
      </Typography>

      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexDirection: isSmall ? 'column' : 'row',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="Таамагласан үнэ"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            size="small"
            sx={{ width: isSmall ? '100%' : 200 }}
          />
          <Typography>иен</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="Иен ханш"
            value={exchangeRateInput}
            onChange={(e) => setExchangeRateInput(e.target.value)}
            type="number"
            size="small"
            sx={{ width: isSmall ? '100%' : 120 }}
          />
          <Typography>₮</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="Үйлчилгээний зардал"
            value={serviceChargeInput}
            onChange={(e) => setServiceChargeInput(e.target.value)}
            type="number"
            size="small"
            sx={{ width: isSmall ? '100%' : 200 }}
          />
          <Typography>иен</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="Доллар ханш"
            value={usdRateInput}
            onChange={(e) => setUsdRateInput(e.target.value)}
            type="number"
            size="small"
            sx={{ width: isSmall ? '100%' : 120 }}
          />
          <Typography>₮</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="Тээврийн зардал"
            value={transportUsdInput}
            onChange={(e) => setTransportUsdInput(e.target.value)}
            type="number"
            size="small"
            sx={{ width: isSmall ? '100%' : 120 }}
          />
          <Typography>$</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="Онцгой албан татвар"
            value={specialTaxInput}
            onChange={(e) => setSpecialTaxInput(e.target.value)}
            type="number"
            size="small"
            sx={{ width: isSmall ? '100%' : 200 }}
          />
          <Typography>₮</Typography>
        </Box>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: isSmall ? 600 : 'auto' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#DAE6F3' }}>
                <TableCell>№</TableCell>
                <TableCell>Тайлбар</TableCell>
                <TableCell align="right">Иен дүн</TableCell>
                <TableCell align="center">Ханш</TableCell>
                <TableCell align="right">Төгрөг дүн</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>Таны оруулж буй үнэ</TableCell>
                <TableCell align="right">
                  {calculations.basePriceJpy.toLocaleString()} иен
                </TableCell>
                <TableCell align="center">{exchangeRateInput}</TableCell>
                <TableCell align="right">
                  {calculations.basePrice.toLocaleString()} ₮
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>Японы худалдааны татвар (7%)</TableCell>
                <TableCell align="right">
                  {calculations.consumptionTaxJpy.toLocaleString()} иен
                </TableCell>
                <TableCell align="center">{exchangeRateInput}</TableCell>
                <TableCell align="right">
                  {calculations.consumptionTax.toLocaleString()} ₮
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>3</TableCell>
                <TableCell>Япон дахь үйлчилгээний зардал</TableCell>
                <TableCell align="right">
                  {calculations.serviceChargeJpy.toLocaleString()} иен
                </TableCell>
                <TableCell align="center">{exchangeRateInput}</TableCell>
                <TableCell align="right">
                  {calculations.serviceCharge.toLocaleString()} ₮
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>4</TableCell>
                <TableCell>Даатгал (1.3%)</TableCell>
                <TableCell align="right">
                  {calculations.insuranceJpy.toLocaleString()} иен
                </TableCell>
                <TableCell align="center">{exchangeRateInput}</TableCell>
                <TableCell align="right">
                  {calculations.insurance.toLocaleString()} ₮
                </TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: '#F0F8FF', fontWeight: 'bold' }}>
                <TableCell colSpan={2}>✅ Урьдчилгаа төлбөрийн нийлбэр</TableCell>
                <TableCell align="right">
                  {calculations.advancePaymentJpy.toLocaleString()} иен
                </TableCell>
                <TableCell align="center">{exchangeRateInput}</TableCell>
                <TableCell align="right">
                  {calculations.advancePayment.toLocaleString()} ₮
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} sx={{ bgcolor: '#E3F2FD', fontWeight: 'bold' }}>
                  🚢 Монголд ирээд гарах зардлууд
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>5</TableCell>
                <TableCell>Тээврийн зардал</TableCell>
                <TableCell align="right">${transportUsdInput}</TableCell>
                <TableCell align="center">{usdRateInput}</TableCell>
                <TableCell align="right">
                  {calculations.transportCost.toLocaleString()} ₮
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>6</TableCell>
                <TableCell>Онцгой албан татвар (ОАТ)</TableCell>
                <TableCell align="right">-</TableCell>
                <TableCell align="center">-</TableCell>
                <TableCell align="right">
                  {calculations.specialTax.toLocaleString()} ₮
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>7</TableCell>
                <TableCell>Гаалийн албан татвар (5%)</TableCell>
                <TableCell align="right">-</TableCell>
                <TableCell align="center">5%</TableCell>
                <TableCell align="right">
                  {calculations.customsDuty.toLocaleString()} ₮
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>8</TableCell>
                <TableCell>Гаалийн НӨАТ (10%)</TableCell>
                <TableCell align="right">-</TableCell>
                <TableCell align="center">10%</TableCell>
                <TableCell align="right">
                  {calculations.customsVAT.toLocaleString()} ₮
                </TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: '#F0F8FF', fontWeight: 'bold' }}>
                <TableCell colSpan={2}>📦 Монголд ирээд төлөх дүн</TableCell>
                <TableCell align="right">-</TableCell>
                <TableCell align="center">-</TableCell>
                <TableCell align="right">
                  {calculations.totalInMongolia.toLocaleString()} ₮
                </TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: '#E3F2FD', fontWeight: 'bold' }}>
                <TableCell colSpan={2}>💰 Нийт гар дээр ирэх нийт үнэ</TableCell>
                <TableCell align="right">-</TableCell>
                <TableCell align="center">-</TableCell>
                <TableCell align="right">
                  {calculations.grandTotal.toLocaleString()} ₮
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default PriceCalculator;
