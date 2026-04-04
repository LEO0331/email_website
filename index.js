const express = require('express'); 
const path = require('path');

const app = express();
app.use(express.json()); 

// Serve static files from client build
app.use(express.static(path.join(__dirname, 'client/build')));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
