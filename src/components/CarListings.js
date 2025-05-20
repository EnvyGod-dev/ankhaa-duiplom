import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Divider,
  Stack,
  Chip,
  Rating,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

const carListings = [
  {
    id: 1,
    image: `${process.env.PUBLIC_URL}/images/camry.jpeg`,
    maker: 'Toyota',
    model: 'Camry',
    year: 2022,
    mileage: '45,000',
    price: '¥2,500,000',
    fuel: 'Petrol',
    condition: '4.5',
  },
  {
    id: 2,
    image: `${process.env.PUBLIC_URL}/images/accord.jpeg`,
    maker: 'Honda',
    model: 'Accord',
    year: 2021,
    mileage: '35,000',
    price: '¥2,300,000',
    fuel: 'Hybrid',
    condition: '4.7',
  },
  {
    id: 3,
    image: `${process.env.PUBLIC_URL}/images/skyline.jpeg`,
    maker: 'Nissan',
    model: 'Skyline',
    year: 2023,
    mileage: '15,000',
    price: '¥4,800,000',
    fuel: 'Hybrid',
    condition: '4.9',
  },
  {
    id: 4,
    image: `${process.env.PUBLIC_URL}/images/nissan-skyline.jpg`,
    maker: 'Nissan',
    model: 'Skyline',
    year: 2020,
    mileage: '55,000',
    price: '¥3,200,000',
    fuel: 'Petrol',
    condition: '4.3',
  },
];

const CarListings = ({ position = 'left' }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        width: isSmall ? '100%' : 300,
        height: isSmall ? 'auto' : '100vh',
        overflowY: 'auto',
        bgcolor: 'background.paper',
        position: isSmall ? 'relative' : 'fixed',
        top: isSmall ? 'auto' : '64px',
        left: !isSmall && position === 'left' ? 0 : 'auto',
        right: !isSmall && position === 'right' ? 0 : 'auto',
        borderRight: !isSmall && position === 'left' ? 1 : 0,
        borderLeft: !isSmall && position === 'right' ? 1 : 0,
        borderColor: 'divider',
        p: 2,
        mb: isSmall ? 2 : 0,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '4px',
          '&:hover': { background: '#555' },
        },
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'primary.main',
          pb: 1,
          textAlign: isSmall ? 'center' : 'left',
        }}
      >
        {position === 'left' ? '🚗 Шинэ зарууд' : '🌟 Онцлох зарууд'}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={2}>
        {carListings.map((car) => (
          <Card
            key={car.id}
            sx={{
              boxShadow: 2,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
              background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
              borderRadius: 2,
            }}
          >
            <CardMedia
              component="img"
              height="160"
              image={car.image}
              alt={`${car.maker} ${car.model}`}
              sx={{
                objectFit: 'cover',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            />
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600, fontSize: '1.1rem' }}
              >
                {car.maker} {car.model}
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                <Chip
                  size="small"
                  icon={<DirectionsCarIcon />}
                  label={car.year}
                  sx={{ borderRadius: '8px' }}
                />
                <Chip
                  size="small"
                  icon={<SpeedIcon />}
                  label={`${car.mileage} km`}
                  sx={{ borderRadius: '8px' }}
                />
                <Chip
                  size="small"
                  icon={<LocalGasStationIcon />}
                  label={car.fuel}
                  sx={{ borderRadius: '8px' }}
                />
              </Stack>
              <Box mt={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Нөхцөл:
                  </Typography>
                  <Rating
                    value={parseFloat(car.condition)}
                    precision={0.1}
                    size="small"
                    readOnly
                  />
                </Stack>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: '1.2rem',
                    textAlign: isSmall ? 'center' : 'right',
                    mt: 1,
                  }}
                >
                  {car.price}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default CarListings;
