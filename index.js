const express = require('express'); 
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json()); 

// Optional: Survey email routes (if Resend configured)
require('./routes/surveyRoutes')(app);

// Serve static files from client build
app.use(express.static(path.join(__dirname, 'client/build')));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
