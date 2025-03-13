const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the serverside!', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint...');
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
});

// app.post('/api/v1/tours', (req, res) => {
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);

//   tours.push(newTour);

//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       if (err) {
//         console.error('Error writing file:', err);
//         return res
//           .status(500)
//           .json({ status: 'fail', message: 'Could not write file' });
//       }
//       res.status(201).json({ status: 'success', data: { tour: newTour } });
//     }
//   );
// });

app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  try {
    fs.writeFileSync(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours)
    );
    res.status(201).json({ status: 'success', data: { tour: newTour } });
  } catch (err) {
    console.error('Error writing file:', err);
    res
      .status(500)
      .json({
        status: 'fail',
        message: 'Could not write file',
        error: err.message,
      });
  }
});
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
